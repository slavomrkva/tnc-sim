const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const overlayClasses = new Set();
const classList = {
  add(name) { overlayClasses.add(name); },
  remove(name) { overlayClasses.delete(name); },
  toggle() {}
};

const elements = {
  bugOverlay: { classList },
  bugStatus: { textContent: '', innerHTML: '', style: {} },
  bugSendBtn: { dataset: {}, style: {}, textContent: '', disabled: false },
  bugDesc: { value: '', placeholder: '', focus() {} },
  bugChoiceProblem: { classList },
  bugChoiceSuggest: { classList },
  bugWarn: { textContent: '' },
  code: { value: 'BEGIN PGM TEST MM\nEND PGM TEST MM' }
};

const context = {
  APP_VERSION: 'test',
  LEARN: null,
  problemsData: [],
  _bugErrors: [],
  document: {
    body: { getAttribute() { return null; } },
    getElementById(id) { return elements[id] || null; }
  },
  navigator: {
    userAgent: 'test',
    platform: 'test',
    maxTouchPoints: 0,
    language: 'en'
  },
  window: {
    screen: { width: 100, height: 100 },
    devicePixelRatio: 1
  },
  setTimeout(callback) { callback(); return 0; },
  clearTimeout() {},
  console
};
context.window.window = context.window;

vm.createContext(context);
const source = fs.readFileSync(path.join(__dirname, '..', 'core', 'bug-report.js'), 'utf8');
vm.runInContext(source, context, { filename: 'core/bug-report.js' });

let fetchCount = 0;
const sentPayloads = [];
context._bugGetToken = () => Promise.resolve('valid-test-token');
context.fetch = async (_url, options) => {
  fetchCount += 1;
  sentPayloads.push(JSON.parse(options.body));
  return { ok: true, json: async () => ({ url: `https://example.test/${fetchCount}` }) };
};

async function flushPromises() {
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
}

(async () => {
  context.problemsData = [{ line: 1, sev: 'err', msg: 'Example validator error' }];
  for (const kind of ['bug', 'suggest']) {
    context.openBugReport(kind);
    assert.strictEqual(elements.bugSendBtn.dataset.sent, '0');
    assert.strictEqual(elements.bugDesc.value, '', 'diagnostics must not prefill the description');
    assert.strictEqual(elements.bugSendBtn.disabled, true);
    const requestsBeforeSend = fetchCount;
    context.sendReport();
    await flushPromises();
    assert.strictEqual(fetchCount, requestsBeforeSend, 'empty description must not be sent');

    elements.bugDesc.value = '   ';
    context._bugUpdateSendState();
    assert.strictEqual(elements.bugSendBtn.disabled, true, 'whitespace is not a description');

    elements.bugDesc.value = kind === 'bug' ? 'A test problem' : 'A test suggestion';
    context._bugUpdateSendState();
    assert.strictEqual(elements.bugSendBtn.disabled, false);

    const expectedSendLabel = kind === 'bug' ? 'Send report' : 'Send suggestion';
    assert.strictEqual(elements.bugSendBtn.textContent, expectedSendLabel);

    context.sendReport();
    await flushPromises();

    assert.strictEqual(fetchCount, requestsBeforeSend + 1);
    assert.match(sentPayloads.at(-1).body, /## Description\nA test /);
    assert.strictEqual(elements.bugSendBtn.dataset.sent, '1');
    assert.strictEqual(elements.bugSendBtn.textContent, 'Close');
    assert.strictEqual(elements.bugSendBtn.disabled, false);

    context.sendReport();
    assert.strictEqual(fetchCount, requestsBeforeSend + 1);
    assert.strictEqual(overlayClasses.has('open'), false);
  }

  console.log('bug report success button regression passed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
