import {reactive, ref} from "vue";
import {getBaseColor} from "../common/util/color";
import {Base} from "../common/util/base";

export interface ITeamOS_Desktop_Event {
    "menuClick":(value:string)=>void
}

export interface ITeamOS_Desktop_Menu {
    group:string,
    data:{
        name:string,
        value:string
    }[]
}
class Desktop extends Base{
    private backgroundImage=ref("")
    private logo=ref("")
    private menu=reactive<ITeamOS_Desktop_Menu[]>([])
    private baseColor:{
        r:number,
        g:number,
        b:number
    }=reactive({
        r:0,
        g:0,
        b:0
    });
    private menuValue=ref("")
    private avatar=ref("")
    private avatarOptions=ref<{
       name:string,
       clickFunc:any
    }[]>([])
    onMenuClick:(value:string)=>void
    setLogo(logo:string) {
        this.logo.value=logo
    }
    setMenu(menu:ITeamOS_Desktop_Menu[],defaultValue?:string) {
        if(this.menu.length>0) {
            this.menu.splice(0)
        }
        this.menu.push(...menu);
        if(defaultValue) {
            this.menuValue.value=defaultValue
        }
    }
    getMenuValue() {
        return this.menuValue
    }
    getLogo() {
        return this.logo
    }
    getMenu() {
        return this.menu
    }
    getBackgroundImage() {
        return this.backgroundImage
    }
    setBackgroundImage(url:string) {
        this.backgroundImage.value=url
        getBaseColor(url).then(([r,g,b])=>{
            this.baseColor.r=r;
            this.baseColor.g=g;
            this.baseColor.b=b;
        })
    }
    getBaseColor() {
        return this.baseColor;
    }
    addEventListener<T extends keyof ITeamOS_Desktop_Event>(eventType:T,func:ITeamOS_Desktop_Event[T]) {
        if(eventType=="menuClick") {
            this.onMenuClick=func
        }
    }
    getAvatar() {
        return this.avatar
    }
    setAvatar(uri:string) {
        this.avatar.value=uri;
    }
    getAvatarOptions() {
        return this.avatarOptions
    }
    setAvatarOptions(options:{
       name:string,
       clickFunc:any
    }[]) {
        this.avatarOptions.value=options;
    }
    clear() {
        this.backgroundImage.value = ""
        this.logo.value = ""
        this.menu.splice(0, this.menu.length)
        this.baseColor.r = 0;
        this.baseColor.g = 0;
        this.baseColor.b = 0;
        this.menuValue.value = ""
        this.avatar.value = ""
        this.avatarOptions.value = []
    }
}

export const desktop=new Desktop();