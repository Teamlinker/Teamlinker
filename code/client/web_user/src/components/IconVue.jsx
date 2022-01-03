import { defineComponent,createVNode } from "vue";
import  * as $Icon from '@ant-design/icons-vue'

const IconVue = defineComponent({
  name:'IconVue',
  props:{
    icon:{
        type:String,
        dafault:''
    }
  },
  setup(props){
    return {
      props
    }
  },
  render(){
    const {props} = this;
    return createVNode($Icon[props.icon])
  }
})

export default IconVue