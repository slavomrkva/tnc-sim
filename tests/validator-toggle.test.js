const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const editorSource = fs.readFileSync(path.join(root, 'core', 'editor-core.js'), 'utf8');
const panelsSource = fs.readFileSync(path.join(root, 'web', 'panels.js'), 'utf8');
const indexSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const simControlsSource = fs.readFileSync(path.join(root, 'core', 'sim-controls.js'), 'utf8');
function collectRuntimeJs(dir){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry => {
    const full=path.join(dir,entry.name);
    return entry.isDirectory() ? collectRuntimeJs(full) : (entry.name.endsWith('.js')?[full]:[]);
  });
}
const fullValidationCallFiles=collectRuntimeJs(path.join(root,'core'))
  .concat(collectRuntimeJs(path.join(root,'web')))
  .filter(file => /runValidation\s*\(\s*false\s*\)/.test(fs.readFileSync(file,'utf8')))
  .map(file => path.relative(root,file).replace(/\\/g,'/'));
const stored = new Map();
let validateCalls = 0;
let parseCalls = 0;
let estimateCalls = 0;
const clearedTimers = [];
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
  parseProgram(){
    parseCalls++;
    return {sub:[],problems:validationMode==='error'?[{line:0,sev:'err',msg:'parser error'}]:[]};
  },
  calcEstTime(){ estimateCalls++; },
  clearTimeout(id){ clearedTimers.push(id); }
};

vm.createContext(context);
vm.runInContext(editorSource, context, {filename:'editor-core.js'});
context.updateLineNums=()=>{};

context.problemsData=[{line:0,sev:'err',msg:'stale error'}];
context.validateTimer=17;
context.runValidation();
assert.strictEqual(context.problemsData.length,0,
  'editing invalidates stale diagnostics without replacing them');
assert.strictEqual(validateCalls,0,'editing does not invoke validateProgram');
assert.strictEqual(parseCalls,0,'editing does not invoke parseProgram');
assert.strictEqual(estimateCalls,0,'editing does not derive a parse-based estimate');
assert.strictEqual(context.validateTimer,17,
  'ordinary edit invalidation does not interfere with the current debounce callback');

context.runValidation(false);
assert.strictEqual(context.problemsData.length,2,
  'simulation-start validation merges validator and parser diagnostics');
assert.strictEqual(context.hasErrors(),true,'enabled validator blocks on errors');
assert.strictEqual(validateCalls,1,'Run/Step validation invokes validateProgram once');
assert.strictEqual(parseCalls,1,'Run/Step validation invokes parseProgram once');
assert.strictEqual(estimateCalls,1,'Run/Step validation refreshes the estimate');
assert.strictEqual(context.validateTimer,null,'simulation validation consumes the pending edit timer');
assert.deepStrictEqual(clearedTimers,[17],
  'a pending edit callback cannot erase diagnostics after blocked Run/Step');
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
  'changing the validator preference does not run validation');
assert.strictEqual(parseCalls,1,
  'changing the validator preference does not run the parser');
assert.strictEqual(elements.problems.style.display,'flex',
  'the bottom row remains visible while validation is disabled');
assert.match(elements.problemsValidatorToggle.textContent,/Validator OFF/,
  'disabled bottom row provides the route to turn validation back on');

context.setValidatorEnabled(true);
assert.strictEqual(context.isValidatorEnabled(),true,'validator can be re-enabled');
assert.strictEqual(context.hasErrors(),false,
  're-enabling waits for the next Run/Step instead of validating immediately');
context.runValidation(false);
assert.strictEqual(context.hasErrors(),true,
  'the next simulation start restores blocking diagnostics');
validationMode='warning';
context.runValidation(false);
assert.strictEqual(elements.problemsValidatorToggle.style.display,'none',
  'warnings alone do not expose the validator toggle');
assert.strictEqual((simControlsSource.match(/runValidation\(false\)/g)||[]).length,2,
  'Run and Step are the two explicit full-validation entry points');
assert.deepStrictEqual(fullValidationCallFiles,['core/sim-controls.js'],
  'no programming function or editor panel can invoke full validation');
assert.doesNotMatch(panelsSource,/_idleValidator/,
  'idle toolbar no longer contains a validator switch');
assert.match(indexSource,/id="problemsValidatorToggle"/,
  'the validator switch lives in the bottom Problems row');

console.log('validator-toggle.test.js: validation runs only at simulation start');
