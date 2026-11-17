# Learn lesson guide — converting a lesson to a reference card

Read this before changing any lesson in `LESSONS` (`core/data-tables.js`).
**L05 (Arcs) is the reference lesson.** When this guide and L05 disagree, L05
is right and this guide must be corrected in the same change.

The goal of the redesign: a lesson should read like a page of a good
programming handbook, not like a slide deck. One scrollable reference page,
exact links into the official HEIDENHAIN manual, then practice.

## 1. Scope of one change

- Convert **one lesson per change**. Do not touch other lessons, the renderer,
  or shared CSS unless the lesson cannot be expressed without it. If it cannot,
  stop and say what is missing instead of inventing a new card section.
- Do not change `tasks` (prompts, hints, `sol`, `starter`, `checks`) while
  converting. Task changes are a separate change with their own verification.
- Keep the existing `slides` array untouched. It is the German and fallback
  content: `_learnCard(L)` returns the card only when the language is `en`.
- Do not commit or push unless the owner asks. No version bump per lesson; the
  whole Learn redesign ships as one update.

## 2. The card schema

Add a `card` object to the lesson, above `slides`. Every field is plain data;
the renderer is `_learnCardHtml()` in `core/learn-tutorial.js`.

```js
card:{
  lead:'One or two sentences. What the block is for and the one decision the learner makes.',
  syntax:[
    { code:'CC X.. Y..', text:'What this block does, in one or two sentences.' },
    { code:'C X.. Y.. DR±', text:'...', figure:function(){ return learnFigFrom(learnSvgArcCC()); } }
  ],
  example:'L X+20 Y+45 F300\nCC X+35 Y+45\nC X+50 Y+45 DR-',
  rules:[ '...', '...' ],
  mistakes:[ '...', '...' ],
  refs:[ { doc:'klartext', page:164, label:'Circle center CC' } ]
}
```

| Field | Limit | Content |
|---|---|---|
| `lead` | max 2 sentences | The idea, not the syntax. At most one or two `<b>` terms. |
| `syntax` | 1–4 entries | `code` is the block pattern with `..` for values and `±` for a sign. `text` max 2 sentences. |
| `example` | 2–6 NC lines | Must be valid Klartext the simulator accepts. Generic numbers. Longer only when the construct needs it: a complete cycle definition (one line per Q parameter) or a subprogram with its call. |
| `rules` | 2–4 items | Facts that are always true on the control. One sentence each. |
| `mistakes` | 2–4 items | Pattern: `what the learner writes — what happens`. Only real, common errors. |
| `refs` | 1–4 entries | Exact manual pages, see section 4. |

Allowed inline HTML in text fields: `<b>` and `<code>` only. Non-ASCII
characters are written as `\uXXXX` escapes, as in the rest of the file.
Section order is fixed by the renderer; do not add, rename or reorder sections.

## 3. Writing rules

- Short declarative sentences. Present tense. Address the learner as "you"
  only where an action is meant.
- Say what the control does, not what the simulator does.
- No marketing tone, no exclamation marks, no emoji, no "Let's", "simply",
  "just", "easy", "powerful", "Pro tip".
- Every sentence must be checkable against the manual page it links to. If you
  cannot find the statement in the manual, leave it out.
- The same fact appears once. Do not repeat a rule in `syntax`, `rules` and
  `mistakes`.
- The card must be readable in under two minutes. If it is longer, cut.

## 4. Official manual links

The manuals are **linked, never copied**. Do not quote sentences, reproduce
tables, or redraw figures from the PDFs. Write the explanation in your own
words and link the page. The "not affiliated with HEIDENHAIN" notice stays.

- Manuals are registered in `LEARN_MANUALS` (`core/learn-tutorial.js`):
  `klartext` (Klartext Programming, 691 pages) and `cycles` (Programming of
  Machining Cycles, 797 pages), TNC 640, software 34059x-18, edition 10/2023.
- `page` is the page number printed in the manual. In these editions it equals
  the PDF page index, so the link is `url + '#page=' + page`.
- `label` is the heading of that manual section, as a short title.
- **Never guess a page number.** Verify it in the PDF itself. The owner keeps
  local copies in `TNCSIM\Docs` (`892903-2C` Klartext, `1303406-23` Cycles).
  If you cannot open the PDF, ask; do not estimate from the table below.
- Link the page where the topic starts, not the chapter overview.
- To use another manual (setup, measuring cycles, ISO), first add it to
  `LEARN_MANUALS` with its verified URL and page count.
- German page numbers are not mapped. Do not enable the card for `de`.

Pages already verified (English editions):

| Topic | Manual | Page |
|---|---|---|
| Program structure / BLK FORM | klartext | 93 / 94 |
| Incremental coordinates | klartext | 91 |
| TOOL CALL | klartext | 133 |
| Radius compensation RL/RR/R0 | klartext | 139 |
| Straight line L | klartext | 161 |
| Chamfer CHF | klartext | 162 |
| Rounding RND | klartext | 163 |
| Circle centre CC | klartext | 164 |
| Arc C around CC | klartext | 165 |
| Arc CR with radius | klartext | 167–168 |
| Tangential arc CT | klartext | 169 |
| Polar: pole CC, LP | klartext | 175 |
| Labels LBL, subprograms | klartext | 252–253 |
| Q parameters, part families | klartext | 281 |
| Cycle call M99 | cycles | 52 |
| Cycle 200 DRILLING | cycles | 78 |
| Cycle 201 REAMING | cycles | 82 |
| Cycle 208 BORE MILLING | cycles | 106 |
| Cycle 209 TAPPING W/ CHIP BRKG | cycles | 139 |
| Absolute and incremental positions | klartext | 91 |
| Feed rate F, FMAX | klartext | 126 |
| Spindle speed S | klartext | 127 |
| Tool radius R, delta values DL/DR | klartext | 131 |
| Polar coordinates overview | klartext | 174 |
| Adding comments | klartext | 200 |
| M functions: spindle and coolant | klartext | 233 |
| Calling a subprogram | klartext | 254 |
| Program-section repeats | klartext | 255 |
| Q parameter types | klartext | 277 |
| Basic arithmetic FN 0–FN 4 | klartext | 283 |
| Cycle call CYCL CALL | cycles | 50 |

Add newly verified pages to this table in the same change.

### German cards

German cards live in `web/i18n-lessons-de.js` (`LESSONS_DE[id].card`, marked
`lang:'de'`) and link to the German editions in `LEARN_MANUALS_DE`
(Klartext `892903-1C`, cycles `1303406-13`). Their page numbers differ from the
English ones, so verify each page in the German PDF. Change the English and the
German card together. Verified German pages:

| Topic | Manual | EN page | DE page |
|---|---|---|---|
| Absolute and incremental positions | klartext | 91 | 94 |
| Program structure / BLK FORM | klartext | 93 / 94 | 96 / 97 |
| Feed rate F / Spindle speed S | klartext | 126 / 127 | 130 / 131 |
| Tool radius R, delta values | klartext | 131 | 134 |
| Calling tool data (TOOL CALL) | klartext | 133 | 136 |
| Radius compensation | klartext | 139 | 143 |
| L / CHF / RND | klartext | 161 / 162 / 163 | 165 / 166 / 167 |
| CC / C / CR | klartext | 164 / 165 / 167 | 168 / 169 / 171 |
| Polar overview / pole CC, LP | klartext | 174 / 175 | 178 / 179 |
| Adding comments | klartext | 200 | 204 |
| M functions: spindle and coolant | klartext | 233 | 237 |
| Labels / subprograms | klartext | 252 / 253 | 256 / 257 |
| Q parameter types / part families | klartext | 277 / 281 | 281 / 285 |
| M99 call, cycles 200, 201, 208, 209 | cycles | 52, 78, 82, 106, 139 | same |

## 5. Figures

The card carries exactly the figures of the lesson's slides, no fewer and no
more. The principle is the same as in the slides; only the layout changed.

- Reuse each slide figure through `learnFigFrom(learnSvg<Name>(...))` with the
  same arguments as in the slide, on the `syntax` entry it explains. Several
  figures on one entry are joined with `+`.
- Do not draw a new figure for a card and do not leave a slide figure out,
  unless the owner asks for it.
- Change the English and the German card together.

## 6. What must keep working

These are current contracts; do not change them while converting a lesson.

- Reading mode shows the whole card in one scroll with **Start practice**
  always available (no slide lock for card lessons).
- In practice the card collapses into the REFERENCE `<details>`; the
  **Official manual** block stays visible on its own below the task feedback.
- Revealed hints render directly above the footer that holds the Hint button
  (`.lp-hints-dock`, part of `foot`).
- `_learnPracticeHtml()` returns `{ body, foot }` (NOTES.md rule 20).
- There is no spotlight tour; do not reintroduce `learn-coach`.
- New UI strings go through `_lt('learn.key', 'English fallback')` and get a
  German entry in `web/i18n.js`. Card content itself is English only for now.
- `core/` is shared with the Android app. List every `core/` file you changed
  in your report so it can be ported deliberately.
- A new runtime file must be added to `index.html` and the service-worker
  precache, with a `CACHE_VERSION` bump. A card needs no new file.

## 7. Verification before you report

1. `node --check core/data-tables.js` and `node --check core/learn-tutorial.js`.
2. `node tests/learn-reference-card.test.js` (refs point to known manuals,
   pages within range) and `node tests/learn-tutorial.test.js`.
3. Open `/?learn=<id>` in a browser, desktop and phone width:
   - the card reads top to bottom without horizontal scroll;
   - every manual link opens the PDF on the stated page;
   - Start practice collapses the card and keeps the manual links;
   - Hint shows directly above the Hint button;
   - every task's solution still passes Check;
   - the console is clean.
4. Switch the language to German: the lesson must still show its slides.

## 8. Report format

End with a short report: lesson id, the card fields you wrote, each manual
page and how you verified it, figures added, `core/` files changed, tests run
with their result, and anything you were unsure about. State plainly what you
did not verify.
