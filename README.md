# Screenplay Claude

A professional, single-file screenplay editor built with React (via CDN). Dark-themed writing surface, industry-standard Final Draft–style formatting, scene & character sidebars, autosave, PDF/Fountain/Plain-text export, and a built-in AI writing assistant powered by Claude.

## Run locally

Just open `index.html` in any modern browser — no build step required.

Or run the static server:

```bash
npm install
npm start
```

Then visit the URL it prints.

## Features

- **Intelligent auto-formatting** — type `INT.`/`EXT.` for scene headings, `CUT TO:` for transitions, `(` at the start of a dialogue line for parentheticals
- **Smart Enter/Tab flow** — context-aware element switching (Scene → Action → Character → Dialogue → Action)
- **⌘1–7** sets element type explicitly (Scene Heading / Action / Character / Parenthetical / Dialogue / Transition / Shot)
- **Autocomplete** for character names, scene prefixes, and transitions
- **Left sidebar** — clickable scene list, automatically numbered
- **Right sidebar** — auto-detected characters ranked by line count, plus the AI Assistant
- **AI Assistant** — 8 presets (Next line, Finish scene, Punch up, Pro notes, Format check, Beat options, Voice check, Logline) plus freeform chat. Brings your Anthropic API key (stored only in your browser)
- **Help mode** — toggle the `?` button in the top bar to get rich extended explanations on every control as you hover
- **Title page editor**
- **Autosave** to browser localStorage
- **Export** to PDF (paginated Courier 12pt), Fountain, or plain text — plus a JSON backup/restore

## Stack

- React 18 (CDN, no build)
- Babel Standalone (in-browser JSX)
- jsPDF for PDF export
- Courier Prime via Google Fonts
- `serve` for the static deploy

## License

Personal project.
