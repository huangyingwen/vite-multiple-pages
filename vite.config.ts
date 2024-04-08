import { defineConfig } from 'vite';
import path from 'path';
import postCssPxToRem from 'postcss-pxtorem';
import svgLoader from 'vite-svg-loader';
import mpa from 'vite-plugin-multi-pages';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svgLoader(),
    mpa({
      scanDir: 'src/pages',
      defaultOpenPage: '/',
      ignorePageNames: '',
    }),
  ],
  css: {
    postcss: {
      plugins: [
        postCssPxToRem({
          rootValue: 192,
          propList: ['*'],
        }),
      ],
    },
  },
  base: './',
  /**
   * 与“根”相关的目录，构建输出将放在其中。如果目录存在，它将在构建之前被删除。
   * @default 'dist'
   */
  // outDir: 'dist',
  server: {
    // hostname: '0.0.0.0',
    host: 'localhost',
    port: 3333,
    // // 是否自动在浏览器打开
    // open: true,
    // // 是否开启 https
    // https: false,
    // // 服务端渲染
    // ssr: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3333/',
        changeOrigin: true,
        ws: true,
        rewrite: pathStr => pathStr.replace('/api', ''),
      },
    },
  },
  resolve: {
    // 导入文件夹别名
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
