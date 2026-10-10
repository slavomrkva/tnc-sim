# Vyskúšanie bug reportu

V oboch aplikáciách otvor **Bug report / Suggest an improvement**.

1. Bez popisu musia byť tlačidlá neaktívne.
2. Napíš `TEST – skúška bug reportu`.
3. **Open GitHub issue** otvorí predvyplnené hlásenie. Prihlásenie do GitHubu je potrebné. Na skúšku stačí overiť návrh a zavrieť ho bez odoslania.
4. **Open email** otvorí e-mail na `info@tncsim.org`. GitHub účet netreba; potrebuješ nastavenú e-mailovú aplikáciu. Skontroluj predmet a popis. Odošli len ak chceš naozaj poslať testovací e-mail.
5. **Download report** uloží celý report; na Androide otvorí systémové zdieľanie.
6. Pri dlhom programe sa zobrazí upozornenie na skrátenie návrhu. Stiahni celý report a pridaj ho ako prílohu.
7. Pri **Suggest improvement** návrh nesmie obsahovať NC program.

Automatický funkčný test už prešiel pre web aj Android browser preview. Kliká skutočné tlačidlá a zachytí návrhy bez ich odoslania. Android Filesystem/Share sú v browser teste simulované; spustenie externých aplikácií treba ešte overiť na telefóne.

Spustenie testu v pripravenom cloud prostredí:

```bash
PLAYWRIGHT_MODULE=/workspace/setup/browser/node_modules/playwright-core node /workspace/tnc-sim/tests/bug-report-browser.cjs
```

Vyžaduje lokálne statické servery na portoch 8000 (web) a 8001 (Android www).
