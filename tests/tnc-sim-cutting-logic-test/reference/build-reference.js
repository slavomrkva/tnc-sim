const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const cp = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const SPEC = JSON.parse(fs.readFileSync(path.join(__dirname, 'oracle-spec.json'), 'utf8'));
const PROGRAM_FILE = path.join(ROOT, 'test.h');
const TOOL_FILE = path.join(ROOT, 'test.tnt');
const PROGRAM = fs.readFileSync(PROGRAM_FILE, 'utf8');
const TOOLS = JSON.parse(fs.readFileSync(TOOL_FILE, 'utf8'));
const TOOL_MAP = new Map(TOOLS.map((tool) => [tool.T, tool]));

const WEB_REPO = process.env.TNC_SIM_WEB || 'C:\\Users\\sl\\tnc-sim\\tnc-sim-web';
const ANDROID_REPO = process.env.TNC_SIM_ANDROID || 'C:\\Users\\sl\\tnc-sim\\tnc-sim-android-github-main-2026-07-17-6bddc4eb04';
const DOCS = process.env.TNC_SIM_DOCS || 'C:\\Users\\sl\\Documents\\MEGA\\Rozne\\TNCSIM\\Docs';

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').toUpperCase();
}

function sha256Content(content) {
  return crypto.createHash('sha256').update(content).digest('hex').toUpperCase();
}

function git(repo, args) {
  return cp.execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();
}

function repositoryEvidence(repo) {
  const branch = git(repo, ['branch', '--show-current']);
  const head = git(repo, ['rev-parse', 'HEAD']);
  const remote = git(repo, ['rev-parse', 'origin/main']);
  const status = git(repo, ['status', '--porcelain']);
  if (branch !== 'main' || status) {
    throw new Error(`Repository preflight failed for ${repo}: branch=${branch}, clean=${!status}`);
  }
  return { repo, branch, localHead: head, sourceRef: 'origin/main', sourceCommit: remote, localHeadEqualsSource: head === remote, clean: true };
}

function sourceAtOriginMain(repo, relativeFile) {
  const gitPath = relativeFile.split(path.sep).join('/');
  return cp.execFileSync('git', ['-C', repo, 'show', `origin/main:${gitPath}`], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
}

function expectedRadiusAtZ(witness, z) {
  const height = z - witness.tipZ;
  if (height < 0) return 0;
  if (witness.shape === 'flat' || witness.shape === 'pocket') return witness.radius;
  if (witness.shape === 'ball') {
    if (height >= witness.radius) return witness.radius;
    return Math.sqrt(Math.max(0, witness.radius ** 2 - (witness.radius - height) ** 2));
  }
  const tangent = Math.tan((witness.angle / 2) * Math.PI / 180);
  if (witness.shape === 'drill') return Math.min(witness.radius, height * tangent);
  return Math.min(witness.lcuts * tangent, (witness.tipRadius || 0) + height * tangent);
}

function expectedFloor(witness, offset) {
  const distance = Math.abs(offset);
  if (witness.shape === 'flat' || witness.shape === 'pocket') return witness.tipZ;
  if (witness.shape === 'ball') {
    if (distance > witness.radius) return null;
    return witness.tipZ + witness.radius - Math.sqrt(Math.max(0, witness.radius ** 2 - distance ** 2));
  }
  const tangent = Math.tan((witness.angle / 2) * Math.PI / 180);
  const startRadius = witness.shape === 'drill' ? 0 : (witness.tipRadius || 0);
  return witness.tipZ + Math.max(0, distance - startRadius) / tangent;
}

function buildOracle() {
  return {
    format: 'tnc-sim-independent-geometry-oracle-result-v1',
    generatedFrom: {
      program: { file: 'test.h', sha256: sha256(PROGRAM_FILE) },
      toolTable: { file: 'test.tnt', sha256: sha256(TOOL_FILE) },
      sources: SPEC.sources.map((source) => {
        const file = path.join(DOCS, source.file);
        const actualHash = sha256(file);
        if (actualHash !== source.sha256) throw new Error(`Documentation hash mismatch: ${source.file}`);
        return { ...source, verifiedSha256: actualHash };
      }),
    },
    rules: SPEC.rules,
    witnesses: SPEC.witnesses.map((witness) => {
      const radiusAtProbe = expectedRadiusAtZ(witness, witness.zProbe);
      return {
        id: witness.id,
        tool: witness.tool,
        expected: {
          centerY: witness.centerY,
          tipZ: witness.tipZ,
          widthAtProbeZ: 2 * radiusAtProbe,
          probeZ: witness.zProbe,
          profile: witness.profileOffsets.map((offset) => ({ offset, floorZ: expectedFloor(witness, offset) })),
          pathCenterY: witness.path?.expectedY ?? null,
        },
      };
    }),
    feedChecks: SPEC.feedChecks,
  };
}

function makeContext(parserSource, voxelSource, labels) {
  const quietConsole = { log() {}, warn() {}, error() {} };
  const context = {
    console: quietConsole,
    TOOL_R: 5,
    DEFAULT_FEED: 100,
    probs: [],
    window: {},
    document: { getElementById() { return null; } },
    pFloat(value) { return parseFloat(String(value).replace(',', '.')) || 0; },
    inferToolType(tool) { return tool?.TYPE || 'MILL'; },
    getToolByNum(number) { return TOOL_MAP.get(number) || null; },
    VX: null,
    VX_RES: SPEC.grid.requestedResolution,
    VX_QUALITY: SPEC.grid.qualityIndex,
    scene: { add() {}, remove() {} },
    blockMesh: null,
    blockEdges: null,
    applyStockVisibility() {},
    THREE_OK: false,
    rapidBuf: null,
    feedBuf: null,
    currentToolNum: 0,
    currentSpindleOn: false,
    currentCoolantOn: false,
    pendingToolNum: 0,
    currentSpindle: 0,
    toolGroup: null,
    atcAnim: false,
    startATC() {},
    showPendingTool() {},
    updateStatus() {},
  };
  vm.createContext(context);
  vm.runInContext(parserSource, context, { filename: labels.parser });
  vm.runInContext(voxelSource, context, { filename: labels.voxel });
  context.vxBuildMesh = () => ({ traverse() {} });
  return context;
}

function nearest(value, origin, step, max) {
  return Math.max(0, Math.min(max - 1, Math.round((value - origin) / step)));
}

function cutFloorAt(vx, x, y, zMin = 0, zMax = 20) {
  const ix = nearest(x, vx.ox, vx.dx, vx.nx);
  const iy = nearest(y, vx.oy, vx.dy, vx.ny);
  const iz0 = Math.max(1, nearest(zMin, vx.oz, vx.dz, vx.nz));
  const iz1 = nearest(zMax, vx.oz, vx.dz, vx.nz);
  for (let iz = iz0; iz <= iz1; iz += 1) {
    const index = iz * vx.ny * vx.nx + iy * vx.nx + ix;
    if (vx.grid[index] === 0) return vx.oz + iz * vx.dz;
  }
  return null;
}

function widthAt(vx, x, centerY, z, halfWindow) {
  const ix = nearest(x, vx.ox, vx.dx, vx.nx);
  const iz = nearest(z, vx.oz, vx.dz, vx.nz);
  const iy0 = nearest(centerY - halfWindow, vx.oy, vx.dy, vx.ny);
  const iy1 = nearest(centerY + halfWindow, vx.oy, vx.dy, vx.ny);
  const cutRows = [];
  for (let iy = iy0; iy <= iy1; iy += 1) {
    const index = iz * vx.ny * vx.nx + iy * vx.nx + ix;
    if (vx.grid[index] === 0) cutRows.push(iy);
  }
  if (!cutRows.length) return { width: null, centerY: null, minY: null, maxY: null };
  const runs = [];
  let start = cutRows[0];
  let end = cutRows[0];
  for (const row of cutRows.slice(1)) {
    if (row === end + 1) end = row;
    else { runs.push({ start, end }); start = row; end = row; }
  }
  runs.push({ start, end });
  const expectedRow = nearest(centerY, vx.oy, vx.dy, vx.ny);
  const selected = runs.find((run) => expectedRow >= run.start && expectedRow <= run.end)
    || runs.sort((a, b) => Math.abs((a.start + a.end) / 2 - expectedRow) - Math.abs((b.start + b.end) / 2 - expectedRow))[0];
  const minY = vx.oy + selected.start * vx.dy;
  const maxY = vx.oy + selected.end * vx.dy;
  const minIndex = iz * vx.ny * vx.nx + selected.start * vx.nx + ix;
  const maxIndex = iz * vx.ny * vx.nx + selected.end * vx.nx + ix;
  return {
    minY,
    maxY,
    width: maxY - minY,
    centerY: (minY + maxY) / 2,
    boundaryToolNumbers: { minY: vx.cut[minIndex], maxY: vx.cut[maxIndex] },
  };
}

function pathCenterAt(sub, witness) {
  if (!witness.path) return null;
  const candidates = sub.filter((segment) => {
    if (segment.rapid || segment.toolNum !== witness.tool || segment.rc !== witness.path.side) return false;
    const minX = Math.min(segment.from.x, segment.to.x) - 1e-9;
    const maxX = Math.max(segment.from.x, segment.to.x) + 1e-9;
    return witness.probeX >= minX && witness.probeX <= maxX && Math.abs(segment.to.x - segment.from.x) > 1;
  });
  if (!candidates.length) return null;
  const segment = candidates.sort((a, b) => Math.abs(b.to.x - b.from.x) - Math.abs(a.to.x - a.from.x))[0];
  const t = (witness.probeX - segment.from.x) / (segment.to.x - segment.from.x);
  return segment.from.y + (segment.to.y - segment.from.y) * t;
}

function observeFeeds(sub) {
  return SPEC.feedChecks.map((check) => {
    let segments = sub.filter((segment) => segment.toolNum === check.tool && !segment.rapid && !segment.cycleEvent);
    if (check.sourceContains) {
      const sourceLine = PROGRAM.split(/\r?\n/).findIndex((line) => line.includes(check.sourceContains));
      segments = segments.filter((segment) => segment.srcLine === sourceLine);
    } else if (check.cycle) {
      segments = segments.filter((segment) => check.direction === 'down' ? segment.to.z < segment.from.z - 1e-6 : segment.to.z > segment.from.z + 1e-6);
    }
    const feeds = [...new Set(segments.map((segment) => segment.feed).filter(Number.isFinite))].sort((a, b) => a - b);
    return { id: check.id, expectedFeed: check.expectedFeed, observedFeeds: feeds, includesExpected: feeds.some((feed) => Math.abs(feed - check.expectedFeed) < 1e-9) };
  });
}

function simulate(name, repo, coreDir) {
  const parserRelative = path.join(coreDir, 'parser-engine.js');
  const voxelRelative = path.join(coreDir, 'voxel-cutting.js');
  const parserSource = sourceAtOriginMain(repo, parserRelative);
  const voxelSource = sourceAtOriginMain(repo, voxelRelative);
  const context = makeContext(parserSource, voxelSource, { parser: `${name}:origin/main:${parserRelative}`, voxel: `${name}:origin/main:${voxelRelative}` });
  const validation = Array.from(context.validateProgram(PROGRAM) || [], (problem) => ({ sev: problem.sev, line: problem.line, msg: problem.msg }));
  const parsed = context.parseProgram(PROGRAM);
  const parseProblems = Array.from(parsed.problems || [], (problem) => ({ sev: problem.sev, line: problem.line, msg: problem.msg }));
  const errors = [...validation, ...parseProblems].filter((problem) => problem.sev === 'err');
  if (errors.length) throw new Error(`${name} parser errors: ${JSON.stringify(errors)}`);
  context.prog = parsed;
  context.vxInit(parsed);
  for (const segment of parsed.sub) context.commitSeg(segment);
  const vx = context.VX;
  const witnesses = SPEC.witnesses.map((witness) => {
    const width = widthAt(vx, witness.probeX, witness.centerY, witness.zProbe, witness.scanHalf);
    const pathCenterY = pathCenterAt(parsed.sub, witness);
    return {
      id: witness.id,
      tool: witness.tool,
      observed: {
        pathCenterY,
        pathDiagnostic: pathCenterY == null && witness.path ? parsed.sub.filter((segment) => segment.toolNum === witness.tool && !segment.rapid && Math.abs(segment.to.x - segment.from.x) > 1).map((segment) => ({ rc: segment.rc, from: segment.from, to: segment.to, srcLine: segment.srcLine })) : null,
        centerYAtProbe: width.centerY,
        widthAtProbeZ: width.width,
        probeZ: witness.zProbe,
        minY: width.minY,
        maxY: width.maxY,
        boundaryToolNumbers: width.boundaryToolNumbers || null,
        profile: witness.profileOffsets.map((offset) => ({ offset, floorZ: cutFloorAt(vx, witness.probeX, witness.centerY + offset) })),
      },
    };
  });
  return {
    format: 'tnc-sim-voxel-observation-v1',
    platform: name,
    repository: repositoryEvidence(repo),
    inputs: { programSha256: sha256(PROGRAM_FILE), toolTableSha256: sha256(TOOL_FILE), parserSha256: sha256Content(parserSource), voxelSha256: sha256Content(voxelSource) },
    grid: { nx: vx.nx, ny: vx.ny, nz: vx.nz, dx: vx.dx, dy: vx.dy, dz: vx.dz, origin: { x: vx.ox, y: vx.oy, z: vx.oz } },
    parser: { validation, parseProblems, segmentCount: parsed.sub.length },
    witnesses,
    feedChecks: observeFeeds(parsed.sub),
  };
}

function compare(oracle, observations) {
  const platforms = observations.map((observation) => {
    const results = oracle.witnesses.map((expectedItem) => {
      const observedItem = observation.witnesses.find((item) => item.id === expectedItem.id);
      const expected = expectedItem.expected;
      const observed = observedItem.observed;
      const cell = observation.grid;
      const differences = [];
      if (expected.pathCenterY != null && (observed.pathCenterY == null || Math.abs(observed.pathCenterY - expected.pathCenterY) > 1e-6)) {
        differences.push(`path center Y expected ${expected.pathCenterY}, observed ${observed.pathCenterY}`);
      }
      if (observed.centerYAtProbe == null || Math.abs(observed.centerYAtProbe - expected.centerY) > cell.dy) {
        differences.push(`voxel center Y expected ${expected.centerY}, observed ${observed.centerYAtProbe}, tolerance ${cell.dy}`);
      }
      if (observed.widthAtProbeZ == null || Math.abs(observed.widthAtProbeZ - expected.widthAtProbeZ) > 2 * cell.dy) {
        differences.push(`width expected ${expected.widthAtProbeZ}, observed ${observed.widthAtProbeZ}, tolerance ${2 * cell.dy}`);
      }
      for (const expectedPoint of expected.profile) {
        const observedPoint = observed.profile.find((point) => point.offset === expectedPoint.offset);
        if (expectedPoint.floorZ == null) continue;
        if (!observedPoint || observedPoint.floorZ == null) {
          differences.push(`profile offset ${expectedPoint.offset}: no cut observed`);
          continue;
        }
        const witness = SPEC.witnesses.find((item) => item.id === expectedItem.id);
        const coneLateral = ['countersink', 'drill'].includes(witness.shape)
          ? cell.dy / Math.max(Math.tan((witness.angle / 2) * Math.PI / 180), 1e-9)
          : 0;
        const ballLateral = witness.shape === 'ball' && Math.abs(expectedPoint.offset) < witness.radius
          ? cell.dy * Math.abs(expectedPoint.offset) / Math.max(Math.sqrt(witness.radius ** 2 - expectedPoint.offset ** 2), 1e-9)
          : 0;
        const toleranceZ = 1.1 * cell.dz + coneLateral + ballLateral;
        if (Math.abs(observedPoint.floorZ - expectedPoint.floorZ) > toleranceZ) {
          differences.push(`profile offset ${expectedPoint.offset}: floor expected ${expectedPoint.floorZ}, observed ${observedPoint.floorZ}, tolerance ${toleranceZ}`);
        }
      }
      return { id: expectedItem.id, status: differences.length ? 'FAIL' : 'PASS', differences };
    });
    const feedResults = observation.feedChecks.map((feed) => ({ id: feed.id, status: feed.includesExpected ? 'PASS' : 'FAIL', expectedFeed: feed.expectedFeed, observedFeeds: feed.observedFeeds }));
    const failCount = [...results, ...feedResults].filter((item) => item.status === 'FAIL').length;
    return { platform: observation.platform, status: failCount ? 'FAIL' : 'PASS', results, feedResults, summary: { pass: results.length + feedResults.length - failCount, fail: failCount } };
  });
  return { format: 'tnc-sim-reference-comparison-v1', status: platforms.every((item) => item.status === 'PASS') ? 'PASS' : 'FAIL', platforms };
}

function markdown(comparison, observations) {
  const lines = ['# Cutting-logic reference comparison', '', `Overall: **${comparison.status}**`, ''];
  for (const platform of comparison.platforms) {
    const observation = observations.find((item) => item.platform === platform.platform);
    lines.push(`## ${platform.platform}`, '', `Grid cell: X ${observation.grid.dx.toFixed(6)} mm, Y ${observation.grid.dy.toFixed(6)} mm, Z ${observation.grid.dz.toFixed(6)} mm.`, '', '| Result | Witness | Difference |', '|---|---|---|');
    for (const result of platform.results) lines.push(`| ${result.status} | ${result.id} | ${result.differences.join('; ') || ''} |`);
    for (const result of platform.feedResults) lines.push(`| ${result.status} | ${result.id} | expected ${result.expectedFeed}; observed ${result.observedFeeds.join(', ')} |`);
    lines.push('');
  }
  lines.push('The oracle is derived from the cited documentation, the NC program and Tool Table geometry. Current simulator output is only the observed side of the comparison.');
  return `${lines.join('\n')}\n`;
}

function main() {
  fs.mkdirSync(path.join(__dirname, 'generated'), { recursive: true });
  const approvedFile = path.join(__dirname, 'generated', 'approved-reference.json');
  if (fs.existsSync(approvedFile)) fs.unlinkSync(approvedFile);
  const oracle = buildOracle();
  const web = simulate('web', WEB_REPO, 'core');
  const android = simulate('android', ANDROID_REPO, path.join('www', 'core'));
  const observations = [web, android];
  const comparison = compare(oracle, observations);
  const generated = path.join(__dirname, 'generated');
  fs.writeFileSync(path.join(generated, 'oracle.json'), `${JSON.stringify(oracle, null, 2)}\n`);
  fs.writeFileSync(path.join(generated, 'observed-web.json'), `${JSON.stringify(web, null, 2)}\n`);
  fs.writeFileSync(path.join(generated, 'observed-android.json'), `${JSON.stringify(android, null, 2)}\n`);
  fs.writeFileSync(path.join(generated, 'comparison.json'), `${JSON.stringify(comparison, null, 2)}\n`);
  fs.writeFileSync(path.join(generated, 'report.md'), markdown(comparison, observations));
  if (comparison.status === 'PASS') {
    fs.writeFileSync(approvedFile, `${JSON.stringify({ approved: true, oracle, observations, comparison }, null, 2)}\n`);
  }
  console.log(`Reference comparison: ${comparison.status}`);
  for (const platform of comparison.platforms) console.log(`${platform.platform}: ${platform.summary.pass} PASS, ${platform.summary.fail} FAIL`);
  if (comparison.status !== 'PASS') process.exitCode = 1;
}

main();
