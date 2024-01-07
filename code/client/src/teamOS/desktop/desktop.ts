import {reactive, ref} from "vue";
import {getBaseColor} from "../common/util/color";
import {Base} from "../common/util/base";
import {DropParam} from "../common/directive/drop";
import {ITeamOS_Menu} from "../common/type";


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
    onDropFunc:(destFolderId:string,data:DropParam)=>void
    contextMenu:ITeamOS_Menu[]=[]
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