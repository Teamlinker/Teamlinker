import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: 'Dashboard', icon: 'dashboard' }
    }]
  },

  {
    path: '/example',
    component: Layout,
    redirect: '/example/table',
    name: 'teamlinker',
    meta: { title: 'teamlinker', icon: 'el-icon-s-help' },
    children: [
      {
        path: 'project',
        name: '项目管理',
        component: () => import('@/views/table/project'),
        meta: { title: '项目管理', icon: 'table' }
      },
      {
        path: 'user',
        name: '用户管理',
        component: () => import('@/views/table/user'),
        meta: { title: '用户管理', icon: 'table' }
      },
      {
        path: 'team',
        name: '团队管理',
        component: () => import('@/views/table/team'),
        meta: { title: '团队管理', icon: 'table' }
      },
      {
        path: 'issueType',
        name: '事务管理',
        component: () => import('@/views/table/issue'),
        meta: { title: '事务管理', icon: 'table' }
      },
      {
        path:'issueCategorySheme',
        name:'事务类型方案',
        component: () => import('@/views/table/categorySheme'),
        meta: { title: '事务类型方案', icon: 'table' }
      },
      {
        path:'workfow',
        name:'工作流',
        component: () => import('@/views/table/workflow'),
        meta: { title: '工作流', icon: 'table' }
      },
      {
        path:'workfowDraw',
        name:'工作流绘制',
        hidden:true,
        component: () => import('@/views/table/ef/panel'),
        meta: { title: '工作流', icon: 'table' }
      },
      {
        path:'workfowSolution',
        name:'工作流方案',
        component: () => import('@/views/table/workflowSolution'),
        meta: { title: '工作流方案', icon: 'table' }
      },
      // {
      //   path:'fieldSolution',
      //   name:'字段方案',
      //   component: () => import('@/views/table/fieldSolution'),
      //   meta: { title: '字段方案', icon: 'table' }
      // }
      // {
      //   path: 'tree',
      //   name: 'Tree',
      //   component: () => import('@/views/tree/index'),
      //   meta: { title: 'Tree', icon: 'tree' }
      // }
    ]
  },
  {
    path: '/fieldSolution',
    component: Layout,
    redirect: '/fieldSolution/list',
    name: 'fieldSolution',
    meta: { title: 'fieldSolution', icon: 'el-icon-s-help' },
    children: [
      {
        path: 'list',
        name: 'Form',
        component: () => import('@/views/table/fieldSolution'),
        meta: { title: 'fieldSolution', icon: 'table' }
      },
      {
        path: 'configWorkflowSolution',
        name: 'configWorkflowSolution',
        component: () => import('@/views/fieldsolution/configWorkflowSolution'),
        hidden:true,
        meta: { title: 'configWorkflowSolution', icon: 'table' }
      },
      {
        path: 'bindWorkflowSolution',
        name: 'bindWorkflowSolution',
        component: () => import('@/views/fieldsolution/bindWorkflowSolution'),
        hidden:true,
        meta: { title: 'bindWorkflowSolution', icon: 'table' }
      },
      {
        path: 'selectWorkflow',
        name: 'selectWorkflow',
        component: () => import('@/views/fieldsolution/selectWorkflow'),
        hidden:true,
        meta: { title: 'selectWorkflow', icon: 'table' }
      },
      {
        path: 'fs-workflow',
        name: 'fs-workflow',
        component: () => import('@/views/fieldsolution/ef/panel'),
        hidden:true,
        meta: { title: 'fs-workflow', icon: 'table' }
      },
      {
        path: 'workflowField',
        name: 'workflowField',
        component: () => import('@/views/fieldsolution/workflowField'),
        hidden:true,
        meta: { title: 'workflowField', icon: 'table' }
      },
      {
        path: 'addWorkflowField',
        name: 'addWorkflowField',
        component: () => import('@/views/fieldsolution/addWorkflowField'),
        hidden:true,
        meta: { title: 'addWorkflowField', icon: 'table' }
      },
      {
        path: 'addWorkflowField2',
        name: 'addWorkflowField',
        component: () => import('@/views/fieldsolution/addWorkflowField2'),
        hidden:true,
        meta: { title: 'addWorkflowField', icon: 'table' }
      },   
      {
        path: 'addWorkflowField3',
        name: 'addWorkflowField',
        component: () => import('@/views/fieldsolution/addWorkflowField3'),
        hidden:true,
        meta: { title: 'addWorkflowField', icon: 'table' }
      },    
    ]
  },

  // {
  //   path: '/form',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       name: 'Form',
  //       component: () => import('@/views/form/index'),
  //       meta: { title: 'Form', icon: 'form' }
  //     }
  //   ]
  // },

  // {
  //   path: '/nested',
  //   component: Layout,
  //   redirect: '/nested/menu1',
  //   name: 'Nested',
  //   meta: {
  //     title: 'Nested',
  //     icon: 'nested'
  //   },
  //   children: [
  //     {
  //       path: 'menu1',
  //       component: () => import('@/views/nested/menu1/index'), // Parent router-view
  //       name: 'Menu1',
  //       meta: { title: 'Menu1' },
  //       children: [
  //         {
  //           path: 'menu1-1',
  //           component: () => import('@/views/nested/menu1/menu1-1'),
  //           name: 'Menu1-1',
  //           meta: { title: 'Menu1-1' }
  //         },
  //         {
  //           path: 'menu1-2',
  //           component: () => import('@/views/nested/menu1/menu1-2'),
  //           name: 'Menu1-2',
  //           meta: { title: 'Menu1-2' },
  //           children: [
  //             {
  //               path: 'menu1-2-1',
  //               component: () => import('@/views/nested/menu1/menu1-2/menu1-2-1'),
  //               name: 'Menu1-2-1',
  //               meta: { title: 'Menu1-2-1' }
  //             },
  //             {
  //               path: 'menu1-2-2',
  //               component: () => import('@/views/nested/menu1/menu1-2/menu1-2-2'),
  //               name: 'Menu1-2-2',
  //               meta: { title: 'Menu1-2-2' }
  //             }
  //           ]
  //         },
  //         {
  //           path: 'menu1-3',
  //           component: () => import('@/views/nested/menu1/menu1-3'),
  //           name: 'Menu1-3',
  //           meta: { title: 'Menu1-3' }
  //         }
  //       ]
  //     },
  //     {
  //       path: 'menu2',
  //       component: () => import('@/views/nested/menu2/index'),
  //       name: 'Menu2',
  //       meta: { title: 'menu2' }
  //     }
  //   ]
  // },

  // {
  //   path: 'external-link',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'https://panjiachen.github.io/vue-element-admin-site/#/',
  //       meta: { title: 'External Link', icon: 'link' }
  //     }
  //   ]
  // },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
