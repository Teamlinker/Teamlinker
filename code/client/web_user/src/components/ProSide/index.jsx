import { defineComponent, reactive,toRefs } from "vue";
import "./index.scss";
import { useRoute } from "vue-router";
import IconVue from "@/components/IconVue";
const ProSide = defineComponent({
  name: "ProSide",
  components:{
    IconVue
  },
  props: {
    data: {
      type: Object,
      default: {},
    },
  },

  setup(props) {
   
    const state = reactive({
      props
    });
    const route = useRoute()
    const id = route.query.projectId;
    const menuList = [
                      { url: "/project/edit", name: "详情" },
                      { url: "/project/module", name: "模块" },
                      { url: "/project/tag", name: "标签" },
                      { url: "/project/member", name: "成员" }
                     ];
    return {
        id,
        ...toRefs(state),
        menuList,
        props,
        route
    }
  },

  render() {
    const {menuList,id,route} = this
    console.log(id,'id')
    return (
      <div class="side-box">
        <router-link to={'/project/list'}><div class="back">返回项目</div>
        </router-link>
        <div class="setting">项目设置</div>
        <div class="list">
          {menuList.map((item) => {
            return (
              <router-link to={item.url+'?projectId='+id}>
                <div  className={route.path === item.url ? 'item active' : 'item'}>{item.name}</div>
              </router-link>
            );
          })}
        </div>
      </div>
    );
  },
});

export default ProSide;
