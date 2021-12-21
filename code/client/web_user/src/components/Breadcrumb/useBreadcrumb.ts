import { reactive, onMounted, onUnmounted } from 'vue'

/**
 * @description 根据接口返回的路由显示面包屑
 * */
export function useBreadcrumb(props:any, arr:any) {
  const Breadcrumb = reactive({
    label:null,
    routeMatched:[]
  })

  const calcBreadcrumb = (val:any,num:Number) => {
    const label = Breadcrumb.label = props[1].path.split('/').slice(1)

    for(let i = 0;i < val.length;i++){
      if(num > 0){
        if(('/' + label[num]) == val[i].path){
          Breadcrumb.routeMatched.push(val[i])
          label.length > (num+1) && calcBreadcrumb(val[i].children,(num + 1))
          break;
        }
      }else{
        if(val[i].name == label[num]){
          Breadcrumb.routeMatched.push(val[i])
          label.length > 1 && calcBreadcrumb(val[i].children,(num + 1))
          break;
        }
      }
      

      
    }
    // console.log(label,val)
  }
  calcBreadcrumb(arr,0)
  // 在页面加载后

  onMounted(() => {
    // // 开始监听
  })
  onUnmounted(() => {
    // 移除监听
  })

  return { 
    routeMatched:Breadcrumb.routeMatched
  }
}
