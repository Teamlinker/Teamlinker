import { defineComponent } from "vue";
import { useStore } from '@/store'
import {useBreadcrumb} from './useBreadcrumb'

const Breadcrumb = defineComponent({
    name:'Breadcrumb',
    props:{
        route:{
            type:Object,
            dafault:{}
        }
    },
    
    setup(props, { attrs, slots, emit }){
        const store = useStore()
        const routes = store.getters['system/adminMenus']
        
        
        return {
            props,routes,
            attrs, slots, emit
        }
    },
    
    render(){
        const { attrs, slots, emit,routes } = this
        const matched =  this.$route.matched
        const {routeMatched} = useBreadcrumb(matched,routes)
        // console.log(useBreadcrumb(matched,routes))
        return (
            <div className={slots.default ? "headerMain" : "headerMain_right"} v-slots={this.$slots}>
                {
                    slots.default && slots.default()
                }
                <a-breadcrumb>
                    {
                        routeMatched && routeMatched.map(routeItem => {

                            return <a-breadcrumb-item><router-link to={ {name: routeItem.name} }>{routeItem.meta.name}</router-link></a-breadcrumb-item>
                            // let breadcrumbArray = []
                            // const breadcrumb = (name,link) => {
                            //     if(name){
                            //         return <a-breadcrumb-item><router-link to={ {name: link} }>{name}</router-link></a-breadcrumb-item>
                            //     }else{
                            //         return null
                            //     }
                            // }
                            
                            // if(routeItem.meta.parent){
                            //     if(routeItem.meta.parent.indexOf('/') != -1){
                            //         //多级父菜单
                            //         let parents = routeItem.meta.parent
                            //         parents = parents.split('/')
                            //         for(let i=0;i<parents.length;i++){
                            //             breadcrumbArray.push(breadcrumb(parents[i]))
                            //         }
                                    
                            //     }else{
                            //         //子级父菜单
                            //         breadcrumbArray.push(breadcrumb(routeItem.meta.parent))
                            //     }
                            // }
                            // breadcrumbArray.push(breadcrumb(routeItem.meta.name,routeItem.name))
                            // return breadcrumbArray
                        })
                    }
                </a-breadcrumb>
            </div>
        )
    }
})

export default Breadcrumb