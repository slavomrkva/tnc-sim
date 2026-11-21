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

console.log('playback-pacing: all assertions passed');
