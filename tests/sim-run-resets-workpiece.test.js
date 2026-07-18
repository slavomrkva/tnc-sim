'use strict';

// Regression: starting a run/step from the beginning (a finished or rewound
// run) must reset the voxel WORKPIECE, not just the sim index. Previously only
// onReset() called vxReset(); onRun()/onStep() called resetState() alone, so a
// re-run replayed onto the previous run's carved+tool-colored voxels, leaving
// coloured leftover surfaces in the mesh until a manual Reset. A mid-run resume
// must NOT wipe the workpiece.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'core', 'sim-controls.js'), 'utf8');

function run(scenario){
  const spies = { vxReset:0, resetState:0 };
  const ctx = {
    // sim state
    mode: scenario.mode,
    subIndex: scenario.subIndex,
    sub: scenario.sub,
    dirty: false,
    prog: {},                 // truthy + not dirty => ensurePrepared() skips prepare()
    stepTargetBlock: null,
    problemsOpen: false,
    // collaborators (no-op stubs; the two we assert on count their calls)
    vxReset(){ spies.vxReset++; },
    // real resetState() rewinds the sim index to 0 and idles — mirror that so
    // onStep's `subIndex < sub.length` gate behaves as it does in the app.
    resetState(){ spies.resetState++; ctx.subIndex = 0; ctx.subProgress = 0; ctx.mode = 'idle'; },
    updateStatus(){},
    runValidation(){},
    hasErrors(){ return false; },
    errorCount(){ return 0; },
    renderProblems(){},
    mtabSwitch(){},
    VX:null, prog2:null, console
  };
  vm.createContext(ctx);
  vm.runInContext(source, ctx);
  scenario.call(ctx);            // invoke onRun / onStep
  return { spies, ctx };
}

// 1. Re-running a FINISHED run rewinds -> workpiece reset (resetState + vxReset).
{
  const { spies, ctx } = run({
    mode:'done', subIndex:3, sub:[{blockIndex:0},{blockIndex:1},{blockIndex:2}],
    call:c => c.onRun()
  });
  assert.strictEqual(spies.resetState, 1, 'onRun on a finished run must rewind (resetState)');
  assert.strictEqual(spies.vxReset, 1, 'onRun on a finished run must reset the workpiece (vxReset)');
  assert.strictEqual(ctx.mode, 'running');
}

// 2. Stepping after a FINISHED run rewinds -> workpiece reset too.
{
  const { spies, ctx } = run({
    mode:'done', subIndex:3, sub:[{blockIndex:0},{blockIndex:1},{blockIndex:2}],
    call:c => c.onStep()
  });
  assert.strictEqual(spies.resetState, 1, 'onStep on a finished run must rewind (resetState)');
  assert.strictEqual(spies.vxReset, 1, 'onStep on a finished run must reset the workpiece (vxReset)');
  assert.strictEqual(ctx.mode, 'stepping');
}

// 3. Resuming a run mid-program (not done, not at the end) must NOT wipe the
//    workpiece — cutting continues on the existing carving.
{
  const { spies } = run({
    mode:'idle', subIndex:1, sub:[{blockIndex:0},{blockIndex:1},{blockIndex:2}],
    call:c => c.onRun()
  });
  assert.strictEqual(spies.resetState, 0, 'a mid-run resume must not rewind');
  assert.strictEqual(spies.vxReset, 0, 'a mid-run resume must not reset the workpiece');
}

console.log('sim run/step workpiece-reset regression passed');
