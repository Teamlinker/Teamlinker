// @ts-ignore
import {defineConfig} from 'vite'
import path from "path";
// @ts-ignore
import dts from "vite-plugin-dts"
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [dts({
    rollupTypes:true
  })],
  build: {
    outDir: "dist", //输出文件名称
    lib: {
      entry: path.resolve(__dirname, "./index.ts"), //指定组件编译入口文件
      name: "TLMeetingServer",
      fileName: "TLMeetingServer",
    }
  },
})
