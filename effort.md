**Pravidlo:** Ku každému promptu pre kódovacieho agenta — read-only
investigačnému aj implementačnému — asistent (chat) pripíše na koniec **jeden
riadok** s odporúčaným modelom a effortom (úrovňou uvažovania). Užívateľ pred
vložením prepne v pickeri model + effort. Odporúčanie je návrh; užívateľ má vždy
override.

**Formát riadku:**
→ [Model/tier], effort [level] (profil X)
napr.: → stredný model, effort medium (profil B)

**Standing default (nastav raz, nemeň):** paralelný multi-agent režim (fan-out
cez viac agentov naraz) = OFF. Keď treba prejsť veľa súborov naraz, šírku rieši
kontrolovaný fan-out napísaný priamo v RECON prompte (sekvenčne, okamžitý
výstup, neoverené označ NEOVERENÉ) — nie automatický multi-agent režim.

**Tiery modelov** (mapuj na aktuálne názvy u svojho poskytovateľa — menia sa):

| Tier | Charakteristika | Príklady názvov |
|---|---|---|
| malý / rýchly | najlacnejší, najrýchlejší, slabší úsudok | Haiku, GPT-mini, Flash, Lite |
| stredný | vyvážený pomer cena/výkon, každodenná práca | Sonnet, GPT, Pro, Medium |
| top | najsilnejší reasoning, najdrahší | Opus, GPT-max, Ultra, Large |

**Profily:**

| Profil | Kedy | Tier | Effort |
|---|---|---|---|
| A — Mechanické | docs path-repoint, footer, typo, čisto mechanické (nula úsudku) | malý / stredný | low–medium |
| B — Bežná práca | FE komponent, bežný endpoint, nekritická logika | stredný | medium |
| C — Kritické | kalkulačný engine, licencia, plugin loader, cenníkový parser, auth/security | top | high (max ak fakt zložité) |
| D — Široký audit / RECON | cross-cutting čítanie naprieč repom, architektonické rozhodnutie | top | high / max |

**Princíp výberu:**
- **Riziko, nie veľkosť.** Malá zmena vo vysoko-rizikovom komponente (engine,
  licencia, auth) = top tier, aj keby mala 15 riadkov. Veľký nízko-rizikový docs
  reformat = malý/stredný tier. Ak je v „mechanickej" úlohe čo i len kúsok
  úsudku, posuň z A do B.
- **Vyšší effort ≠ lepší výstup.** Pri úlohe, ktorú model zvláda, je extra
  effort odpad tokenov. Nemaxuj z princípu.
- **Profil sa vyberá na štarte session a v jej priebehu sa nemení** (prepnutie
  modelu/effortu môže zneplatniť prompt cache). Režim 1 úloha = 1 session to
  spĺňa sám.

**Effort levely:** low / medium / high / max. Najvyššie úrovne nemusia byť
dostupné pri každom modeli ani u každého poskytovateľa — over v pickeri.
Aktuálne názvy modelov aj effort úrovní over vo svojom nástroji, menia sa.
