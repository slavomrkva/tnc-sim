const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const cp = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const SPEC = JSON.parse(fs.readFileSync(path.join(__dirname, 'oracle-spec.json'), 'utf8'));
const PROGRAM_FILE = path.join(ROOT, 'test.h');
const TOOL_FILE = path.join(ROOT, 'test.tnt');
const EXPECTED_VOXEL_FILE = path.join(ROOT, 'expected-voxel.json');
const PROGRAM = fs.readFileSync(PROGRAM_FILE, 'utf8');
const TOOLS = JSON.parse(fs.readFileSync(TOOL_FILE, 'utf8'));
const EXPECTED_VOXEL = JSON.parse(fs.readFileSync(EXPECTED_VOXEL_FILE, 'utf8'));
const TOOL_MAP = new Map(TOOLS.map((tool) => [tool.T, tool]));

const WEB_REPO = process.env.TNC_SIM_WEB || 'C:\\Users\\sl\\tnc-sim\\tnc-sim-web';
const ANDROID_REPO = process.env.TNC_SIM_ANDROID || 'C:\\Users\\sl\\tnc-sim\\tnc-sim-android-github-main-2026-07-17-6bddc4eb04';
const WEB_SOURCE_REF = process.env.TNC_SIM_WEB_REF || 'origin/main';
const ANDROID_SOURCE_REF = process.env.TNC_SIM_ANDROID_REF || 'origin/main';
const DOCS = process.env.TNC_SIM_DOCS || 'C:\\Users\\sl\\Documents\\MEGA\\Rozne\\TNCSIM\\Docs';
const DOCS_MODE = process.env.TNC_SIM_DOCS_MODE || 'verify-files';
const ALLOW_DIRTY = process.env.TNC_SIM_ALLOW_DIRTY === '1';

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').toUpperCase();
}

function sha256NormalizedText(file) {
  const content = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  return crypto.createHash('sha256').update(content).digest('hex').toUpperCase();
}

function sha256Content(content) {
  return crypto.createHash('sha256').update(content).digest('hex').toUpperCase();
}

function verifyLockedInput(label, actual, expected) {
  if (!expected) throw new Error(`Missing locked input hash for ${label}`);
  if (actual !== expected) throw new Error(`Locked input hash mismatch for ${label}: expected ${expected}, observed ${actual}`);
}

function git(repo, args) {
  return cp.execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();
}

function repositoryEvidence(repo, sourceRef) {
  const branch = git(repo, ['branch', '--show-current']);
  const head = git(repo, ['rev-parse', 'HEAD']);
  const status = git(repo, ['status', '--porcelain']);
  const worktreeSource = sourceRef === 'WORKTREE';
  if (worktreeSource && status && !ALLOW_DIRTY) {
    throw new Error(`Repository preflight failed for ${repo}: WORKTREE is dirty and TNC_SIM_ALLOW_DIRTY is not enabled`);
  }
  const sourceCommit = worktreeSource ? head : git(repo, ['rev-parse', sourceRef]);
  return { repo, branch, localHead: head, sourceRef, sourceCommit, localHeadEqualsSource: worktreeSource ? !status : head === sourceCommit, clean: !status, dirtyWorktreeAllowed: !!status && worktreeSource && ALLOW_DIRTY };
}

function sourceAtRef(repo, relativeFile, sourceRef) {
  if (sourceRef === 'WORKTREE') return fs.readFileSync(path.join(repo, relativeFile), 'utf8');
  const gitPath = relativeFile.split(path.sep).join('/');
  return cp.execFileSync('git', ['-C', repo, 'show', `${sourceRef}:${gitPath}`], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
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

function buildAllowedZones() {
  const witnessById = new Map(SPEC.witnesses.map((witness) => [witness.id, witness]));
  const zones = EXPECTED_VOXEL.zones.map((zone) => {
    const witness = witnessById.get(zone.id);
    if (!witness) throw new Error(`expected-voxel zone ${zone.id} has no oracle witness`);
    if (zone.tool !== witness.tool) throw new Error(`Tool mismatch for zone ${zone.id}: expected-voxel T${zone.tool}, oracle T${witness.tool}`);
    let bounds = zone.allowedBounds || zone.bounds;
    if (!bounds && zone.center) {
      if (!(witness.scanHalf > 0)) throw new Error(`Zone ${zone.id} needs bounds or a positive witness scanHalf`);
      bounds = {
        x: [zone.center.x - witness.scanHalf, zone.center.x + witness.scanHalf],
        y: [zone.center.y - witness.scanHalf, zone.center.y + witness.scanHalf],
      };
    }
    const validAxis = (axis) => Array.isArray(axis) && axis.length === 2 && axis.every(Number.isFinite) && axis[0] <= axis[1];
    if (!bounds || !validAxis(bounds.x) || !validAxis(bounds.y)) throw new Error(`Zone ${zone.id} has invalid XY bounds`);
    return { id: zone.id, tool: zone.tool, bounds };
  });
  const zoneIds = new Set(zones.map((zone) => zone.id));
  if (zoneIds.size !== zones.length) throw new Error('expected-voxel contains duplicate zone IDs');
  for (const witness of SPEC.witnesses) {
    if (!zoneIds.has(witness.id)) throw new Error(`Oracle witness ${witness.id} has no expected-voxel zone`);
  }
  return zones;
}

function scanUnexpectedCuts(vx, allowedZones, sampleLimit = 20) {
  let cutVoxelCount = 0;
  let unexpectedCutCount = 0;
  let wrongToolCount = 0;
  const unexpectedSamples = [];
  const wrongToolSamples = [];
  const unexpectedByTool = {};
  for (let iz = 0; iz < vx.nz; iz += 1) {
    const z = vx.oz + iz * vx.dz;
    for (let iy = 0; iy < vx.ny; iy += 1) {
      const y = vx.oy + iy * vx.dy;
      for (let ix = 0; ix < vx.nx; ix += 1) {
        const index = iz * vx.ny * vx.nx + iy * vx.nx + ix;
        const tool = vx.cut[index];
        if (!tool) continue;
        cutVoxelCount += 1;
        const x = vx.ox + ix * vx.dx;
        const matchingZones = allowedZones.filter((zone) => x >= zone.bounds.x[0] && x <= zone.bounds.x[1] && y >= zone.bounds.y[0] && y <= zone.bounds.y[1]);
        if (!matchingZones.length) {
          unexpectedCutCount += 1;
          const aggregate = unexpectedByTool[tool] || { count: 0, minX: x, maxX: x, minY: y, maxY: y, minZ: z, maxZ: z };
          aggregate.count += 1;
          aggregate.minX = Math.min(aggregate.minX, x);
          aggregate.maxX = Math.max(aggregate.maxX, x);
          aggregate.minY = Math.min(aggregate.minY, y);
          aggregate.maxY = Math.max(aggregate.maxY, y);
          aggregate.minZ = Math.min(aggregate.minZ, z);
          aggregate.maxZ = Math.max(aggregate.maxZ, z);
          unexpectedByTool[tool] = aggregate;
          if (unexpectedSamples.length < sampleLimit) unexpectedSamples.push({ x, y, z, tool });
        } else if (tool !== 255 && !matchingZones.some((zone) => zone.tool === tool)) {
          wrongToolCount += 1;
          if (wrongToolSamples.length < sampleLimit) wrongToolSamples.push({ x, y, z, tool, zones: matchingZones.map((zone) => zone.id) });
        }
      }
    }
  }
  return { cutVoxelCount, unexpectedCutCount, wrongToolCount, unexpectedByTool, unexpectedSamples, wrongToolSamples };
}

function buildOracle() {
  const inputHashes = {
    programSha256: sha256NormalizedText(PROGRAM_FILE),
    toolTableSha256: sha256NormalizedText(TOOL_FILE),
    expectedVoxelSha256: sha256NormalizedText(EXPECTED_VOXEL_FILE),
  };
  verifyLockedInput('test.h', inputHashes.programSha256, SPEC.inputs?.programSha256);
  verifyLockedInput('test.tnt', inputHashes.toolTableSha256, SPEC.inputs?.toolTableSha256);
  verifyLockedInput('expected-voxel.json', inputHashes.expectedVoxelSha256, SPEC.inputs?.expectedVoxelSha256);
  return {
    format: 'tnc-sim-independent-geometry-oracle-result-v1',
    generatedFrom: {
      program: { file: 'test.h', sha256: inputHashes.programSha256 },
      toolTable: { file: 'test.tnt', sha256: inputHashes.toolTableSha256 },
      expectedVoxel: { file: 'expected-voxel.json', sha256: inputHashes.expectedVoxelSha256 },
      sources: SPEC.sources.map((source) => {
        if (DOCS_MODE === 'locked-spec') {
          return { ...source, verification: 'locked-offline-citation' };
        }
        if (DOCS_MODE !== 'verify-files') throw new Error(`Unsupported TNC_SIM_DOCS_MODE: ${DOCS_MODE}`);
        const file = path.join(DOCS, source.file);
        const actualHash = sha256(file);
        if (actualHash !== source.sha256) throw new Error(`Documentation hash mismatch: ${source.file}`);
        return { ...source, verification: 'local-file-sha256', verifiedSha256: actualHash };
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
    semanticChecks: SPEC.semanticChecks,
    allowedZones: buildAllowedZones(),
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
    let segments = sub.filter((segment) => segment.toolNum === check.tool && !segment.cycleEvent);
    if (check.sourceContains) {
      const sourceLine = PROGRAM.split(/\r?\n/).findIndex((line) => line.includes(check.sourceContains));
      segments = segments.filter((segment) => segment.srcLine === sourceLine);
    } else if (check.cycle) {
      segments = segments.filter((segment) => check.direction === 'down' ? segment.to.z < segment.from.z - 1e-6 : segment.to.z > segment.from.z + 1e-6);
    }
    if (check.expectedRapid !== undefined) {
      const observedRapid = [...new Set(segments.map((segment) => !!segment.rapid))];
      return { id: check.id, expectedRapid: check.expectedRapid, observedRapid, segmentCount: segments.length, passed: segments.length > 0 && segments.every((segment) => !!segment.rapid === check.expectedRapid) };
    }
    segments = segments.filter((segment) => !segment.rapid);
    const feeds = [...new Set(segments.map((segment) => segment.feed).filter(Number.isFinite))].sort((a, b) => a - b);
    return { id: check.id, expectedFeed: check.expectedFeed, observedFeeds: feeds, segmentCount: segments.length, passed: segments.length > 0 && segments.every((segment) => Number.isFinite(segment.feed) && Math.abs(segment.feed - check.expectedFeed) < 1e-9) };
  });
}

function semanticProgram(body) {
  return [
    'BEGIN PGM SEMANTIC MM',
    'BLK FORM 0.1 Z X-50 Y-50 Z+0',
    'BLK FORM 0.2 X+50 Y+50 Z+20',
    body,
    'END PGM SEMANTIC MM',
  ].join('\n');
}

function cycle208Program(q370) {
  return semanticProgram(`TOOL CALL 1 Z S3000 F420.500\nM3\nCYCL DEF 208\nQ200=+2\nQ201=-2\nQ206=+100\nQ334=+2\nQ203=+0\nQ204=+20\nQ335=+30\nQ342=+0\nQ351=+1\nQ370=${q370}\nCYCL CALL`);
}

function cycleSegments(context, code, parsed) {
  const callLine = code.split(/\r?\n/).findIndex((line) => line.trim() === 'CYCL CALL');
  return parsed.sub.filter((segment) => segment.srcLine === callLine);
}

function observeSemanticChecks(context) {
  const fineCode = cycle208Program('+0.5');
  const coarseCode = cycle208Program('+1.5');
  const fine = context.parseProgram(fineCode);
  const coarse = context.parseProgram(coarseCode);
  const fineSegments = cycleSegments(context, fineCode, fine).length;
  const coarseSegments = cycleSegments(context, coarseCode, coarse).length;

  const invalidQ370 = ['-0.1', '+0.05', '+1999.1'].map((value) => {
    const code = cycle208Program(value);
    const validation = Array.from(context.validateProgram(code) || []);
    const parsed = context.parseProgram(code);
    return {
      value,
      validationError: validation.some((problem) => problem.sev === 'err' && /Q370/.test(problem.msg)),
      parseError: Array.from(parsed.problems || []).some((problem) => problem.sev === 'err' && /Q370/.test(problem.msg)),
      cycleSegments: cycleSegments(context, code, parsed).length,
    };
  });

  const q336Code = semanticProgram(`TOOL CALL 11 Z S400 F200.000\nM3\nCYCL DEF 209\nQ200=+2\nQ201=-2\nQ239=+1.250\nQ203=+0\nQ204=+20\nQ336=-0.001\nCYCL CALL`);
  const q336Validation = Array.from(context.validateProgram(q336Code) || []);
  const q336Parsed = context.parseProgram(q336Code);
  const q336 = {
    validationError: q336Validation.some((problem) => problem.sev === 'err' && /Q336/.test(problem.msg)),
    parseError: Array.from(q336Parsed.problems || []).some((problem) => problem.sev === 'err' && /Q336/.test(problem.msg)),
    cycleSegments: cycleSegments(context, q336Code, q336Parsed).length,
  };

  return [
    { id: 'C208-Q370-EFFECT', passed: fineSegments > coarseSegments, observed: { q370_0_5: fineSegments, q370_1_5: coarseSegments } },
    { id: 'C208-Q370-RANGE', passed: invalidQ370.every((item) => item.validationError && item.parseError && item.cycleSegments === 0), observed: invalidQ370 },
    { id: 'C209-Q336-RANGE', passed: q336.validationError && q336.parseError && q336.cycleSegments === 0, observed: q336 },
  ];
}

function simulate(name, repo, coreDir, sourceRef, oracle) {
  const parserRelative = path.join(coreDir, 'parser-engine.js');
  const voxelRelative = path.join(coreDir, 'voxel-cutting.js');
  const parserSource = sourceAtRef(repo, parserRelative, sourceRef);
  const voxelSource = sourceAtRef(repo, voxelRelative, sourceRef);
  const context = makeContext(parserSource, voxelSource, { parser: `${name}:${sourceRef}:${parserRelative}`, voxel: `${name}:${sourceRef}:${voxelRelative}` });
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
    repository: repositoryEvidence(repo, sourceRef),
    inputs: { programSha256: sha256NormalizedText(PROGRAM_FILE), toolTableSha256: sha256NormalizedText(TOOL_FILE), parserSha256: sha256Content(parserSource), voxelSha256: sha256Content(voxelSource) },
    grid: { nx: vx.nx, ny: vx.ny, nz: vx.nz, dx: vx.dx, dy: vx.dy, dz: vx.dz, origin: { x: vx.ox, y: vx.oy, z: vx.oz } },
    parser: { validation, parseProblems, segmentCount: parsed.sub.length },
    witnesses,
    feedChecks: observeFeeds(parsed.sub),
    semanticChecks: observeSemanticChecks(context),
    workpieceGuard: scanUnexpectedCuts(vx, oracle.allowedZones),
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
    const feedResults = observation.feedChecks.map((feed) => ({ ...feed, status: feed.passed ? 'PASS' : 'FAIL' }));
    const semanticResults = observation.semanticChecks.map((check) => ({ id: check.id, status: check.passed ? 'PASS' : 'FAIL', expected: oracle.semanticChecks.find((item) => item.id === check.id)?.expected, observed: check.observed }));
    const workpieceResults = [
      { id: 'NO-UNEXPECTED-CUTS', status: observation.workpieceGuard.unexpectedCutCount === 0 ? 'PASS' : 'FAIL', observed: observation.workpieceGuard.unexpectedCutCount, byTool: observation.workpieceGuard.unexpectedByTool, samples: observation.workpieceGuard.unexpectedSamples },
      { id: 'CUT-TOOL-ATTRIBUTION', status: observation.workpieceGuard.wrongToolCount === 0 ? 'PASS' : 'FAIL', observed: observation.workpieceGuard.wrongToolCount, samples: observation.workpieceGuard.wrongToolSamples },
    ];
    const allResults = [...results, ...feedResults, ...semanticResults, ...workpieceResults];
    const failCount = allResults.filter((item) => item.status === 'FAIL').length;
    return { platform: observation.platform, status: failCount ? 'FAIL' : 'PASS', results, feedResults, semanticResults, workpieceResults, summary: { pass: allResults.length - failCount, fail: failCount } };
  });
  return { format: 'tnc-sim-reference-comparison-v1', status: platforms.every((item) => item.status === 'PASS') ? 'PASS' : 'FAIL', platforms };
}

function markdown(comparison, observations) {
  const lines = ['# Cutting-logic reference comparison', '', `Overall: **${comparison.status}**`, ''];
  for (const platform of comparison.platforms) {
    const observation = observations.find((item) => item.platform === platform.platform);
    lines.push(`## ${platform.platform}`, '', `Grid cell: X ${observation.grid.dx.toFixed(6)} mm, Y ${observation.grid.dy.toFixed(6)} mm, Z ${observation.grid.dz.toFixed(6)} mm.`, '', '| Result | Witness | Difference |', '|---|---|---|');
    for (const result of platform.results) lines.push(`| ${result.status} | ${result.id} | ${result.differences.join('; ') || ''} |`);
    for (const result of platform.feedResults) {
      const expected = result.expectedRapid !== undefined ? `rapid=${result.expectedRapid}` : `feed=${result.expectedFeed}`;
      const observed = result.expectedRapid !== undefined ? `rapid=${result.observedRapid.join(', ')}` : `feed=${result.observedFeeds.join(', ')}`;
      lines.push(`| ${result.status} | ${result.id} | expected ${expected}; observed ${observed}; segments ${result.segmentCount} |`);
    }
    for (const result of platform.semanticResults) lines.push(`| ${result.status} | ${result.id} | expected ${result.expected}; observed ${JSON.stringify(result.observed)} |`);
    for (const result of platform.workpieceResults) lines.push(`| ${result.status} | ${result.id} | observed ${result.observed}; by tool ${JSON.stringify(result.byTool || {})}; samples ${JSON.stringify(result.samples)} |`);
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
  const web = simulate('web', WEB_REPO, 'core', WEB_SOURCE_REF, oracle);
  const android = simulate('android', ANDROID_REPO, path.join('www', 'core'), ANDROID_SOURCE_REF, oracle);
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

if (require.main === module) main();

module.exports = { buildAllowedZones, buildOracle, observeFeeds, scanUnexpectedCuts, verifyLockedInput };
