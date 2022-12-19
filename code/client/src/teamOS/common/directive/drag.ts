import {ITeamOS_Point} from "../type";

export const vDrag={
    mounted(el:HTMLElement, binding, vnode, prevVnode){
        el.draggable=true;
        let point:ITeamOS_Point=binding.value;
        let left:any,top:any,parentWidth:number,parentHeight:number,startLeft:number,startTop:number,parentElement:HTMLElement
        const onDragStart=(ev: DragEvent)=>{
            let target=ev.currentTarget as HTMLElement
            if(binding.arg) {
                target=document.getElementById(binding.arg)
            }
            left=ev.pageX - target.offsetLeft
            top=ev.pageY - target.offsetTop
            let ele:HTMLElement;
            startLeft=(ev.pageX-left)/parentWidth*100
            startTop=(ev.pageY-top)/parentHeight*100;
            if(!parentElement) {
                while(ele=target.parentElement) {
                    if(ele.tagName.toLowerCase()=="body" || ele.style.position=="absolute" || ele.style.position=="relative") {
                        parentHeight=ele.clientHeight;
                        parentWidth=ele.clientWidth;
                        parentElement=ele;
                        break
                    }
                    target=ele;
                }
            } else {
                parentHeight=parentElement.clientHeight;
                parentWidth=parentElement.clientWidth;
            }
            let img = new Image();
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            img.width=0;
            img.height=0;
            img.style.opacity="0"
            ev.dataTransfer.setDragImage(img, 0, 0);
        }
        const onDrag=(ev: any)=>{
            let calcLeft:number,calcTop:number
            if(ev.pageX==0) {
                calcLeft=startLeft
            } else if(ev.pageX<left) {
                calcLeft=(ev.pageX-left)/parentWidth*100
            } else {
                calcLeft=(ev.pageX-left)/parentWidth*100
            }
            if(ev.pageY==0) {
                calcTop=startTop;
            } else if(ev.pageY<top) {
                calcTop=0
            } else {
                calcTop=(ev.pageY-top)/parentHeight*100;
            }
            point.left = `${calcLeft}%`;
            point.top=`${calcTop}%`
        }
        const onDragOver=(ev: any)=>{
            ev.stopPropagation()
            ev.preventDefault()
        }
        el.addEventListener("dragstart",onDragStart)
        el.addEventListener("drag",onDrag)
        el.addEventListener("dragover",onDragOver)
    },
}