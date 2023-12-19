import {nextTick, toRaw} from "vue";
import {EEditor_Content_Line_Config_Type, IEditor_Content_Line, IEditor_Content_Line_Config} from "./types";

export class RichEditorHandle {
    static handle(line:IEditor_Content_Line,setLineConfigTypeFunc?:(linkElement:HTMLElement,obj:IEditor_Content_Line_Config)=>void){
        let str=""
        for(let obj of line.arr) {
            let ele:HTMLElement
            if(obj.type==EEditor_Content_Line_Config_Type.TEXT) {
                if(obj.style && Object.keys(obj.style).length>0) {
                    ele=document.createElement("span")
                    ele.innerText=obj.value
                    if(obj.style) {
                        for(let key in obj.style) {
                            ele.style[key]=obj.style[key]
                        }
                    }
                } else {
                    str+=obj.value
                    continue;
                }
            } else {
                if(obj.type==EEditor_Content_Line_Config_Type.LINK) {
                    ele=document.createElement("a")
                } else if(obj.type==EEditor_Content_Line_Config_Type.IMAGE) {
                    ele=document.createElement("img")
                } else {
                    ele=document.createElement("a")
                }
                setLineConfigTypeFunc?.(ele,obj)
            }
            if(ele) {
                str+=ele.outerHTML
            }
        }
        return str;
    }
    static handleInnerHtml(item:IEditor_Content_Line, root:HTMLElement, relocate:boolean=false,getLineConfigTypeFunc?:(config:IEditor_Content_Line_Config,linkElement:HTMLElement)=>void){
        item.selectEndIndexPath=[]
        item.selectStartIndexPath=[]
        item.arr=[]
        root.childNodes.forEach(node=>{
            if(node.nodeType==Node.TEXT_NODE) {
                let objTemp:IEditor_Content_Line_Config={
                    value:node.nodeValue,
                    style:{},
                    type:EEditor_Content_Line_Config_Type.TEXT
                }
                item.arr.push(objTemp)
            } else if(node.nodeType==Node.ELEMENT_NODE) {
                let obj=<IEditor_Content_Line_Config>{
                    value:"",
                    style:{}
                }
                let ele=node as HTMLElement
                if(ele.tagName=="SPAN") {
                    obj.type=EEditor_Content_Line_Config_Type.TEXT
                    obj.value=ele.innerText??""
                } else {
                    getLineConfigTypeFunc?.(obj,ele)
                }
                if(ele.style?.color) {
                    obj.style.color=ele.style?.color
                }
                if(ele.style?.fontStyle) {
                    obj.style.fontStyle=ele.style.fontStyle
                }
                if(ele.style?.fontWeight) {
                    obj.style.fontWeight=ele.style.fontWeight
                }
                if(ele.style?.fontSize) {
                    obj.style.fontSize=ele.style.fontSize
                }
                if(ele.style?.backgroundColor) {
                    obj.style.backgroundColor=ele.style?.backgroundColor
                }
                if(ele.style?.textDecoration) {
                    obj.style.textDecoration=ele.style.textDecoration
                }
                item.arr.push(obj)
            }
        })
        let selection=window.getSelection()
        let range:Range
        if(selection.rangeCount>0) {
            range=selection.getRangeAt(0)
        } else {
            range=document.createRange()
            range.selectNodeContents(root)
            range.collapse(false)
        }
        let startOffset=range.startOffset
        let endOffset=range.endOffset
        let startContainer=range.startContainer as HTMLElement
        let endContainer=range.endContainer as HTMLElement
        if(root.contains(startContainer)) {
            if(root==startContainer) {
                if(startContainer.childNodes.length==0 || startOffset>=startContainer.childNodes.length) {
                    item.selectStartIndexPath=[startOffset>0?(startOffset-1):0,startContainer.childNodes.length==0?0:(startContainer.lastChild.textContent?startContainer.lastChild.textContent.length:0)]
                } else {
                    item.selectStartIndexPath=[startOffset,0]
                }
            } else {
                item.selectStartIndexPath.unshift(startOffset)
                let parentElement=startContainer.parentElement
                if(parentElement==root) {
                    startOffset=Array.from(parentElement.childNodes).indexOf(startContainer as Element)
                    item.selectStartIndexPath.unshift(startOffset)
                } else {
                    startOffset=Array.from(parentElement.parentElement.childNodes).indexOf(parentElement as Element)
                    item.selectStartIndexPath.unshift(startOffset)
                }
            }
        }
        if(root.contains(endContainer)) {
            if(root==endContainer) {
                if(endContainer.childNodes.length==0 || endOffset>=endContainer.childNodes.length) {
                    item.selectEndIndexPath=[endOffset>0?(endOffset-1):0,endContainer.childNodes.length==0?0:(endContainer.lastChild.textContent?endContainer.lastChild.textContent.length:0)]
                } else {
                    item.selectEndIndexPath=[endOffset,0]
                }
            } else {
                item.selectEndIndexPath.unshift(endOffset)
                let parentElement=endContainer.parentElement
                if(parentElement==root) {
                    endOffset=Array.from(parentElement.childNodes).indexOf(endContainer as Element)
                    item.selectEndIndexPath.unshift(endOffset)
                } else {
                    endOffset=Array.from(parentElement.parentElement.childNodes).indexOf(parentElement as Element)
                    item.selectEndIndexPath.unshift(endOffset)
                }
            }
        }
        if(relocate) {
            while (startContainer.tagName!=="DIV") {
                startContainer=startContainer.parentElement
            }
            while (endContainer.tagName!=="DIV") {
                endContainer=endContainer.parentElement
            }
            nextTick(()=>{
                if(startContainer==root) {
                    let ele=startContainer.childNodes[item.selectStartIndexPath[0]]
                    if(!ele) {
                        return
                    }
                    if(ele.nodeType==Node.TEXT_NODE) {
                        range.setStart(ele,item.selectStartIndexPath[1])
                    } else if(ele.nodeType==Node.ELEMENT_NODE) {
                        if((ele as HTMLElement).tagName=="BR") {
                            range.selectNode(ele)
                            return;
                        } else if ((ele as HTMLElement).tagName=="IMG"){
                            range.selectNode(ele)
                            range.collapse(false)
                            return;
                        } else {
                            if((ele as HTMLElement).contentEditable=="true") {
                                range.setStart(ele.firstChild,item.selectStartIndexPath[1])
                            }
                        }
                    }
                }
                if(endContainer==root) {
                    let ele=endContainer.childNodes[item.selectEndIndexPath[0]] as HTMLElement
                    if(!ele) {
                        return
                    }
                    if(ele.nodeType==Node.TEXT_NODE) {
                        range.setEnd(ele,item.selectEndIndexPath[1])
                    } else if(ele.nodeType==Node.ELEMENT_NODE) {
                        if(ele.tagName=="BR" || ele.tagName=="IMG") {
                            range.selectNode(ele)
                            return;
                        } else {
                            if((ele as HTMLElement).contentEditable==="true") {
                                range.setEnd(ele.firstChild,item.selectEndIndexPath[1])
                            }
                        }

                    }
                }
            })
        }
    }
    static fixLine(line:IEditor_Content_Line, objItem?:{startItem?:IEditor_Content_Line_Config,endItem?:IEditor_Content_Line_Config,startIndex?:number,endIndex?:number}){
        for(let i=1;i<line.arr.length;i++) {
            let obj=line.arr[i]
            let preObj=line.arr[i-1]
            if((obj.style && preObj.style && JSON.stringify(obj.style)===JSON.stringify(preObj.style) && obj.type==preObj.type && obj.type==EEditor_Content_Line_Config_Type.TEXT) || (!obj.value && obj.type!=EEditor_Content_Line_Config_Type.IMAGE)) {
                let len=preObj.value.length
                preObj.value+=obj.value
                line.arr.splice(i,1)
                i--;
                if(objItem) {
                    if(toRaw(objItem.startItem)===toRaw(obj)) {
                        objItem.startItem=preObj
                        objItem.startIndex+=len
                    }
                    if(toRaw(objItem.endItem)===toRaw(obj)) {
                        objItem.endItem=preObj
                        objItem.endIndex+=len
                    }
                }
            }
        }
        for(let i=0;i<line.arr.length;i++) {
            let obj=line.arr[i]
            if(!obj.value && obj.type!=EEditor_Content_Line_Config_Type.IMAGE) {
                line.arr.splice(i,1)
                i--
            }
        }
    }
}