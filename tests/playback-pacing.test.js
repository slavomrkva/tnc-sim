'use strict';
// Playback keeps a constant ratio to program time at every speed: a frame never
// drops time after a completed segment, a held cycle retract carries its
// unused time, and dwell uses the same time scale as motion.
const assert = require('assert');
const { context } = require('./_simulation-harness');

const FRAME = 1 / 60;

function run(segments, speed) {
  const c = context('');
  c.SPEEDS = [speed]; c.speedIdx = 0; c.VISUAL_GAIN = 1;
  c.sub = segments; c.prog = { totalBlocks: 1, start: { x: 0, y: 0, z: 0 } };
  c.subIndex = 0; c.subProgress = 0; c.mode = 'running';
  const travelled = [];
  let frames = 0;
  while (c.mode !== 'done' && frames < 5000) {
    c.advance(FRAME); frames++;
    travelled.push(c.toolPos.x);
  }
  assert.strictEqual(c.mode, 'done', 'playback finishes');
  return { frames, travelled, c };
}

const line = (x0, len, extra) => Object.assign({
  from: { x: x0, y: 0, z: 0 }, to: { x: x0 + len, y: 0, z: 0 }, len, feed: 600, rapid: false,
  spindleOn: true, srcLine: 0, blockIndex: 1, toolNum: 1
}, extra || {});

// 600 one-millimetre segments at F600 (10 mm/s) and 100x: 1000 mm/s, 0.6 s.
{
  const segs = Array.from({ length: 600 }, (_, i) => line(i, 1));
  const { frames, travelled } = run(segs, 100);
  assert.ok(frames >= 36 && frames <= 38, `600 mm takes ~36 frames at 100x, took ${frames}`);
  for (let i = 1; i < travelled.length - 1; i++) {
    const step = travelled[i] - travelled[i - 1];
    assert.ok(Math.abs(step - 1000 * FRAME) < 0.5, `even step per frame (frame ${i}: ${step.toFixed(2)} mm)`);
  }
}

// Long and short segments of the same feed move at the same speed.
{
  const short = run(Array.from({ length: 300 }, (_, i) => line(i, 1)), 20).frames;
  const long = run([line(0, 300)], 20).frames;
  assert.ok(Math.abs(short - long) <= 1, `segment length does not change the pace (${short} vs ${long} frames)`);
}

// A held cycle retract shows its midpoint but costs no extra time.
{
  const segs = Array.from({ length: 200 }, (_, i) => line(i, 1));
  segs.splice(100, 0, line(100, 0.2, { ensureVisible: true, rapid: true }));
  for (let i = 101; i < segs.length; i++) { segs[i].from.x += 0.2; segs[i].to.x += 0.2; }
  const plain = run(Array.from({ length: 200 }, (_, i) => line(i, 1)), 5).frames;
  const held = run(segs, 5).frames;
  assert.ok(held - plain <= 1, `holding a retract does not slow playback (${plain} vs ${held} frames)`);
}

// Dwell follows the same scale as motion: 1 s dwell at 10x = 0.1 s = 6 frames.
{
  const dwell = line(0, 0.001, { dwellSeconds: 1 });
  const { frames } = run([dwell], 10);
  assert.ok(frames >= 6 && frames <= 7, `1 s dwell at 10x takes ~6 frames, took ${frames}`);
}

// When the frame work budget runs out the device cannot keep up: the unused
// time is dropped, never carried into a later catch-up jump.
{
  const c = context('');
  c.SPEEDS = [500]; c.speedIdx = 0; c.VISUAL_GAIN = 1;
  c.sub = Array.from({ length: 2000 }, (_, i) => line(i * 0.1, 0.1));
  c.prog = { totalBlocks: 1, start: { x: 0, y: 0, z: 0 } };
  c.subIndex = 0; c.subProgress = 0; c.mode = 'running';
  let clock = 0; c._advanceNow = () => (clock += 5); // each check costs 5 ms
  c.advance(FRAME);
  assert.ok(c.subIndex > 0 && c.subIndex < c.sub.length, 'budget stops the frame early');
  assert.strictEqual(c._advanceCarry, 0, 'no carry after an exhausted budget');
}

// Stop and a speed change clear leftover real-time carry.
{
  const fs = require('fs'), path = require('path');
  const src = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  assert.match(src('core/sim-controls.js'), /function onStop\(\)\{\s*if\(typeof _advanceCarry!=='undefined'\) _advanceCarry = 0;/);
  assert.match(src('core/editor-core.js'), /function changeSpeed\(d\)\{[\s\S]*?_advanceCarry = 0;[\s\S]*?\n\}/);
}

// The tool change follows the speed buttons: ~1.5 s at 1x, at least 0.15 s.
{
  for (const [speed, expected] of [[1, 0.065], [10, 0.65], [100, 0.1 / 0.15]]) {
    const c = context('');
    c.SPEEDS = [speed]; c.speedIdx = 0; c.VISUAL_GAIN = 1;
    const pos = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
    c.toolGroup = { position: pos }; c.buildToolMesh = () => {};
    c.atcAnim = { t: 0, toT: 1, inGroup: null, outX: 0, outY: 0, outZ: 0, cornerX: 0, cornerY: 0, cornerZ: 0, endX: 0, endY: 0, endZ: 0 };
    c.updateATC(0.1);
    const t = c.atcAnim ? c.atcAnim.t : 1;
    assert.ok(Math.abs(t - Math.min(1, expected)) < 1e-9, `ATC progress at ${speed}x: ${t}`);
  }
}

// 1x is machine time: no hidden gain, FMAX equals the estimate's 20000 mm/min,
// and the app starts at 1x.
{
  const fs = require('fs'), path = require('path');
  const app = fs.readFileSync(path.join(__dirname, '..', 'web', 'app.js'), 'utf8');
  const val = name => require('vm').runInNewContext(app.match(new RegExp('var ' + name + ' = ([^;]+);'))[1]);
  assert.strictEqual(val('VISUAL_GAIN'), 1, 'no hidden speed-up');
  assert.ok(Math.abs(val('RAPID_MMS') * 60 - 20000) < 1e-9, 'FMAX playback = 20000 mm/min');
  assert.match(fs.readFileSync(path.join(__dirname, '..', 'core', 'tool-table.js'), 'utf8'),
    /var RAPID_FEED = 20000;/, 'time estimate uses the same FMAX');
  assert.strictEqual(val('SPEEDS')[val('speedIdx')], 1, 'starts at 1x');
}

console.log('playback-pacing: all assertions passed');
