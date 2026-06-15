import templates from "../data/templates.json";
import parts from "../data/parts.json";
import type { KeyboardTemplate, PartsCatalog } from "../types/domain";

export interface SearchResult<T> {
  source: "local-json" | "remote-api";
  items: T[];
}

export interface KeyboardSearchProvider {
  searchTemplates(query: string): Promise<SearchResult<KeyboardTemplate>>;
  searchParts(query: string): Promise<SearchResult<unknown>>;
}

export class LocalMockSearchProvider implements KeyboardSearchProvider {
  async searchTemplates(query: string): Promise<SearchResult<KeyboardTemplate>> {
    const normalizedQuery = query.trim().toLowerCase();
    const templateItems = templates as KeyboardTemplate[];

    return {
      source: "local-json",
      items: templateItems.filter((template) => {
        const haystack = [
          template.name,
          template.layout,
          template.description,
          String(template.keyCount),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      }),
    };
  }

  async searchParts(query: string): Promise<SearchResult<unknown>> {
    const normalizedQuery = query.trim().toLowerCase();
    const catalog = parts as PartsCatalog;
    const allParts = Object.values(catalog).flat();

    return {
      source: "local-json",
      items: allParts.filter((part) =>
        JSON.stringify(part).toLowerCase().includes(normalizedQuery),
      ),
    };
  }
}

export function createSearchProvider(): KeyboardSearchProvider {
  return new LocalMockSearchProvider();
}
