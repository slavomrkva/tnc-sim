const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const editorSource = fs.readFileSync(path.join(root, 'core', 'editor-core.js'), 'utf8');
const panelsSource = fs.readFileSync(path.join(root, 'web', 'panels.js'), 'utf8');
const indexSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const stored = new Map();
let validateCalls = 0;
let validationMode = 'error';

function element(){
  const classes = new Set();
  return {
    style:{},innerHTML:'',textContent:'',title:'',
    classList:{
      add(name){ classes.add(name); },
      remove(name){ classes.delete(name); },
      contains(name){ return classes.has(name); }
    },
    setAttribute(name,value){ this[name]=String(value); }
  };
}
const elements = {
  problems:element(),
  problemsList:element(),
  problemsCount:element(),
  problemsValidatorToggle:element()
};

const context = {
  console,
  codeEl:{value:'L X+10 F0'},
  problemsData:[],
  problemsOpen:true,
  _liveEditLine:-1,
  fixedProblems:{},
  document:{getElementById(id){ return elements[id]||null; }},
  localStorage:{
    getItem(key){ return stored.has(key) ? stored.get(key) : null; },
    setItem(key,value){ stored.set(key,String(value)); }
  },
  validateProgram(){
    validateCalls++;
    return validationMode==='error'
      ? [{line:0,sev:'err',msg:'validation error'}]
      : [{line:0,sev:'warn',msg:'validation warning'}];
  },
  parseProgram(){ return {sub:[],problems:validationMode==='error'?[{line:0,sev:'err',msg:'parser error'}]:[]}; },
  calcEstTime(){}
};

vm.createContext(context);
vm.runInContext(editorSource, context, {filename:'editor-core.js'});
context.calcEstTime=()=>{};
context.updateLineNums=()=>{};

context.runValidation();
assert.strictEqual(context.problemsData.length,2,
  'enabled validator merges validator and parser diagnostics');
assert.strictEqual(context.hasErrors(),true,'enabled validator blocks on errors');
assert.strictEqual(elements.problemsValidatorToggle.style.display,'inline-block',
  'bottom validator toggle appears when a blocking error is visible');
assert.match(elements.problemsValidatorToggle.textContent,/Validator ON/,
  'error-row toggle shows the current ON state');

context.setValidatorEnabled(false);
assert.strictEqual(context.isValidatorEnabled(),false,'validator can be disabled');
assert.strictEqual(context.problemsData.length,0,'disabled validator hides all diagnostics');
assert.strictEqual(context.hasErrors(),false,'disabled validator does not block Run/Step');
assert.strictEqual(stored.get('tncsim.validator.enabled'),'false',
  'validator preference persists');
assert.strictEqual(validateCalls,1,
  'disabled validation still parses for simulation but skips validateProgram');
assert.strictEqual(elements.problems.style.display,'flex',
  'the bottom row remains visible while validation is disabled');
assert.match(elements.problemsValidatorToggle.textContent,/Validator OFF/,
  'disabled bottom row provides the route to turn validation back on');

context.setValidatorEnabled(true);
assert.strictEqual(context.isValidatorEnabled(),true,'validator can be re-enabled');
assert.strictEqual(context.hasErrors(),true,'re-enabled validator restores blocking errors');
validationMode='warning';
context.runValidation();
assert.strictEqual(elements.problemsValidatorToggle.style.display,'none',
  'warnings alone do not expose the validator toggle');
assert.doesNotMatch(panelsSource,/_idleValidator/,
  'idle toolbar no longer contains a validator switch');
assert.match(indexSource,/id="problemsValidatorToggle"/,
  'the validator switch lives in the bottom Problems row');

console.log('validator-toggle.test.js: error-row-only persistent validator toggle verified');
