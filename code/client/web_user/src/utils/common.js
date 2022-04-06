const layoutsAuth = '/src/layouts/auth.vue'
/**
 * 过滤路由
 * @param routes array
 * @return {*}
 */

 export function filterRoutes(routes) {
    return routes.filter(router => {
        return router.meta.layout != 'auth'
    });
}


/**
 * 序列化路由
 * @param routes array
 * @return {*}
 */


 export function formartRoutes(routes,filterRoutes) {
    console.log(routes,filterRoutes)
   let res  = []
   routes.forEach(item => {
       let tmp = {...item}
       res.push(tmp)
   })
   let newRoutes = res
   let childrenRoutes = newRoutes[0].children
   childrenRoutes.forEach((item,index) => {
       filterRoutes.forEach((citem) => {
           if(citem.name === item.name){
               newRoutes.push(item)
               childrenRoutes.splice(index,1)
           }
       })
   })
   // newRoutes[0].children = childrenRoutes
   // newRoutes[0].component = () => import(layoutsAuth)
   return newRoutes
}
