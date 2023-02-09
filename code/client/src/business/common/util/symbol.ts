import {InjectionKey, Ref} from "vue";

export const injectProjectInfo=Symbol() as InjectionKey<{
    id:string,
    permission:Ref<number>,
    key:Ref<string>
}>