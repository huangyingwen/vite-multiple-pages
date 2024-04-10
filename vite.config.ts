import { defineConfig, PluginOption } from 'vite';
import path from 'path';
import postCssPxToRem from 'postcss-pxtorem';
import svgLoader from 'vite-svg-loader';
import { globSync } from 'glob';
import ejs from 'ejs';
import fs from 'fs/promises';
import cesium from 'vite-plugin-cesium-build';

function kk(opts: {
  template: string;
  input: string;
  filename: string;
  inject?: { [key in string]: any };
}): PluginOption {
  const files = globSync(opts.input, {
    cwd: __dirname,
  }).map(f => ({
    entry: `${f}/${opts.filename}`,
    name: f.split('/').reverse()[0],
  }));

  let isDev = false;

  const htmls: string[] = [];
  return {
    name: 'my-example', // 此名称将出现在警告和错误中
    options: options => {
      options.input = files.reduce((input, { name }) => {
        input[name] = `${name}.html`;
        return input;
      }, {});
      return options;
    },
    config: async (_config, { command }) => {
      isDev = command !== 'build';
      if (isDev) return;

      await Promise.all(
        files.map(async ({ name, entry }) => {
          const html = await ejs.renderFile(opts.template, {
            title: name,
            ...opts.inject,
            script: `<script type="module" crossorigin src="${entry}"></script>`,
          });
          htmls.push(path.resolve(__dirname, `${name}.html`));
          await fs.writeFile(`${name}.html`, html);
        }),
      );
    },
    load: id => {
      if (htmls.includes(id)) {
        fs.rm(id);
      }
    },
    transformIndexHtml: {
      order: 'pre',
      handler: async (html, ctx) => {
        if (!isDev) return html;
        const url = new URL(ctx.originalUrl, ctx.server.resolvedUrls.local[0]);

        let filename = url.pathname;
        if (filename.startsWith(`/`)) {
          filename = filename.substring(1);
        }
        if (filename.endsWith('/')) {
          filename = filename.substring(0, filename.length - 1);
        }

        const file = files.find(a => a.name === filename);
        if (file) {
          return ejs.renderFile(opts.template, {
            title: file.name,
            script: `<script type="module" crossorigin src="${file.entry}"></script>`,
          });
        }

        return html;
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    cesium(),
    svgLoader(),
    kk({
      input: `./src/pages/*`,
      filename: 'index.ts',
      template: './public/template.html',
    }),
  ],
  optimizeDeps: {},
  base: './',
  /**
   * 与“根”相关的目录，构建输出将放在其中。如果目录存在，它将在构建之前被删除。
   * @default 'dist'
   */
  // outDir: 'dist',
  server: {
    host: '0.0.0.0',
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
