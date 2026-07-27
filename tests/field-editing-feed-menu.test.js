const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'core', 'field-editing.js'), 'utf8');

function render(isMobile){
  const panel = { innerHTML: '' };
  const context = {
    console,
    isMobile: () => isMobile,
    document: {
      addEventListener: () => {},
      getElementById: id => id === 'ctxPanel' ? panel : null
    },
    window: {},
    requestAnimationFrame: () => {},
    FM: {
      idx: 0,
      fields: [{ type: 'feed', p: 'F', lbl: 'F', val: '100', opt: true }]
    }
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  context.renderFbar();
  return panel.innerHTML;
}

const desktop = render(false);
assert.match(desktop, /<input class="fbar-val" id="fbarVal" type="text" value="100"/);
assert.match(desktop, /oninput="fieldPanelInput\(this\)"/);
assert.match(desktop, /id="feedModeButton"/);
assert.match(desktop, /id="feedModeMenu"/);
assert.doesNotMatch(desktop, /<select class="fbar-feedmode"/);

const mobile = render(true);
assert.match(mobile, /<span class="fbar-val" id="fbarVal"/);
assert.doesNotMatch(mobile, /<input class="fbar-val"/);
assert.match(mobile, /<select class="fbar-feedmode"/);
assert.doesNotMatch(mobile, /id="feedModeMenu"/);

console.log('desktop feed menu and mobile native selector regression passed');
