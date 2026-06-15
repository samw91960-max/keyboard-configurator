# 客制化键盘制作系统 MVP

一个使用 React、TypeScript、Tailwind CSS 搭建的客制化键盘制作原型。第一版聚焦模板选择、部件组合、兼容性提示、2D 预览和键盘点击试听。

## 目录结构

```txt
custom-keyboard-builder/
  public/
    audio/                  # 生成的轴体和声音包试听音频
  scripts/
    generate-audio.mjs      # 生成 MVP 用的本地 WAV 音频
  src/
    components/             # 页面组件
    data/                   # 本地 JSON 模拟数据
    services/               # 音频播放和预留搜索接口
    types/                  # 领域类型
    utils/                  # 兼容性与颜色工具
    App.tsx
    main.tsx
    index.css
```

## 运行

```bash
npm install
npm run generate:audio
npm run dev
```

浏览器打开 Vite 输出的本地地址，通常是 `http://localhost:5173`。

## 后续扩展入口

- `src/services/search.ts`：网络查询接口预留，后续可以替换成本地索引、后端 API 或第三方搜索。
- `src/components/KeyboardPreview.tsx`：当前是 2D 预览，组件 props 已经集中，可以继续接 3D 渲染层。
- `src/data/*.json`：当前所有模板和部件均来自本地 JSON。
