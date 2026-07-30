const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const editorSource = fs.readFileSync(path.join(root, 'core', 'editor-core.js'), 'utf8');
const fieldSource = fs.readFileSync(path.join(root, 'core', 'field-editing.js'), 'utf8');
const mcodeSource = fs.readFileSync(path.join(root, 'core', 'mcode-panel.js'), 'utf8');
const appSource = fs.readFileSync(path.join(root, 'web', 'app.js'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'web', 'styles.css'), 'utf8');

const ctxPanel={innerHTML:'',style:{}};
const document = {
  activeElement:null,
  addEventListener(){},
  getElementById(id){ return id==='ctxPanel'?ctxPanel:null; },
  querySelector(){ return null; }
};
const codeEl = {
  value:'LP PR+50 PA+45 FMAX M99',
  selectionStart:0,
  selectionEnd:0,
  scrollTop:0,
  focus(){ document.activeElement=this; },
  blur(){ document.activeElement=null; },
  setSelectionRange(start,end){ this.selectionStart=start; this.selectionEnd=end; }
};
const context = {
  console,
  window:{},
  document,
  navigator:{userAgent:'desktop test'},
  location:{search:''},
  requestAnimationFrame(fn){ fn(); },
  setTimeout(fn){ fn(); },
  codeEl,
  lineNums:{scrollTop:0},
  lastSel:{start:0,end:0},
  FM:{active:false},
  BLK:{active:false},
  BUILDERS:{
    P:{cmd:'LP',fields:[
      {p:'PR',type:'coord',prompt:'PR',opt:true},
      {p:'PA',type:'coord',prompt:'PA',opt:true},
      {p:'F',type:'feed',prompt:'F',opt:true},
      {p:'M',type:'mval',prompt:'M',opt:true}
    ]},
    CP:{cmd:'CP',fields:[
      {p:'PA',type:'coord',prompt:'PA',opt:false},
      {p:'Z',type:'coord',prompt:'Z',opt:true},
      {p:'DR',type:'dr',prompt:'DR',opt:false},
      {p:'F',type:'feed',prompt:'F',opt:true},
      {p:'M',type:'mval',prompt:'M',opt:true}
    ]}
  },
  M_DEFS:[{m:'M89',desc:'Modal cycle call'},{m:'M99',desc:'Cycle call'}],
  M_PANEL_CODES:[],
  _mEditLine:-1,
  _undoStack:[],
  _undoMax:50,
  _selectedLine:0,
  dirty:false,
  _undoPush(){},
  updateLineNums(){},
  runValidation(){},
  renderIdlePanel(){},
  closeQPopup(){},
  closeCtxPanel(){},
  getToolByNum(){ return null; },
  syncEditorSelection(){},
  _cancelMobileFocus(){},
  _liveEditClear(){}
};
context.window=context;
vm.createContext(context);
vm.runInContext(editorSource, context, {filename:'editor-core.js'});
vm.runInContext(fieldSource, context, {filename:'field-editing.js'});
vm.runInContext(mcodeSource, context, {filename:'mcode-panel.js'});
context.runValidation=()=>{};

let parsed=context.parseExistingLine(codeEl.value,'P');
assert.strictEqual(parsed[0].val,'+50');
assert.strictEqual(parsed[0].incr,false);
assert.strictEqual(parsed[1].val,'+45');
assert.strictEqual(parsed[1].incr,false);
assert.strictEqual(parsed[3].val,'99');

codeEl.setSelectionRange(codeEl.value.indexOf('PA')+1,codeEl.value.indexOf('PA')+1);
context.enterFieldModeOnLine(context.getCaretLine());
assert.strictEqual(context.FM.idx,1,'tapping PA must select the polar-angle field');
context.toggleIncrementalToken();
assert.match(codeEl.value, /\bIPA\+45\b/, 'I changes PA to documented IPA');

context.selectField(0);
const beforePr=codeEl.value;
context.toggleIncrementalToken();
assert.strictEqual(codeEl.value,beforePr,'ordinary LP radius must not be changed to unsupported IPR');

codeEl.value='CP IPA+360 IZ+5 DR+ F200';
parsed=context.parseExistingLine(codeEl.value,'CP');
assert.strictEqual(parsed[0].incr,true,'CP editor reopens IPA as incremental');
assert.strictEqual(parsed[1].incr,true,'CP editor reopens IZ as incremental');

const hit=context.mTokenAt('LP PR+50 PA+45 FMAX M99',23);
assert.strictEqual(hit.code,'M99','embedded M99 token is independently hit-testable');
codeEl.value='LP PR+50 PA+45 FMAX M99 ; drill here';
context._mEditLine=0;
context._mEditInline=true;
context._replaceMOnLine('M89');
assert.strictEqual(codeEl.value,'LP PR+50 PA+45 FMAX M89 ; drill here',
  'editing embedded M must preserve the LP block and its comment');

const hitStart=appSource.indexOf('var _editorHitCanvas = null;');
const hitEnd=appSource.indexOf("codeEl.addEventListener('click'",hitStart);
assert.ok(hitStart>=0&&hitEnd>hitStart,'desktop character-cell hit-test is defined');
const hitCodeEl={
  scrollLeft:0,
  getBoundingClientRect(){ return {left:100}; }
};
const hitContext={
  codeEl:hitCodeEl,
  window:{
    getComputedStyle(){
      return {font:'16px monospace',paddingLeft:'12px',borderLeftWidth:'0px'};
    }
  },
  document:{
    createElement(){
      return {getContext(){ return {font:'',measureText(text){ return {width:text.length*10}; }}; }};
    }
  }
};
vm.createContext(hitContext);
vm.runInContext(appSource.slice(hitStart,hitEnd),hitContext,{filename:'desktop-editor-hit-test.js'});

const standaloneM='M3';
const standaloneEndX=100+12+standaloneM.length*10;
const directM3=hitContext._editorTapMetrics({clientX:standaloneEndX-2},standaloneM);
const afterM3=hitContext._editorTapMetrics({clientX:standaloneEndX+8},standaloneM);
assert.strictEqual(directM3.past,false,'click on the final M3 glyph is not free space');
assert.strictEqual(directM3.index,standaloneM.length-1,
  'click on M3 resolves to its final glyph even when selectionStart is at line end');
assert.strictEqual(context.mTokenAt(standaloneM,directM3.index).code,'M3',
  'direct click on M3 remains routed to M editing');
assert.strictEqual(afterM3.past,true,'click right of standalone M3 is measured as free space');
assert.strictEqual(afterM3.index,standaloneM.length,
  'free-space click resolves to the caret offset after M3');

const terminalM='LP PR+50 PA+45 FMAX M99';
const terminalEndX=100+12+terminalM.length*10;
const directLastGlyph=hitContext._editorTapMetrics({clientX:terminalEndX-2},terminalM);
const freeSpaceAfter=hitContext._editorTapMetrics({clientX:terminalEndX+8},terminalM);
assert.strictEqual(directLastGlyph.past,false,'click on the final M99 glyph is not free space');
assert.strictEqual(context.mTokenAt(terminalM,directLastGlyph.index).code,'M99',
  'direct click on final embedded M99 remains routed to block editing');
assert.strictEqual(freeSpaceAfter.past,true,'click right of embedded M99 is free space');

assert.ok(appSource.indexOf('if(_tapPastCommand)') < appSource.indexOf("mTokenAt(lineText,hitPosInLine)"),
  'a measured free-space click must place the caret before M-token routing runs');
assert.match(appSource,
  /if\(_clickedM && \/\^\(\?:L\|C\|CR\|CT\|LP\|CP\)\(\?:\\s\|\$\)\/\.test\(lt\)\)\{[\s\S]{0,220}enterFieldModeOnLine\(_pathInfo\)/,
  'an embedded positioning-block M opens the complete guided path-block editor');
assert.ok(
  appSource.indexOf("if(_clickedM && /^(?:L|C|CR|CT|LP|CP)(?:\\s|$)/.test(lt))") <
    appSource.indexOf("if(_clickedM && typeof openMPanelEdit==='function')"),
  'L/C-block routing runs before the standalone/other embedded M panel');
assert.match(appSource, /\^END PGM\\b[\s\S]{0,220}codeEl\.blur/,
  'protected END PGM keeps the native caret blurred');
assert.match(appSource, /\^BEGIN PGM\\b[\s\S]{0,300}codeEl\.focus/,
  'protected BEGIN PGM keeps focus so Enter can insert a following block');
assert.match(styles, /body\[data-mtab="editor"\] #code\{[^}]*padding-bottom:28px/,
  'mobile editor must reserve space above its horizontal scrollbar');
assert.match(styles, /body\[data-mtab="editor"\] #hlLayer\{[^}]*padding-bottom:28px/,
  'highlight overlay must use the same bottom spacing as the textarea');

console.log('editor-polar-mcode-layout.test.js: polar fields, inline M edit and bottom layout verified');
