import {Icon} from "./icon";
import {reactive} from "vue";
import {Base} from "../common/util/base";

class IconManager extends Base {
    private iconList=reactive<Icon[]>([])
    add(item:Icon) {
        this.iconList.push(item)
    }
    remove(name:string) {
        for(let i=0;i<this.iconList.length;i++) {
            let obj=this.iconList[i]
            if(obj.name==name) {
                this.iconList.splice(i,1);
                break;
            }
        }
    }
    setList(items:Icon[]) {
        this.iconList.splice(0,this.iconList.length,...items)
    }
    getList() {
        return this.iconList;
    }
    sort() {
        let ele=document.getElementById("teamOS-iconWindow")
        let height=ele.clientHeight
        let width=ele.clientWidth
        let count=Math.floor((height-40)/(Icon.height+20))
        this.iconList.sort((a,b)=>{
            if(a.name>b.name) {
                return 1
            } else {
                return -1;
            }
        })
    }
    clear() {
        this.iconList.splice(0,this.iconList.length)
    }
}

export const iconManager=new IconManager();