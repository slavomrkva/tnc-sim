const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const editorSource = fs.readFileSync(path.join(root, 'core', 'editor-core.js'), 'utf8');
const fieldSource = fs.readFileSync(path.join(root, 'core', 'field-editing.js'), 'utf8');

const panel = {innerHTML:'', style:{}};
const document = {
  activeElement:null,
  addEventListener(){},
  getElementById(id){ return id === 'ctxPanel' ? panel : null; },
  querySelector(){ return null; }
};
const codeEl = {
  value:'BEGIN PGM CANCEL MM\nL X+0 Y+0 R0\nEND PGM CANCEL MM',
  selectionStart:0,
  selectionEnd:0,
  scrollTop:0,
  focus(){ document.activeElement=this; },
  setSelectionRange(start,end){ this.selectionStart=start; this.selectionEnd=end; }
};
const context = {
  console,
  window:{},
  document,
  navigator:{userAgent:'desktop test'},
  location:{search:''},
  requestAnimationFrame(fn){ fn(); },
  codeEl,
  lineNums:{scrollTop:0, querySelectorAll(){ return []; }},
  lastSel:{start:0,end:0},
  FM:{active:false},
  BLK:{active:false},
  BUILDERS:{},
  problemsData:[],
  fixedProblems:{},
  _undoStack:[],
  _redoStack:[],
  _undoMax:50,
  _selectedLine:0,
  dirty:false,
  updateLineNums(){},
  runValidation(){},
  renderIdlePanel(){},
  closeQPopup(){},
  getToolByNum(){ return null; },
  _cancelMobileFocus(){},
  _liveEditClear(){}
};
context.window=context;
vm.createContext(context);
vm.runInContext(editorSource, context, {filename:'editor-core.js'});
vm.runInContext(fieldSource, context, {filename:'field-editing.js'});
context.runValidation=()=>{};
context._liveEditLine=-1;
context._liveEditClear=()=>{ context._liveEditLine=-1; };

function lineOffset(value,index){
  return value.split('\n').slice(0,index).join('\n').length+(index?1:0);
}

assert.match(fieldSource, /onclick="cancelFieldMode\(\)"[^>]*aria-label="Cancel input"/,
  'the guided-panel X is wired to transaction cancel, not Done');

const pathBuilders=[
  'L','P','CHF','CC','C','CR','CT','CP','RND',
  'APPR LT','APPR LN','APPR CT','APPR LCT',
  'APPR PLT','APPR PLN','APPR PCT','APPR PLCT',
  'DEP LT','DEP LN','DEP CT','DEP LCT','DEP PLCT'
];
pathBuilders.forEach(label => {
  context.BUILDERS[label]={
    cmd:label==='P'?'LP':label,
    fields:[{p:'X',type:'coord',prompt:'X',opt:true}]
  };
});

const cancelProgram='BEGIN PGM CANCEL MM\nL X+0 Y+0 R0\nEND PGM CANCEL MM';
for(const label of pathBuilders){
  codeEl.value=cancelProgram;
  const anchor=lineOffset(codeEl.value,1)+'L X+0 Y+0 R0'.length;
  codeEl.setSelectionRange(anchor,anchor);
  context.lastSel={start:anchor,end:anchor};
  context.dirty=false;
  context._undoStack.length=0;
  context._redoStack=['redo-before-'+label];
  context.enterFieldMode(label);
  assert.notStrictEqual(codeEl.value,cancelProgram,`${label} inserts a provisional block`);
  context.cancelFieldMode();
  assert.strictEqual(codeEl.value,cancelProgram,`${label} X removes the complete provisional block`);
  assert.strictEqual(context.FM.active,false,`${label} X closes field mode`);
  assert.strictEqual(context.dirty,false,`${label} X restores the prior dirty state`);
  assert.deepStrictEqual(Array.from(context._undoStack),[],`${label} X removes its no-op undo entry`);
  assert.deepStrictEqual(Array.from(context._redoStack),['redo-before-'+label],
    `${label} X preserves pre-existing redo history`);
  assert.strictEqual(codeEl.selectionStart,anchor,`${label} X restores the original caret`);
}

codeEl.value='BEGIN PGM CANCEL MM\nC X+10 Y+20 DR+\nEND PGM CANCEL MM';
context.BUILDERS.C={cmd:'C',fields:[
  {p:'X',type:'coord',prompt:'X',opt:true},
  {p:'Y',type:'coord',prompt:'Y',opt:true},
  {p:'DR',type:'dr',prompt:'DR',opt:false}
]};
const existingCStart=lineOffset(codeEl.value,1);
codeEl.setSelectionRange(existingCStart+2,existingCStart+2);
context.lastSel={start:existingCStart+2,end:existingCStart+2};
const existingCProgram=codeEl.value;
context.enterFieldModeOnLine(context.getCaretLine());
context.FM.fields[0].val='+99';
context.refreshSelection();
assert.match(codeEl.value,/C X\+99 Y\+20 DR\+/,'existing C changes while its panel is open');
context.cancelFieldMode();
assert.strictEqual(codeEl.value,existingCProgram,
  'X restores an existing path block instead of keeping partial edits or deleting it');

context.BUILDERS['TOOL CALL']={cmd:'TOOL CALL',fields:[
  {p:'',type:'tool',prompt:'T',opt:false},
  {p:'S',type:'num',prompt:'S',opt:false},
  {p:'F',type:'num',prompt:'F',opt:true}
]};
codeEl.value=cancelProgram;
const toolAnchor=lineOffset(codeEl.value,1)+'L X+0 Y+0 R0'.length;
codeEl.setSelectionRange(toolAnchor,toolAnchor);
context.lastSel={start:toolAnchor,end:toolAnchor};
context.enterFieldMode('TOOL CALL');
assert.match(codeEl.value,/TOOL CALL[\s\S]*M3[\s\S]*M8/);
context.cancelFieldMode();
assert.strictEqual(codeEl.value,cancelProgram,
  'X removes a complete multi-line guided insertion transaction');

console.log('field-editing-cancel.test.js: all Path builders and transactional X cancel verified');
