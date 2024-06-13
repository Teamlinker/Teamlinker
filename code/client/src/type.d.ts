import {Ref} from "vue";
import {ECommon_Application_Mode} from "../../common/types";


declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $deployMode: Ref<ECommon_Application_Mode>;
    }
}
