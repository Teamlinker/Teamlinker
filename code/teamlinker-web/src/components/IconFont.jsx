import { defineComponent,reactive,toRefs } from "vue";
import { createFromIconfontCN } from '@ant-design/icons-vue';
const Icon = createFromIconfontCN({
    scriptUrl: '/public/js/iconfont.js',
    extraCommonProps:{
        style:{
            fill:'#fff'
        }
    }
});
const IconFont = defineComponent({
    name:'IconFont',
    components:{
        Icon
    },
    props:{
        icon:{
            type:String,
            dafault:''
        }
    },
    setup(props){
        const state = reactive({
            type:props.icon
        })
        return {
            ...toRefs(state)
        }
    },
    render(){
        return(
            <>
                <icon class="teamlinker-icon" type={this.type} />
            </>
        )
    }
})

export default IconFont