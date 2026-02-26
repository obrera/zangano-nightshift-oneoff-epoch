# ⏱ Epoch

A sleek timestamp toolkit for developers. Convert between Unix timestamps, ISO 8601 dates, and human-readable formats — with timezone support and a live clock.

## What It Does

- **Live clock** — real-time Unix timestamp ticking away
- **Instant conversion** — paste a Unix timestamp (seconds or milliseconds) or ISO date and see all formats instantly
- **Timezone grid** — toggle timezones on/off, see the same moment across the world
- **Click to copy** — click any value to copy it to clipboard
- **Notable timestamps** — quick-jump to famous epochs (Unix epoch, Y2K, Bitcoin genesis, 32-bit overflow)
- **Relative time** — see "3h ago" or "in 2d" at a glance

## Run Locally

```bash
bun install
bun dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
bun run build
```

Output goes to `dist/`.

## Live URL

🔗 _TBD — deploying to Vercel/Cloudflare_

## Stack

- TypeScript + Bun
- Vite + React 19
- Zero dependencies beyond React

## Nightshift One-Off

Built during a [Nightshift](https://nightshift.dev) one-off session — one small project, one session, ship it.

## License

MIT
