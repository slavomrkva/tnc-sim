# Cutting-logic reference comparison

Overall: **FAIL**

## web

Grid cell: X 0.320641 mm, Y 0.320856 mm, Z 0.322581 mm.

| Result | Witness | Difference |
|---|---|---|
| PASS | M-RL |  |
| PASS | M-RR |  |
| PASS | B-R1.250-RL |  |
| PASS | B-R1.250-RR |  |
| PASS | B-R2.500-RL |  |
| PASS | B-R2.500-RR |  |
| PASS | B-R4.750-RL |  |
| PASS | B-R4.750-RR |  |
| PASS | C-10-RL |  |
| PASS | C-10-RR |  |
| PASS | C-90-RL |  |
| PASS | C-90-RR |  |
| PASS | C-170-RL |  |
| PASS | C-170-RR |  |
| PASS | D-200-CENTER |  |
| PASS | D-200-DRILL |  |
| PASS | D-201 |  |
| PASS | D-208 |  |
| PASS | D-209 |  |
| FAIL | L-FAUTO-T1 | expected 420.5; observed 333.3 |
| PASS | L-NUMERIC | expected 333.3; observed 333.3 |
| FAIL | C200-FAUTO | expected 321.5; observed 321 |
| PASS | C200-NUMERIC | expected 222.2; observed 222.2 |
| FAIL | C201-FAUTO | expected 219.5; observed 219 |
| PASS | C201-RETRACT | expected 111.1; observed 111.1 |
| PASS | C209-DOWN | expected 500; observed 500 |

## android

Grid cell: X 0.320641 mm, Y 0.320856 mm, Z 0.322581 mm.

| Result | Witness | Difference |
|---|---|---|
| PASS | M-RL |  |
| PASS | M-RR |  |
| PASS | B-R1.250-RL |  |
| PASS | B-R1.250-RR |  |
| PASS | B-R2.500-RL |  |
| PASS | B-R2.500-RR |  |
| PASS | B-R4.750-RL |  |
| PASS | B-R4.750-RR |  |
| PASS | C-10-RL |  |
| PASS | C-10-RR |  |
| PASS | C-90-RL |  |
| PASS | C-90-RR |  |
| PASS | C-170-RL |  |
| PASS | C-170-RR |  |
| PASS | D-200-CENTER |  |
| PASS | D-200-DRILL |  |
| PASS | D-201 |  |
| PASS | D-208 |  |
| PASS | D-209 |  |
| FAIL | L-FAUTO-T1 | expected 420.5; observed 333.3 |
| PASS | L-NUMERIC | expected 333.3; observed 333.3 |
| FAIL | C200-FAUTO | expected 321.5; observed 321 |
| PASS | C200-NUMERIC | expected 222.2; observed 222.2 |
| FAIL | C201-FAUTO | expected 219.5; observed 219 |
| PASS | C201-RETRACT | expected 111.1; observed 111.1 |
| PASS | C209-DOWN | expected 500; observed 500 |

The oracle is derived from the cited documentation, the NC program and Tool Table geometry. Current simulator output is only the observed side of the comparison.
