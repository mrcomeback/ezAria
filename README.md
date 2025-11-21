# EzAria

EzAria is a Node.js CLI and library that scans HTML, generates ARIA roles and labels with the OpenAI API, and emits an accessible copy of your markup.

## Installation

```bash
npm install ezaria
# or
npx ezaria <path-to-html>
```

Make sure `OPENAI_API_KEY` is available (via `.env` or your shell) before running the tool.

## CLI Usage

```bash
npx ezaria ./examplesHtml/input.html
# Output is written to result/output.html by default
```

## Programmatic Usage

```ts
import { addAriaAttributesForAll } from 'ezaria';
import fs from 'fs';

const html = fs.readFileSync('input.html', 'utf-8');
const enriched = await addAriaAttributesForAll(html);
fs.writeFileSync('output.html', enriched);
```

You can also call `addAriaAttributes` to target only anchor and button elements.
