const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function load(lang) {
  const context = {
    console, Math, JSON, RegExp, Date, parseFloat, parseInt, isFinite,
    _synHighlightLine: line => line,
    document: { getElementById: () => null },
    localStorage: { getItem: () => null, setItem: () => {} },
    I18N: { getLang: () => lang }
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(read('core/data-tables.js'), context, { filename: 'data-tables.js' });
  vm.runInContext(read('core/learn-tutorial.js'), context, { filename: 'learn-tutorial.js' });
  vm.runInContext('var LEARN = { open:true, lesson:-1, slide:0, task:-1, lastResults:null };', context);
  return context;
}

const en = load('en');
const manuals = vm.runInContext('LEARN_MANUALS', en);
const lessons = vm.runInContext('LESSONS', en);
const carded = lessons.filter(lesson => lesson.card);
assert.ok(carded.length >= 1, 'at least one lesson provides a reference card');

Object.keys(manuals).forEach((key) => {
  const manual = manuals[key];
  assert.match(manual.url, /^https:\/\/content\.heidenhain\.de\/doku\/tnc_guide\/pdf_files\/TNC640\/[\w-]+\/[\w-]+\/[\w-]+\.pdf$/,
    key + ' links to the official HEIDENHAIN document server');
  assert.ok(Number.isInteger(manual.pages) && manual.pages > 0, key + ' records its page count');
});

carded.forEach((lesson) => {
  const card = lesson.card;
  assert.ok(card.refs && card.refs.length, lesson.id + ' cites the official manual');
  card.refs.forEach((ref) => {
    const manual = manuals[ref.doc];
    assert.ok(manual, lesson.id + ' cites a known manual: ' + ref.doc);
    assert.ok(Number.isInteger(ref.page) && ref.page >= 1 && ref.page <= manual.pages,
      lesson.id + ' page ' + ref.page + ' exists in ' + ref.doc);
    assert.ok(ref.label && ref.label.trim(), lesson.id + ' labels every reference');
  });
  assert.ok(lesson.slides && lesson.slides.length, lesson.id + ' keeps slides as the fallback');

  const index = lessons.indexOf(lesson);
  const html = vm.runInContext('_learnCardHtml(LESSONS[' + index + '])', en);
  card.refs.forEach((ref) => {
    assert.ok(html.includes(manuals[ref.doc].url + '#page=' + ref.page), 'link opens the cited page');
    assert.ok(html.includes(' ' + ref.page + ' '), 'the page number is printed for offline use');
  });
  assert.match(html, /target="_blank" rel="noopener noreferrer"/, 'manual links open safely in a new tab');
  assert.doesNotMatch(html, /undefined|\[object Object\]/, 'card renders without missing fields');

  assert.strictEqual(vm.runInContext('_learnCard(LESSONS[' + index + '])', en), card,
    'English shows the reference card');
  assert.strictEqual(vm.runInContext('_learnCard(LESSONS[' + index + '])', load('de')), null,
    'an English card is never shown in German; German cards come from the LESSONS_DE overlay');

  vm.runInContext('LEARN.lesson = ' + index + '; LEARN.theoryOpen = true;', en);
  const theory = vm.runInContext('_learnTheoryHtml(LESSONS[' + index + '])', en);
  assert.match(theory, /<details class="lp-theory"/, 'the card stays available during practice');
  assert.doesNotMatch(theory, /lp-slides-nav/, 'a card lesson shows no slide navigation');
});

// German: the overlay supplies its own cards with pages of the German editions.
const de = load('de');
vm.runInContext(read('web/i18n-lessons-de.js'), de, { filename: 'i18n-lessons-de.js' });
const manualsDe = vm.runInContext('LEARN_MANUALS_DE', de);
const lessonsDe = vm.runInContext('LESSONS', de);
assert.deepStrictEqual(Object.keys(manualsDe).sort(), Object.keys(manuals).sort(), 'German covers the same manuals');
lessonsDe.forEach((lesson, index) => {
  if (!lessons[index].card) return;
  const card = lesson.card;
  assert.strictEqual(card && card.lang, 'de', lesson.id + ' has a German card');
  assert.strictEqual(vm.runInContext('_learnCard(LESSONS[' + index + '])', de), card, 'German shows the German card');
  const html = vm.runInContext('_learnCardHtml(LESSONS[' + index + '])', de);
  card.refs.forEach((ref) => {
    const manual = manualsDe[ref.doc];
    assert.ok(manual && ref.page >= 1 && ref.page <= manual.pages, lesson.id + ' page ' + ref.page + ' exists in the German ' + ref.doc);
    assert.ok(html.includes(manual.url + '#page=' + ref.page), 'German link opens the German manual');
  });
  assert.doesNotMatch(html, /undefined|\[object Object\]/, 'German card renders without missing fields');
});

console.log('learn-reference-card.test.js: ' + carded.length + ' reference card(s) verified');
