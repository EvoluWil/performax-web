import type {
  FormResourcesResult,
  ResourceItem,
  ResourceKey,
} from '@/services/form-resources.service';
import type { CsvReferenceConfig } from './csv-import.types';

function normalizeMatch(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function getResourceLabel(item: ResourceItem, resourceKey: ResourceKey): string {
  if (resourceKey === 'financeBanks' && item.code) {
    return `${item.name} (${item.code})`;
  }
  return item.name;
}

export function matchResourceByName(
  items: ResourceItem[] | undefined,
  searchValue: string,
  resourceKey: ResourceKey,
): ResourceItem | undefined {
  if (!items?.length || !searchValue.trim()) return undefined;

  const normalized = normalizeMatch(searchValue);

  const exact = items.filter(
    (item) => normalizeMatch(item.name) === normalized,
  );
  if (exact.length === 1) return exact[0];

  if (resourceKey === 'financeBanks') {
    const byLabel = items.find(
      (item) => normalizeMatch(getResourceLabel(item, resourceKey)) === normalized,
    );
    if (byLabel) return byLabel;

    const byCode = items.filter(
      (item) => normalizeMatch(String(item.code ?? '')) === normalized,
    );
    if (byCode.length === 1) return byCode[0];
  }

  const partial = items.filter((item) => {
    const name = normalizeMatch(item.name);
    return name.includes(normalized) || normalized.includes(name);
  });
  if (partial.length === 1) return partial[0];

  return undefined;
}

export function resolveRowReferences<T extends Record<string, unknown>>(
  row: T,
  references: CsvReferenceConfig[],
  resources: FormResourcesResult,
): {
  resolvedIds: Record<string, string | undefined>;
  unresolvedRefs: string[];
} {
  const resolvedIds: Record<string, string | undefined> = {};
  const unresolvedRefs: string[] = [];

  for (const ref of references) {
    const rawValue = String(row[ref.csvKey] ?? '').trim();

    if (!rawValue) {
      resolvedIds[ref.targetKey] = undefined;
      if (ref.required) {
        unresolvedRefs.push(ref.csvKey);
      }
      continue;
    }

    const items = resources[ref.resourceKey];
    const match = matchResourceByName(items, rawValue, ref.resourceKey);

    if (match) {
      resolvedIds[ref.targetKey] = match.id;
    } else {
      resolvedIds[ref.targetKey] = undefined;
      unresolvedRefs.push(ref.csvKey);
    }
  }

  return { resolvedIds, unresolvedRefs };
}

export function getReferenceOptions(
  resources: FormResourcesResult,
  resourceKey: ResourceKey,
) {
  return (resources[resourceKey] ?? []).map((item) => ({
    value: item.id,
    label: getResourceLabel(item, resourceKey),
  }));
}
