<template>
    <div>
       <div class="version-name">
         {{detail.name}}
         </div>
          <div class="version-description">
          {{detail.description}}
         </div>
        </div>
</template>
<script lang="ts">
import { defineComponent,reactive,toRefs } from 'vue'
import {useRoute} from 'vue-router'
import axios from '@/plugins/axios'
export default defineComponent({
    setup() {
        const state = reactive({
          detail:{}
        })
        const getReleaseDetail = (projectReleaseId:String)=>{
          const params = {
            projectReleaseId:projectReleaseId
          }
           axios.get('/release/item',{params:params}).then((res:any)=>{
             console.log(res,'ress')
             state.detail = res.data
           })
        }
        const route = useRoute()
        const projectReleaseId = route.query.projectReleaseId
        getReleaseDetail(projectReleaseId)
        return{
          ...toRefs(state)
        }
    },
})
</script>

<route lang="yaml">
meta:
  level: 1
  type: 'proside'
  name: "release"
  layout: auth
</route>