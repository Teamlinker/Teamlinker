import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import routes from 'virtual:generated-pages';
import { setupLayouts } from 'layouts-generated'
import { getAuth} from '@/utils/auth'
import { formartRoutes,filterRoutes} from '@/utils/common'

import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'

import store from '@/store'
import setting from '@/setting'

import { debounce } from 'lodash'

/**
 * 过滤路由生成routesWithLayout
 * @param routes array
 * @return {*}
 */

const routesWithLayout = formartRoutes(setupLayouts(routes),filterRoutes(routes)) //需要过滤的使用layouts的页面集合

NProgress.configure({ showSpinner: false }) // NProgress Configuration
const router = createRouter({
    history: createWebHistory(),
    routes: routesWithLayout
})

const allowList = ['login', 'icons', 'error', 'error-404'] // no redirect whitelist

// 是否需要从后端获取菜单

const isGetMenus = debounce(
  ({ to, from, next, hasRoute }) => {
    store.dispatch('system/adminMenus').then(() => {
      // 根据roles权限生成可访问的路由表
      // 动态添加可访问路由表
      if (!hasRoute) {
        // 请求带有 redirect 重定向时，登录自动重定向到该地址
        const redirect = decodeURIComponent((from.query.redirect || '') as string)
        if (to.path === redirect) {
          next({ ...to, replace: true })
        }else{
          next({ ...to, replace: true })
        }
      }
    }).catch(() => next({ path: setting.indexPage }))
  },1800,{ leading: true }
)

router.beforeEach((to, from, next) => {
  NProgress.start()
  const isLogin = sessionStorage.getItem('token')
  if (!!isLogin) {
    if (to.name === setting.loginPage) {
      next({ path: setting.indexPage })
      NProgress.done()
    }else{
      const hasRoute = router.hasRoute(to.name!)
      isGetMenus({ to, from, next, hasRoute })
      if (allowList.includes(to.name as string) || hasRoute) {
        // 在免登录名单，直接进入
        next()
      }
      NProgress.done()
    }
  }else{
    if (allowList.includes(to.name as string)) {
      // 在免登录名单，直接进入
      next()
      NProgress.done()
    }else{
      next({ path: `${setting.loginPage}`, query: { redirect: to.fullPath }, replace: true })
      NProgress.done()
    }
  }
})

router.afterEach((to, from, failure) => {
  document.title = (to?.meta?.name as string) || document.title

  // 在这里设置需要缓存的组件名称
})

// 创建路由
const createRouterNew = () => createRouter({
  history: setting.routerMode === 'hash' ? createWebHashHistory() : createWebHistory(),
  routes: routes
})

// 重置路由
export function resetRouter() {
  const newRouter = createRouterNew()
  router.matcher = newRouter.matcher
}



export default router