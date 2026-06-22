# TNC Sim

Free, open-source online simulator for Heidenhain TNC programming. Runs entirely in the browser — no installation needed.

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

Use the **Bug report** button inside the app — it opens a pre-filled GitHub issue with your program and debug info attached. Or open an issue directly: [github.com/slavomrkva/tnc-sim/issues](https://github.com/slavomrkva/tnc-sim/issues)

## Running locally

It's a single HTML file. Clone the repo and open `index.html` in a browser, or serve it with any static file server.

```bash
git clone https://github.com/slavomrkva/tnc-sim.git
cd tnc-sim
python3 -m http.server
```

## License

See [LICENSE](LICENSE).

## Disclaimer

Not affiliated with or endorsed by HEIDENHAIN GmbH. "Heidenhain" and "TNC" are trademarks of their respective owner, used here only to describe compatibility.
