# Klikrun

A VS Code extension that adds inline ▶ CodeLens above every package.json script entry — click to run instantly with npm, yarn, pnpm, or bun.

![Preview](https://raw.githubusercontent.com/Deri-Kurniawan/klikrun/main/preview.png)

## Features

- **Inline Run Buttons** — CodeLens appears above each script in `package.json` with a `$(play)` icon and the detected package manager name.
- **Multi-Package-Manager Detection** — Automatically detects which package manager(s) your project uses by scanning for lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lock`/`bun.lockb`).
- **Monorepo-Friendly** — Uses the directory of the `package.json` file as the terminal working directory, so nested projects work out of the box.
- **Zero Configuration** — No settings to tweak. Install and go.

## Release Notes

### 0.0.1

Initial release. Click-to-run support for npm, yarn, pnpm, and bun scripts.

### 0.0.2

Optimized bundle size by removing & optimizing assets.