import { createStore, useStore as baseUseStore, createLogger, Store } from 'vuex'
import { App } from 'vue'
// https://vitejs.dev/guide/features.html#glob-import
// 动态导入延迟加载 import.meta.glob
// 直接导入所有模块 import.meta.globEager
const modulesFiles = import.meta.globEager('./modules/*.js')
const modules = {}
for (const path in modulesFiles) {
  const moduleName = path.replace(/(.*\/)*([^.]+).*/ig, '$2')
  modulesFiles[path].default && (modules[moduleName] = modulesFiles[path].default)
}
const store = createStore({
  modules
})


// 定义你自己的“useStore”组合函数
export function useStore() {
  return baseUseStore()
}

export default store
