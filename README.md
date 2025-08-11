## typeindex

[![license](https://img.shields.io/github/license/play-grounds/solid-lite?style=flat-square)](https://opensource.org/licenses/MIT)
![node](https://img.shields.io/badge/node-%3E%3D18.0-339933?logo=node.js&style=flat-square)
![esm-only](https://img.shields.io/badge/ESM-only-ffb000?logo=javascript&logoColor=white&style=flat-square)
![status](https://img.shields.io/badge/status-alpha-orange?style=flat-square)
[![GitHub issues](https://img.shields.io/github/issues/play-grounds/solid-lite?style=flat-square)](https://github.com/play-grounds/solid-lite/issues)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](https://github.com/play-grounds/solid-lite/issues/new/choose)

ES module and CLI to manage `publicTypeIndex.json` entries.

### Install

- Local dev (in this repo):
  - Run scripts directly with Node, or add as a workspace package.
- When published to npm:
  - `npm install -D typeindex` (or install globally)

### CLI

The CLI manages a JSON array in `publicTypeIndex.json` (default path is current working directory). You can override the file path with `--file`.

Basic usage:

```bash
# List entries
npx typeindex read --file ./typeindex/publicTypeIndex.json

# Add an entry
npx typeindex add \
  --forClass Tracker \
  --instance ../public/todo/new.json \
  --registeredWith https://nostr.app/todo.html \
  --file ./typeindex/publicTypeIndex.json

# Remove by index
npx typeindex remove --index 0 --file ./typeindex/publicTypeIndex.json

# Remove by matching fields
npx typeindex remove \
  --forClass Tracker \
  --instance ../public/todo/new.json \
  --registeredWith https://nostr.app/todo.html \
  --file ./typeindex/publicTypeIndex.json
```

Commands:

- `read` (aliases: `list`, `ls`): Prints the array as JSON. Optional `--forClass` filter.
- `add`: Adds an item. Requires `--forClass`, `--instance`, `--registeredWith`. Optional `--type` (default `TypeRegistration`) and `--allowDuplicate`.
- `remove` (aliases: `rm`, `delete`, `del`): Remove by `--index` or by matching fields.

Global options:

- `--file <path>`: Path to the `publicTypeIndex.json`. Defaults to `./publicTypeIndex.json`.

### Library API

```js
import { readTypeIndex, addTypeRegistration, removeTypeRegistration } from 'typeindex';

// Read
const items = await readTypeIndex({ file: './typeindex/publicTypeIndex.json', filter: { forClass: 'Tracker' } });

// Add
await addTypeRegistration(
  {
    forClass: 'Tracker',
    instance: '../public/todo/new.json',
    registeredWith: 'https://nostr.app/todo.html'
  },
  { file: './typeindex/publicTypeIndex.json' }
);

// Remove
await removeTypeRegistration(
  { forClass: 'Tracker', instance: '../public/todo/new.json' },
  { file: './typeindex/publicTypeIndex.json' }
);
```

### Notes

- The JSON file is expected to contain an array. If it doesn't exist, it will be created on first write.
- Duplicates are prevented by default (match on `type`, `forClass`, `instance`, `registeredWith`). Use `--allowDuplicate` to override in CLI or `{ allowDuplicate: true }` in API.
