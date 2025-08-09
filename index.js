import { promises as fs } from 'fs';
import path from 'path';

function resolveFilePath(filePath) {
  if (!filePath) {
    return path.resolve(process.cwd(), 'publicTypeIndex.json');
  }
  return path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
}

async function readArrayFromFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const data = raw.trim() === '' ? [] : JSON.parse(raw);
    if (!Array.isArray(data)) {
      throw new Error('publicTypeIndex.json must contain a JSON array');
    }
    return data;
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

async function writeArrayToFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function entriesEqual(a, b) {
  return (
    a?.type === b?.type &&
    a?.forClass === b?.forClass &&
    a?.instance === b?.instance &&
    a?.registeredWith === b?.registeredWith
  );
}

function matchesCriteria(item, criteria = {}) {
  if (criteria.forClass && item.forClass !== criteria.forClass) return false;
  if (criteria.instance && item.instance !== criteria.instance) return false;
  if (criteria.registeredWith && item.registeredWith !== criteria.registeredWith) return false;
  return true;
}

export async function readTypeIndex(options = {}) {
  const filePath = resolveFilePath(options.file);
  const items = await readArrayFromFile(filePath);
  if (options.filter?.forClass) {
    return items.filter((i) => i.forClass === options.filter.forClass);
  }
  return items;
}

export async function addTypeRegistration(entry, options = {}) {
  const filePath = resolveFilePath(options.file);
  const item = {
    type: entry.type ?? 'TypeRegistration',
    forClass: entry.forClass,
    instance: entry.instance,
    registeredWith: entry.registeredWith,
  };

  if (!item.forClass || !item.instance || !item.registeredWith) {
    throw new Error('forClass, instance, and registeredWith are required');
  }

  const items = await readArrayFromFile(filePath);
  const duplicate = items.some((i) => entriesEqual(i, item));
  if (duplicate && !options.allowDuplicate) {
    return { added: false, reason: 'duplicate', file: filePath };
  }

  items.push(item);
  await writeArrayToFile(filePath, items);
  return { added: true, file: filePath };
}

export async function removeTypeRegistration(criteria = {}, options = {}) {
  const filePath = resolveFilePath(options.file);
  let items = await readArrayFromFile(filePath);

  let removedCount = 0;
  if (typeof criteria.index === 'number') {
    if (criteria.index >= 0 && criteria.index < items.length) {
      items.splice(criteria.index, 1);
      removedCount = 1;
    }
  } else {
    const before = items.length;
    items = items.filter((i) => !matchesCriteria(i, criteria));
    removedCount = before - items.length;
  }

  if (removedCount > 0) {
    await writeArrayToFile(filePath, items);
  }
  return { removed: removedCount, file: filePath };
}
