// Radius-compensation validation timing:
//   - "contour not finished yet" diagnostics (RL/RR still active, no following
//     contour element) are DEFERRED while editing (liveEdit=true) and only
//     surface at simulation start (Run/Step call validateProgram/runValidation
//     with liveEdit=false).
//   - Genuine geometry errors (tool radius too large, etc.) always show live.
const assert = require('assert');
const harness = require('./_cycle-harness');
const ctx = harness.makeContext();

// Emulate editor-core runValidation's merge for a given liveEdit flag.
function panel(code, liveEdit){
  ctx.TOOL_R = 5; ctx.probs = [];
  let problems = Array.from(ctx.validateProgram(code, liveEdit), p => Object.assign({}, p));
  ctx.TOOL_R = 5; ctx.probs = [];
  const tmp = ctx.parseProgram(code);
  const seen = {};
  problems.forEach(p => { seen[p.line + '|' + p.sev + '|' + p.msg] = true; });
  (tmp.problems || []).forEach(p => {
    if (liveEdit && p.rcDefer) return;
    const k = p.line + '|' + p.sev + '|' + p.msg;
    if (!seen[k]) { problems.push(p); seen[k] = true; }
  });
  return problems.filter(p => p.sev === 'err');
}
const anyRc = probs => probs.some(p => /radius comp/i.test(p.msg));
const hasTooLarge = probs => probs.some(p => /tool radius too large/.test(p.msg));

// 1) In-progress RL contour: no R0, no finished contour yet.
const inProgress = [
  'BEGIN PGM DEFER MM', 'BLK FORM 0.1 Z X-50 Y-50 Z-10', 'BLK FORM 0.2 X+50 Y+50 Z+0',
  'TOOL CALL 1 Z S2000 F500', 'M3', 'L X-30 Y-30 Z+20 FMAX R0', 'L Z-5', 'L X-20 RL',
  'END PGM DEFER MM',
].join('\n');
assert.ok(!anyRc(panel(inProgress, true)),
  'while editing, an in-progress RL contour must not raise any radius-comp error');
assert.ok(anyRc(panel(inProgress, false)),
  'at Run, the deferred radius-comp completeness errors must appear (block Run)');

// 2) Genuine unfit corner in a complete program: must show live AND at Run.
const unfitCorner = [
  'BEGIN PGM BAD_CORNER MM', 'BLK FORM 0.1 Z X-10 Y-10 Z+0', 'BLK FORM 0.2 X+10 Y+10 Z+10',
  'TOOL CALL 1 Z S3000 F500', 'M3', 'L X+0 Y+0 R0', 'L X+5 Y+0 RL', 'L X+5 Y+5',
  'L X+3 Y+5', 'L X+3 Y+3', 'L X+1 Y+3 R0', 'END PGM BAD_CORNER MM',
].join('\n');
assert.ok(hasTooLarge(panel(unfitCorner, true)),
  'a genuine tool-radius-too-large error must still show while editing');
assert.ok(hasTooLarge(panel(unfitCorner, false)),
  'a genuine tool-radius-too-large error must also show at Run');

// 3) The deferred diagnostics carry rcDefer; genuine geometry ones do not.
ctx.TOOL_R = 5; ctx.probs = [];
const ipProblems = ctx.parseProgram(inProgress).problems || [];
assert.ok(ipProblems.some(p => p.rcDefer && /no following contour element/.test(p.msg)),
  '"no following contour element" must be tagged rcDefer');
ctx.TOOL_R = 5; ctx.probs = [];
const ucProblems = ctx.parseProgram(unfitCorner).problems || [];
assert.ok(ucProblems.some(p => /tool radius too large/.test(p.msg) && !p.rcDefer),
  'a genuine geometry error must NOT be tagged rcDefer');

console.log('radius-comp-live-defer.test.js: compensation completeness deferral verified');
