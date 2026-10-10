# TNC Sim

Open online simulator for Heidenhain TNC programming. A static
`index.html` shell loads plain JS/CSS modules in the browser — no installation
or build step needed.

**Live: [tncsim.org](https://tncsim.org)**

![TNC Sim screenshot](og-image.png)

## What it does

- 3D simulation of Klartext programs — `L`, `C`, `CC`, `CR`, `RND`, `CHF`, cycles, Q parameters
- RL/RR radius compensation
- Tool table with flat, ball-nose, torus, and conical tool shapes
- Live syntax highlighting, dark/light theme
- XY toolpath view, tool table, bug reporting built in

## Status

Early release. Bugs are expected — this is **not** a substitute for verification on a real control. Don't use it to make actual machining decisions without checking the program another way first.

This project is built with heavy AI assistance (Claude) rather than written entirely by hand.

## Found a bug?

Use the **Bug report / Suggest an improvement** button inside the app. Describe the problem or suggestion, then open a prefilled public GitHub issue (GitHub login required) or an email draft to info@tncsim.org (no GitHub account needed). Bug reports include the current program, version and device details. Long drafts can be shortened to fit links; download the full report and attach it before sending. The issue is public, so don't send confidential program data. You can also open an issue directly: [github.com/slavomrkva/tnc-sim/issues](https://github.com/slavomrkva/tnc-sim/issues)

The token-free reporting flow is documented in [docs/bug-report-setup.md](docs/bug-report-setup.md).

## Running locally

Clone the repo and serve `index.html` with any static file server. It loads
classic JS/CSS modules from `core/` and `web/`.

```bash
git clone https://github.com/slavomrkva/tnc-sim.git
cd tnc-sim
python3 -m http.server
```

## License

See [LICENSE](LICENSE).

## Disclaimer

Not affiliated with or endorsed by HEIDENHAIN GmbH. "Heidenhain" and "TNC" are trademarks of their respective owner, used here only to describe compatibility.
