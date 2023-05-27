import {ECommon_Application_Mode} from "../../common/types";
import {Ref} from "vue";

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $deployMode: Ref<ECommon_Application_Mode>;
    }
}

export {}