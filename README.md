# helloNovember

NovemberAI's landing-page UI combines **Site B Explorer** and **Site A Spec** from the shared Claude Design project. See [the design direction](docs/design-direction.md) for the seven recent prompts, source attribution, and content boundaries.

## Run

Requires Node.js 18 or newer. No dependencies to install.

```sh
npm run dev
```

Open http://127.0.0.1:3000. Set `PORT` to change the port.

```sh
npm run check
npm run build
```

The static build is in `dist/`. Source files are in `public/`; the small development server and copy-only build are in `scripts/`.

## Included

- Click-driven Walmart, Airtable, and YouTube conversations with transcripts, speaking waveforms for both participants, inline actions, pause/replay, and opt-in conversation audio.
- Four capability mockups: hands-free execution, full browser, memory, and progress/alerts with replay controls.
- Connected droplet pendant and larger desk-droplet concept toggle, platform SDKs, roadmap, and waitlist UI.
- Original mascot, self-hosted fonts, responsive layouts, keyboard tabs, and reduced-motion support.

The demos do not execute browser tasks. The waitlist does not store or transmit emails. Hardware visuals are concepts, and roadmap dates are retained from the design references. Configure real signup handling and confirm launch details before production use.
