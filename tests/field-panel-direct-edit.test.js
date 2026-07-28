const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const editorSource = fs.readFileSync(path.join(root, 'core', 'editor-core.js'), 'utf8');
const fieldSource = fs.readFileSync(path.join(root, 'core', 'field-editing.js'), 'utf8');
const appSource = fs.readFileSync(path.join(root, 'web', 'app.js'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'web', 'styles.css'), 'utf8');

const panel = {innerHTML:'', addEventListener(){}};
const document = {
  activeElement:null,
  addEventListener(){},
  getElementById(id){ return id === 'ctxPanel' ? panel : null; },
  querySelector(){ return null; }
};
const codeEl = {
  value:'',
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
  FM:{active:false},
  BUILDERS:{},
  problemsData:[],
  fixedProblems:{},
  _undoStack:[],
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
context._fieldAcceptsSign=f=>!!f && f.type==='coord';
context._setFieldSign=(f,sign)=>{
  f.val=context.applyNumericSign(f.val,sign);
  context.FM.typing=true;
  context.refreshSelection();
};

function field(p,type,val,opt){
  return {p, type, val, opt:!!opt, incr:false, prompt:p || 'Value'};
}

function editCase(name, builderKey, cmd, fields, index, next, expected){
  context.BUILDERS[builderKey] = {cmd, fields:[]};
  const initial = (() => {
    context.FM={active:true,builderKey,cmd,fields,idx:index,lineStart:0,lineLen:0,ranges:[]};
    const parts=context.lineParts();
    context.codeEl.value=parts.text;
    context.FM.lineLen=parts.text.length;
    context.FM.ranges=parts.ranges;
    return parts;
  })();
  const selected=initial.ranges[index];
  assert.strictEqual(initial.text.slice(selected.s,selected.e),
    context.tokenFor(fields[index]), `${name} starts with an exact field range`);
  context.fieldPanelInput({value:next});
  assert.strictEqual(context.codeEl.value,expected,`${name} edits through the shared panel input`);
}

editCase('L coordinate','L','L',[
  field('X','coord','+10',true),field('Y','coord','+20',true),
  field('Z','coord','+5',true),field('','rc','R0',true),
  field('F','feed','100',true),field('M','mval','3',true)
],0,'+25','L X+25 Y+20 Z+5 R0 F100 M3');

editCase('C endpoint','C','C',[
  field('X','coord','+30',true),field('Y','coord','+40',true),
  field('DR','dr','+',false),field('F','feed','200',true),
  field('','rc','R0',true),field('M','mval','99',true)
],1,'+45','C X+30 Y+45 DR+ F200 R0 M99');

editCase('CC centre','CC','CC',[
  field('X','coord','+5',true),field('Y','coord','+6',true)
],0,'+7','CC X+7 Y+6');

editCase('CR radius','CR','CR',[
  field('X','coord','+20',true),field('Y','coord','+30',true),
  field('R','num','10',false),field('DR','dr','-',false),
  field('F','feed','150',true)
],2,'12.5','CR X+20 Y+30 R12.5 DR- F150');

editCase('CT feed','CT','CT',[
  field('X','coord','+40',true),field('Y','coord','+50',true),
  field('F','feed','300',true),field('M','mval','8',true)
],2,'450','CT X+40 Y+50 F450 M8');

editCase('L M function','L-M','L',[
  field('X','coord','+10',true),field('M','mval','3',true)
],1,'8','L X+10 M8');

editCase('CP polar angle','CP','CP',[
  field('PA','coord','+360',false),field('Z','coord','+5',true),
  field('DR','dr','+',false),field('F','feed','200',true),
  field('M','mval','99',true)
],0,'+180','CP PA+180 Z+5 DR+ F200 M99');

editCase('LP polar radius','P','LP',[
  field('PR','coord','+50',true),field('PA','coord','+45',true),
  field('F','feed','250',true),field('M','mval','99',true)
],0,'+60','LP PR+60 PA+45 F250 M99');

editCase('incremental L','I','L',[
  field('IX','coord','+5',true),field('IY','coord','-2',true),
  field('IZ','coord',null,true),field('F','feed','100',true)
],1,'-4','L IX+5 IY-4 F100');

editCase('RND radius','RND','RND',[
  field('R','num','10',false)
],0,'12','RND R12');

editCase('CHF size','CHF','CHF',[
  field('','num','3',false)
],0,'4.5','CHF 4.5');

editCase('LBL number','LBL','LBL',[
  field('','num','1',false)
],0,'2','LBL 2');

editCase('CALL LBL repeat','LBL CALL','CALL LBL',[
  field('','num','2',false),field('REP','num','3',true)
],1,'5','CALL LBL 2 REP 5');

const parsedCompactRepeat=context.parseExistingLine('CALL LBL 2 REP6','LBL CALL');
assert.strictEqual(parsedCompactRepeat[0].val,'2',
  'CALL LBL editor preserves the label number from compact REP syntax');
assert.strictEqual(parsedCompactRepeat[1].val,'6',
  'CALL LBL editor recognizes the documented compact REP6 count');

context.BUILDERS['TOOL CALL']={
  cmd:'TOOL CALL',
  postprocess(text){ return text.replace(/^TOOL CALL (\d+)/,'TOOL CALL $1 Z'); }
};
const toolFields=[
  field('','tool','1',false),field('S','num','3000',false),
  field('F','num','500',true),field('DL','coord','-2',true),
  field('DR','coord','+2',true)
];
context.FM={active:true,builderKey:'TOOL CALL',cmd:'TOOL CALL',fields:toolFields,
  idx:1,lineStart:0,lineLen:0,ranges:[]};
let toolParts=context.lineParts();
assert.strictEqual(toolParts.text,'TOOL CALL 1 Z S3000 F500 DL-2 DR+2');
assert.deepStrictEqual(
  Array.from(toolParts.ranges, range => range.s < 0 ? '' : toolParts.text.slice(range.s,range.e)),
  ['1','S3000','F500','DL-2','DR+2'],
  'TOOL CALL ranges are calculated after inserting the fixed Z token');
context.codeEl.value=toolParts.text;
context.FM.lineLen=toolParts.text.length;
context.FM.ranges=toolParts.ranges;
context.fieldPanelInput({value:'4500'});
assert.strictEqual(context.codeEl.value,'TOOL CALL 1 Z S4500 F500 DL-2 DR+2');

context.BUILDERS.L={cmd:'L',fields:[
  {p:'X',type:'coord',prompt:'X',opt:true},
  {p:'M',type:'mval',prompt:'M1',opt:true},
  {p:'M',type:'mval',prompt:'M2',opt:true}
]};
const parsedTwoM=context.parseExistingLine('L X+10 M3 M123','L');
assert.deepStrictEqual(Array.from(parsedTwoM,f=>f.val),['+10','3','123'],
  'reopening an L block keeps both M functions in separate guided fields');
assert.strictEqual(context.findClickedFieldIdx('L X+10 M3 M123','L',8),1,
  'clicking the first M token selects the first M guided field');
assert.strictEqual(context.findClickedFieldIdx('L X+10 M3 M123','L',13),2,
  'clicking the second M token selects the second M guided field');

context.BUILDERS.L={cmd:'L',fields:[
  {p:'X',type:'coord',prompt:'X',opt:true},
  {p:'F',type:'feed',prompt:'F',opt:true},
  {p:'M',type:'mval',prompt:'M1',opt:true},
  {p:'M',type:'mval',prompt:'M2',opt:true}
]};
const parsedParameterizedM=context.parseExistingLine('L X+10 F500 M103 F20 M8','L');
assert.deepStrictEqual(Array.from(parsedParameterizedM,f=>f.val),['+10','500','103','8'],
  'an M parameter is not mistaken for the positioning feed');
assert.deepStrictEqual(Array.from(parsedParameterizedM,f=>f.mParams||''),['','','F20',''],
  'reopening a guided block preserves the parameter tail of its M function');
context.FM={active:true,builderKey:'L',cmd:'L',fields:parsedParameterizedM,
  idx:2,lineStart:0,lineLen:0,ranges:[]};
const parameterizedParts=context.lineParts();
assert.strictEqual(parameterizedParts.text,'L X+10 F500 M103 F20 M8',
  'guided navigation does not discard a documented M parameter');
context.codeEl.value=parameterizedParts.text;
context.FM.lineLen=parameterizedParts.text.length;
context.FM.ranges=parameterizedParts.ranges;
context.fieldPanelInput({value:'5'});
assert.strictEqual(context.codeEl.value,'L X+10 F500 M5 M8',
  'changing the M number intentionally clears parameters that belonged to the old function');

context.BUILDERS.C={cmd:'C',fields:[
  {p:'X',type:'coord',prompt:'X',opt:true},
  {p:'Y',type:'coord',prompt:'Y',opt:true},
  {p:'DR',type:'dr',prompt:'DR',opt:false},
  {p:'M',type:'mval',prompt:'M1',opt:true},
  {p:'M',type:'mval',prompt:'M2',opt:true}
]};
const parsedCTwoM=context.parseExistingLine('C X+0 Y+50 DR+ M3 M123','C');
assert.deepStrictEqual(Array.from(parsedCTwoM,f=>f.val),['+0','+50','+','3','123'],
  'reopening a C block keeps both M functions in separate guided fields');
assert.strictEqual(context.findClickedFieldIdx('C X+0 Y+50 DR+ M3 M123','C',16),3,
  'clicking the first C-block M selects its first M guided field');
assert.strictEqual(context.findClickedFieldIdx('C X+0 Y+50 DR+ M3 M123','C',20),4,
  'clicking the second C-block M selects its second M guided field');

['L','C','CC'].forEach(builderKey=>{
  context.FM={active:true,builderKey,cmd:builderKey,fields:[field('X','coord','+25',true)],
    idx:0,lineStart:0,lineLen:0,ranges:[]};
  context.codeEl.value=builderKey+' X+25';
  context.FM.lineLen=context.codeEl.value.length;
  context.FM.ranges=context.lineParts().ranges;
  let prevented=false;
  context.fieldPanelKeydown({
    key:'-',ctrlKey:false,altKey:false,metaKey:false,
    preventDefault(){ prevented=true; },stopPropagation(){}
  });
  assert.strictEqual(context.codeEl.value,builderKey+' X-25',
    'minus in an active '+builderKey+' value changes only its sign');
  assert.strictEqual(prevented,true,
    builderKey+' native input sign replacement is prevented');
});

context.BUILDERS['TOOL CALL']={
  cmd:'TOOL CALL',
  fields:[
    {p:'',type:'tool',prompt:'Tool',opt:false},
    {p:'S',type:'num',prompt:'S',opt:false},
    {p:'F',type:'num',prompt:'F',opt:true},
    {p:'DL',type:'coord',prompt:'DL',opt:true},
    {p:'DR',type:'coord',prompt:'DR',opt:true}
  ],
  postprocess(text){ return text.replace(/^TOOL CALL (\d+)/,'TOOL CALL $1 Z'); }
};
context.codeEl.value='BEGIN PGM TEST MM\nEND PGM TEST MM';
const endPos=context.codeEl.value.indexOf('END PGM');
context.codeEl.selectionStart=context.codeEl.selectionEnd=endPos;
context.lastSel={start:endPos,end:endPos};
context.enterFieldMode('TOOL CALL');
assert.match(context.codeEl.value,/TOOL CALL 1 Z S10000 F2000\nM3\nM8/,
  'fresh TOOL CALL insertion receives Android-equivalent S/F defaults');

assert.match(fieldSource, /<input class="fbar-val" id="fbarVal"/,
  'desktop generic values render as a real input');
assert.match(fieldSource, /if\(isMobile\(\)\)\{[\s\S]*?<span class="fbar-val"/,
  'mobile retains the established hidden-input ownership');
assert.match(appSource, /document\.activeElement\.id==='fbarVal'/,
  'desktop panel mouseup does not steal focus from the real input');
assert.match(styles, /input\.fbar-val:focus/,
  'the active editable field has visible focus styling');

console.log('field-panel-direct-edit.test.js: path, polar, label and TOOL CALL direct editing verified');
