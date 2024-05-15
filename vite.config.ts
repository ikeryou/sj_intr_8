import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { resolve } from 'path';
import { getTopData } from './sitedata/top';

const IS_DEV = process.env.NODE_ENV !== 'production'
const LANG = 'ja'

const pageData = {
  '/index.html': {
    lang: LANG,
    dev: IS_DEV,
    data: getTopData(),
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, './src/components'),
      context(pagePath) {
        return pageData[pagePath];
      },
    }) as any
  ],
  root: './src',
  base: './',
  server: {
    host: true,
  },
  build: {
    outDir:'../dist/',
    rollupOptions: {
      input: {
        top: resolve(__dirname, './src/index.html'),
      },
      output:{
        assetFileNames: (assetInfo:any) => {
          let extType = assetInfo.name.split('.')[1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'images';
          }
          if(extType === 'css') {
            return `assets/css/style.css`;
          }
          return `assets/${extType}/[name][extname]`;
        },
        chunkFileNames: 'assets/js/main.js',
        entryFileNames: 'assets/js/main.js',
      }
    }
  },
})