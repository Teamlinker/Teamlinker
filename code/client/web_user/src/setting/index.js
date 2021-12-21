export default {
  /**
   * 基础配置
   * */
  // 系统名称全称和页面标题的后缀
  sysTitle: 'teamlinker',
  // 系统名称简写
  logoTitle: 'teamlinker',
  // 默认首页
  indexPage: '/',
  // 默认登录页
  loginPage: 'login',
  // 路由模式，可选值为 history 或 hash
  routerMode: 'hash',
  // 默认cookie的key参数
  tokenKey: 'teamlinker',
  adminMenus:[
    {
      "name":"index","path":"/","props":true,"meta":{"level":1,"name":"首页","icon":"none","layout":"layouts"}
  },
  // speechstrategy-result
  {
      "name":"goldspeech","path":"/goldspeech","props":true,"meta":{"level":1,"name":"金牌话术","icon":"icon-lujing","layout":"auth"}
  },
  ]

}
