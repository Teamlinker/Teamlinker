// @ts-ignore
import {defineConfig} from "vite"
// @ts-ignore
import vue from "@vitejs/plugin-vue"
import path from "path";
// @ts-ignore
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [vue(),dts({
    rollupTypes:true
  })],
  build: {
    outDir: "dist", //输出文件名称
    lib: {
      entry: path.resolve(__dirname, "./index.ts"), //指定组件编译入口文件
      name: "TLCalendar",
      fileName: "TLCalendar",
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
  },
})
