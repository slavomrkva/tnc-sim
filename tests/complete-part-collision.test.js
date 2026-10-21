'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const H = require('./_cycle-harness');
const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const app = read('web/app.js');
const tableStart = app.indexOf("  {T:1, TYPE:");
const tools = vm.runInNewContext('[' + app.slice(tableStart, app.indexOf('\n];', tableStart)) + ']');
const code = read('index.html').match(/<textarea id="code"[^>]*>([\s\S]*?)<\/textarea>/)[1];
function setup(){
  const c = H.makeContext();
  c.getToolByNum = n => tools.find(t => t.T === n);
  const program = c.parseProgram(code);
  vm.runInContext(read('core/voxel-cutting.js'), c);
  Object.assign(c, {VX:null, VX_QUALITY:1, THREE_OK:false, scene:{add(){}},
    blockEdges:null, currentToolNum:1, pendingToolNum:0, prog:program});
  // Only rendering/ATC animation is stubbed; stock, cutting and collision are real.
  c.vxBuildMesh = () => null;
  c.startATC = () => {};
  c.vxInit(program);
  c.hits = [];
  c.rapidCollision = (s,x,y,z) => c.hits.push({line:s.srcLine+1, tool:s.toolNum, x,y,z});
  return c;
}
const c = setup();
for(const segment of c.prog.sub) c.commitSeg(segment);
assert.deepStrictEqual(c.hits, [], 'Complete Part must finish without collisions: '+JSON.stringify(c.hits));
// An actual rapid into untouched stock and stopped-spindle feed must still warn.
for(const rapid of [true, false]){
  const c = setup();
  c.commitSeg({from:{x:0,y:0,z:30},to:{x:0,y:0,z:10},len:20,
    toolNum:1,rapid,spindleOn:rapid,srcLine:0});
  assert.ok(c.hits.length > 0, 'unsafe motion must be detected');
}
// Detect body contact above a narrow drill tip, not just a slice at the tip.
{
  const c = setup();
  const shape = {type:'cone',mode:'drill',angle:118,lcuts:40};
  c.vxCut(0,0,10,3.4,shape);
  assert.strictEqual(c.vxCollides(0,0,10,3.4,shape),false,'same drilled shape fits');
  assert.strictEqual(c.vxCollides(0,0,11,3.4,shape),false,'vertical retract fits');
  assert.strictEqual(c.vxCollides(2,0,10,3.4,shape),true,'lateral body contact is unsafe');
}
console.log('Complete Part real-stock collision regression passed');
