import { defineComponent, reactive,toRefs } from "vue";
import "./index.scss";
import { useRouter } from "vue-router";
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
    const router = useRouter();
    const id = router.currentRoute.value.query.projectId;
    const menuList = [{ url: "/project/module", name: "模块" },
                      { url: "/project/tag", name: "标签" },
                      { url: "/project/member", name: "成员" }
                     ];
    return {
        id,
        ...toRefs(state),
        menuList,
        props
    }
  },

  render() {
    const {menuList,id} = this
    return (
      <div class="side-box">
        <router-link to={'/project/info?projectId='+id}><div class="back">返回项目</div>
        </router-link>
        <div class="setting">项目设置</div>
        <div class="list">
          {menuList.map((item) => {
            return (
              <router-link to={item.url+'?projectId='+id}>
                <div className="item">{item.name}</div>
              </router-link>
            );
          })}
        </div>
      </div>
    );
  },
});

export default ProSide;
