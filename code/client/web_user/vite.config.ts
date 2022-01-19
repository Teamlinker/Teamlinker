import { defineConfig,loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import legacy from '@vitejs/plugin-legacy'
// import ViteComponents, { AntDesignVueResolver } from 'vite-plugin-components'
import ViteComponents from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import WindiCSS from 'vite-plugin-windicss'
import ViteIcons, { ViteIconsResolver } from 'vite-plugin-icons'
import svgLoader from 'vite-svg-loader'
import { viteMockServe } from 'vite-plugin-mock'
import styleImport from 'vite-plugin-style-import'
import { resolve } from 'path'
// const CWD = process.cwd()

// 环境变量
// const BASE_ENV_CONFIG = loadEnv('', CWD)
// const DEV_ENV_CONFIG = loadEnv('development', CWD)
// const PROD_ENV_CONFIG = loadEnv('production', CWD)
// const { VITE_BASE_URL, VITE_DROP_CONSOLE } = loadEnv(mode, CWD)
export default defineConfig({
  server: {
    // host:'0.0.0.0',
    // open: true,
    port: 8081,
    proxy: {
      '/api': {
        target: 'http://175.27.166.37:13000',
        changeOrigin: true
      }
    },
  },
  plugins: [
    vue(),
    vueJsx({
      // options are passed on to @vue/babel-plugin-jsx
    }),
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    // styleImport({
    //   libs: [
    //     {
    //       libraryName: 'ant-design-vue',
    //       esModule: true,
    //       resolveStyle: (name) => {
    //         return `ant-design-vue/es/${name}/style/index`
    //       }
    //     }
    //   ]
    // }),
    viteMockServe({
      mockPath: "./src/mock",
      // localEnabled:true,
      supportTs: false
    }),
    ViteComponents({
      resolvers: [
        AntDesignVueResolver(),
        ViteIconsResolver()
      ],
      directoryAsNamespace: true,
      extensions:['vue','jsx'],
    }),
    Pages({
      extensions: ['vue', 'md'],
    }),
    Layouts(),
    WindiCSS(),
    ViteIcons(),
    svgLoader()
  ],
  css:{
    preprocessorOptions:{
      scss:{
        additionalData:`@use 'sass:math';@import "./src/style/common.scss";`
      }
    }
  },
  // 别名
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'], // 导入时想要省略的扩展名列表 .vue不支持
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, './src')
      }
    ]
  },
  // 打包配置
  build: {
    // cssCodeSplit: false, // 启用/禁用 CSS 代码拆分 禁用后 css拆成独立文件
    sourcemap: true, // 是否打包sourcemap
    terserOptions: {
      compress: {
        keep_infinity: true,
        // drop_console: VITE_DROP_CONSOLE
      }
    }
  }
})
