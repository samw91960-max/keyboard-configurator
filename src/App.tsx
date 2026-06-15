import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import templatesData from "./data/templates.json";
import partsData from "./data/parts.json";
import { CompatibilityNotice } from "./components/CompatibilityNotice";
import { ComponentPanel } from "./components/ComponentPanel";
import { KeyboardPreview } from "./components/KeyboardPreview";
import { TemplateSelector } from "./components/TemplateSelector";
import { playKeySound } from "./services/audioEngine";
import { createSearchProvider } from "./services/search";
import type {
  BuildSelection,
  KeyboardTemplate,
  PerKeyCustomization,
  PerKeyCustomizations,
  PartsCatalog,
} from "./types/domain";
import { firstCompatibleParts, validateBuild } from "./utils/compatibility";

const templates = templatesData as KeyboardTemplate[];
const catalog = partsData as PartsCatalog;
const initialTemplate = templates[0];
const initialCompatibleParts = firstCompatibleParts(initialTemplate, catalog);

function App() {
  const [selection, setSelection] = useState<BuildSelection>({
    templateId: initialTemplate.id,
    switchId: catalog.switches[0].id,
    soundPackId: catalog.soundPacks[0].id,
    ...initialCompatibleParts,
  });
  const [query, setQuery] = useState("");
  const [searchCount, setSearchCount] = useState<number | null>(null);
  const [selectedKeyId, setSelectedKeyId] = useState(initialTemplate.keys[0].id);
  const [keyCustomizations, setKeyCustomizations] = useState<PerKeyCustomizations>({});

  const selectedTemplate =
    templates.find((template) => template.id === selection.templateId) ?? initialTemplate;
  const selectedKeycap =
    catalog.keycaps.find((keycap) => keycap.id === selection.keycapId) ?? catalog.keycaps[0];
  const selectedSwitch =
    catalog.switches.find((switchOption) => switchOption.id === selection.switchId) ??
    catalog.switches[0];
  const selectedPcb = catalog.pcbs.find((pcb) => pcb.id === selection.pcbId) ?? catalog.pcbs[0];
  const selectedPlate =
    catalog.plates.find((plate) => plate.id === selection.plateId) ?? catalog.plates[0];
  const selectedCase =
    catalog.cases.find((keyboardCase) => keyboardCase.id === selection.caseId) ??
    catalog.cases[0];
  const selectedDiffuser =
    catalog.diffusers.find((diffuser) => diffuser.id === selection.diffuserId) ??
    catalog.diffusers[0];
  const selectedSoundPack =
    catalog.soundPacks.find((soundPack) => soundPack.id === selection.soundPackId) ??
    catalog.soundPacks[0];
  const selectedKey =
    selectedTemplate.keys.find((key) => key.id === selectedKeyId) ?? selectedTemplate.keys[0];
  const selectedKeyCustomization = keyCustomizations[selectedKey.id] ?? {};
  const customKeyCount = Object.keys(keyCustomizations).length;

  const issues = useMemo(
    () => validateBuild(selection, selectedTemplate, catalog),
    [selectedTemplate, selection],
  );

  function updateSelection<K extends keyof BuildSelection>(key: K, value: BuildSelection[K]) {
    setSelection((current) => ({ ...current, [key]: value }));
  }

  function handleTemplateSelect(template: KeyboardTemplate) {
    const compatibleDefaults = firstCompatibleParts(template, catalog);
    setSelection((current) => ({
      ...current,
      ...compatibleDefaults,
      templateId: template.id,
    }));
    setSelectedKeyId(template.keys[0].id);
    setKeyCustomizations({});
  }

  function handleKeyCustomizationChange(
    keyId: string,
    customization: PerKeyCustomization,
  ) {
    setKeyCustomizations((current) => {
      const next = { ...current };

      if (!customization.keycapColor && !customization.switchId) {
        delete next[keyId];
      } else {
        next[keyId] = customization;
      }

      return next;
    });
  }

  function handleResetKeyCustomization(keyId: string) {
    setKeyCustomizations((current) => {
      const next = { ...current };
      delete next[keyId];
      return next;
    });
  }

  async function handleSearch() {
    const provider = createSearchProvider();
    const [templateResult, partResult] = await Promise.all([
      provider.searchTemplates(query),
      provider.searchParts(query),
    ]);
    setSearchCount(templateResult.items.length + partResult.items.length);
  }

  function handlePlaySound(keyId = selectedKey.id) {
    setSelectedKeyId(keyId);
    const switchId = keyCustomizations[keyId]?.switchId ?? selection.switchId;
    const switchOption =
      catalog.switches.find((item) => item.id === switchId) ?? selectedSwitch;
    void playKeySound(switchOption, selectedSoundPack);
  }

  return (
    <main className="min-h-screen bg-[#F5F3EE] px-4 py-5 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-stone-500">MVP Prototype</p>
            <h1 className="mt-1 text-2xl font-bold tracking-normal text-ink sm:text-3xl">
              客制化键盘制作系统
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
              从模板开始组合键帽、轴体、PCB、定位板、外壳、均光板和声音包，实时查看兼容性与装配效果。
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-[460px]">
            <label className="sr-only" htmlFor="catalog-search">
              搜索模板或部件
            </label>
            <input
              className="h-10 min-w-0 flex-1 rounded-md border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
              id="catalog-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="预留网络查询接口，先搜索本地 JSON"
              type="search"
              value={query}
            />
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-black"
              onClick={handleSearch}
              type="button"
            >
              <Search className="h-4 w-4" />
              搜索
            </button>
          </div>
        </header>

        {searchCount !== null ? (
          <div className="mb-4 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-600">
            本地模拟搜索找到 {searchCount} 条结果。后续可在 `src/services/search.ts` 替换成网络 API。
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-5">
            <TemplateSelector
              onSelect={handleTemplateSelect}
              selectedTemplate={selectedTemplate}
              templates={templates}
            />
            <CompatibilityNotice issues={issues} />
            <KeyboardPreview
              customKeyCount={customKeyCount}
              customizations={keyCustomizations}
              diffuser={selectedDiffuser}
              keycap={selectedKeycap}
              keyboardCase={selectedCase}
              onKeyPress={handlePlaySound}
              pcb={selectedPcb}
              plate={selectedPlate}
              selectedKeyId={selectedKey.id}
              soundPack={selectedSoundPack}
              switchOption={selectedSwitch}
              template={selectedTemplate}
            />
          </div>

          <ComponentPanel
            catalog={catalog}
            onAudition={handlePlaySound}
            onChange={updateSelection}
            onKeyCustomizationChange={handleKeyCustomizationChange}
            onResetKeyCustomization={handleResetKeyCustomization}
            selectedKey={selectedKey}
            selectedKeyCustomization={selectedKeyCustomization}
            selection={selection}
            template={selectedTemplate}
          />
        </div>
      </div>
    </main>
  );
}

export default App;
