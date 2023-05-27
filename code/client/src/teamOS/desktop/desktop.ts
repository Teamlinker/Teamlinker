import {reactive, ref} from "vue";
import {getBaseColor} from "../common/util/color";
import {Base} from "../common/util/base";


export interface ITeamOS_Desktop_Menu {
    group:string,
    data:{
        name:string,
        value:string
    }[]
}
class Desktop extends Base{
    private backgroundImage=ref("")
    private baseColor:{
        r:number,
        g:number,
        b:number
    }=reactive({
        r:0,
        g:0,
        b:0
    });
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

    clear() {
        this.backgroundImage.value = ""
        this.baseColor.r = 0;
        this.baseColor.g = 0;
        this.baseColor.b = 0;
    }
}

export const desktop=new Desktop();