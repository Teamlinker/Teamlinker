import {nextTick, toRaw} from "vue";
import {ELineConfigType, Line, LineConfig} from "./type";


export class RichEditorHandle {
    static handle(line:Line){
        let str=""
        for(let obj of line.arr) {
            let ele:HTMLElement
            if(obj.type==ELineConfigType.TEXT) {
                if(obj.style && Object.keys(obj.style).length>0) {
                    ele=document.createElement("span")
                } else {
                    str+=obj.value
                    continue;
                }
            } else if(obj.type==ELineConfigType.LINK) {
                ele=document.createElement("a")
                ele.setAttribute("href",obj.link)
                ele.setAttribute("target","_blank")
                ele.style.cursor="pointer"
            } else if(obj.type==ELineConfigType.IMAGE) {
                ele=document.createElement("img")
                ele.setAttribute("src",obj.link)
                ele.setAttribute("width",String(obj.width))
                ele.setAttribute("height","auto")
            }
            if(obj.style) {
                for(let key in obj.style) {
                    ele.style[key]=obj.style[key]
                }
            }
            if(ele) {
                ele.innerText=obj.value
                str+=ele.outerHTML
            }
        }
        return str;
    }
    static handleInnerHtml(item:Line,root:HTMLElement,relocate:boolean=false){
        item.selectEndIndexPath=[]
        item.selectStartIndexPath=[]
        item.arr=[]
        root.childNodes.forEach(node=>{
            if(node.nodeType==Node.TEXT_NODE) {
                let objTemp:LineConfig={
                    value:node.nodeValue,
                    style:{},
                    type:ELineConfigType.TEXT
                }
                item.arr.push(objTemp)
            } else if(node.nodeType==Node.ELEMENT_NODE) {
                let obj=<LineConfig>{
                    value:"",
                    style:{}
                }
                let ele=node as HTMLElement
                if(ele.tagName=="SPAN") {
                    obj.type=ELineConfigType.TEXT
                    obj.value=ele.innerText??""
                } else if(ele.tagName=="A") {
                    obj.type=ELineConfigType.LINK
                    obj.link=ele.getAttribute("href")
                    obj.value=ele.innerText??""
                } else if(ele.tagName=="IMG") {
                    obj.type=ELineConfigType.IMAGE
                    obj.link=ele.getAttribute("src")
                    obj.width=parseInt(ele.getAttribute("width"))
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
        let range=selection.getRangeAt(0)
        let startOffset=range.startOffset
        let endOffset=range.endOffset
        let startContainer=range.startContainer as HTMLElement
        let endContainer=range.endContainer as HTMLElement
        if(root.contains(startContainer)) {
            if(root==startContainer) {
                if(startContainer.childNodes.length==0 || startOffset>=startContainer.childNodes.length) {
                    item.selectStartIndexPath=[startOffset>0?(startOffset-1):0,startContainer.childNodes.length==0?0:(startContainer.lastChild.textContent?startContainer.lastChild.textContent.length:0)]
                } else {
                    item.selectStartIndexPath=[startOffset,startContainer.lastChild.textContent.length]
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
                            range.setStart(ele.firstChild,item.selectStartIndexPath[1])
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
                            range.setEnd(ele.firstChild,item.selectEndIndexPath[1])
                        }

                    }
                }
            })
        }
    }
    static fixLine(line:Line,objItem?:{startItem?:LineConfig,endItem?:LineConfig,startIndex?:number,endIndex?:number}){
        for(let i=1;i<line.arr.length;i++) {
            let obj=line.arr[i]
            let preObj=line.arr[i-1]
            if((obj.style && preObj.style && JSON.stringify(obj.style)===JSON.stringify(preObj.style) && obj.type==preObj.type && obj.type==ELineConfigType.TEXT) || (!obj.value && obj.type!=ELineConfigType.IMAGE)) {
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
            if(!obj.value && obj.type!=ELineConfigType.IMAGE) {
                line.arr.splice(i,1)
                i--
            }
        }
    }
}