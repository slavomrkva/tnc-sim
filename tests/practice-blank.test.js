const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.resolve(__dirname, '..');
const ctx = {console, TOOL_R:5, DEFAULT_FEED:100,
  getToolByNum:()=>({T:1,R:5,TYPE:'MILL'}), inferToolType:t=>t.TYPE,
  window:{addEventListener(){}}, document:{addEventListener(){},getElementById:()=>({addEventListener(){}})}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'core/parser-engine.js'),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(root,'web/practice.js'),'utf8'),ctx);
const answer='BEGIN PGM BLANK01 MM\nBLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0\nEND PGM BLANK01 MM';
for(const code of [answer,answer.toLowerCase(),answer.replace('X+100 Y+80 Z+0','Y80 Z0 X100.0'),answer.replace(/\n/g,'\r\n').replace('X+0','X0')+'\n; comment']){
  assert.equal(ctx.practiceGrade(code).ok,true);
  assert.equal(ctx.validateProgram(code,false).filter(p=>p.sev==='err').length,0);
  const p=ctx.parseProgram(code);
  assert.equal(p.hasStock,true);
  assert.equal(p.blkMax.x-p.blkMin.x,100);
  assert.equal(p.blkMax.y-p.blkMin.y,80);
  assert.equal(p.blkMax.z-p.blkMin.z,20);
  assert.ok(p.sub.every(s=>s.from.x===s.to.x && s.from.y===s.to.y && s.from.z===s.to.z), 'blank exercise must not move a tool');
}
for(const code of [ctx.PRACTICE_STARTER,answer.replace('Z-20','Z+20'),answer.replace('X+100','X+90'),answer.replace(' X+0',''),answer.replace('Y+80','X+80'),answer.replace('0.1 Z','0.1 X'),answer.replace('X+100','X+100abc'),answer.replace('END PGM BLANK01','END PGM OTHER'),answer.replace('END PGM','L X0 FMAX\nEND PGM'),answer.replace('BLK FORM 0.1','; BLK FORM 0.1')]){
  assert.equal(ctx.practiceGrade(code).ok,false,code);
}
console.log('practice-blank: numeric grading, rejected incomplete answers, real parser geometry and no motion verified');
