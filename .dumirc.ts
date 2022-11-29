import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'Ant Components',
    nav: [
      { title: 'Guide', link: '/guide' },
      { title: 'Components', link: '/components' },
    ],
    // rtl: true,
    footer: `Open-source MIT Licensed | Copyright © 2022-present
<br />
Powered by kevinyjn@gmail.com`,
  },
  /**
   * @name 开启 hash 模式
   * @description 让 build 之后的产物包含 hash 后缀。通常用于增量发布和避免浏览器加载缓存。
   * @doc https://umijs.org/docs/api/config#hash
   */
  hash: true,
  history: { type: 'hash' },
  base: process.env.NODE_ENV === 'development' ? '/' : './',
  publicPath: process.env.NODE_ENV === 'development' ? '/' : './',
  // locales: [{id: 'zh-CN', name: '中文'}, {id: 'zh-US', name: 'English'}],
  autoAlias: true,
});
