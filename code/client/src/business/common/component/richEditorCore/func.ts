import {nextTick} from "vue";
import {RichEditorEvent} from "./event";
import {RichEditorHandle} from "./handle";
import {EEditor_Content_Line_Config_Type, IEditor_Content_Line, IEditor_Content_Line_Config} from "./types";

function handleLink(obj:RichEditorEvent,link:string) {
    let lineList=obj.getLineList()
    let root=obj.getRoot()
    let selectElementList=obj.getSelectElementList()
    if(selectElementList.length==1) {
        let selectLine=lineList[Array.from(root.value.children).indexOf(selectElementList[0])]
        if(selectLine.selectStartIndexPath.length>0 && selectLine.selectEndIndexPath.length>0) {
            let newItem:IEditor_Content_Line_Config,newItemValueLength:number
            if(selectLine.selectEndIndexPath[0]>selectLine.selectStartIndexPath[0]) {
                let startItem=selectLine.arr[selectLine.selectStartIndexPath[0]]
                let endItem=selectLine.arr[selectLine.selectEndIndexPath[0]]
                let newItem:IEditor_Content_Line_Config
                for(let i=selectLine.selectStartIndexPath[0]; i<=selectLine.selectEndIndexPath[0]; i++) {
                    let item=selectLine.arr[i]
                    if(item==startItem) {
                        if(selectLine.selectStartIndexPath[1]>0 && item.link!=link) {
                            newItem={
                                style: {
                                    ...item.style
                                },
                                value: item.value.substring(selectLine.selectStartIndexPath[1]),
                                type:EEditor_Content_Line_Config_Type.LINK,
                                link:link
                            }
                            item.value=item.value.substring(0,selectLine.selectStartIndexPath[1])
                            selectLine.arr.splice(i+1,0,newItem)
                            i++
                            selectLine.selectEndIndexPath[0]++
                            startItem=newItem
                        } else {
                            item.link=link
                            item.type=EEditor_Content_Line_Config_Type.LINK
                            startItem=item
                        }
                    } else if(item==endItem) {
                        startItem.value+=item.value.substring(0,selectLine.selectEndIndexPath[1])
                        item.value=item.value.substring(selectLine.selectEndIndexPath[1])
                    } else {
                        startItem.value+=item.value
                        selectLine.arr.splice(i,1)
                        i--
                        selectLine.selectEndIndexPath[0]--
                    }
                }
                let objItem={
                    startItem,
                }
                RichEditorHandle.fixLine(selectLine,objItem)
                nextTick(()=>{
                    let selection=window.getSelection()
                    let range=document.createRange()
                    let startElement=selectElementList[0].childNodes[selectLine.arr.indexOf(objItem.startItem)]
                    range.selectNode(startElement)
                    selection.removeAllRanges()
                    selection.addRange(range)
                })
            } else {
                let item=selectLine.arr[selectLine.selectStartIndexPath[0]]
                if(!item) {
                    return;
                }
                let startIndex:number,endIndex:number,selectItem:IEditor_Content_Line_Config
                let str=item.value.substring(selectLine.selectStartIndexPath[1],selectLine.selectEndIndexPath[1])
                let startStr=item.value.substring(0,selectLine.selectStartIndexPath[1])
                let endStr=item.value.substring(selectLine.selectEndIndexPath[1])
                item.value=startStr
                newItem={
                    value:str,
                    style:{
                        ...item.style
                    },
                    type:EEditor_Content_Line_Config_Type.LINK,
                    link:link
                }
                selectLine.arr.splice(selectLine.selectStartIndexPath[0]+1,0,newItem,{
                    value:endStr,
                    style:{
                        ...item.style
                    },
                    type:item.type,
                    ...(item.link && {
                        link:item.link
                    })
                })
                RichEditorHandle.fixLine(selectLine)
                selectItem=newItem
                nextTick(()=>{
                    let selection=window.getSelection()
                    let range=document.createRange()
                    let element=selectElementList[0].childNodes[selectLine.arr.indexOf(selectItem)];
                    if(!element) {
                        return;
                    }
                    range.selectNode(element)
                    selection.removeAllRanges()
                    selection.addRange(range)
                })
            }
        }
    }
}

function handleImage(obj:RichEditorEvent,link:string,width:number) {
    let lineList=obj.getLineList()
    let root=obj.getRoot()
    let selectElementList=obj.getSelectElementList()
    if(selectElementList.length==1) {
        let selectLine=lineList[Array.from(root.value.children).indexOf(selectElementList[0])]
        RichEditorHandle.handleInnerHtml(selectLine,root.value.children[lineList.indexOf(selectLine)] as HTMLElement,false,obj.onGetLineConfigType)
        if(selectLine.arr.length==0) {
            let imageItem:IEditor_Content_Line_Config={
                type:EEditor_Content_Line_Config_Type.IMAGE,
                link,
                value:"",
                width
            }
            selectLine.arr.push(imageItem)
        } else {
            let selectItem=selectLine.arr[selectLine.selectStartIndexPath[0]]
            let imageItem:IEditor_Content_Line_Config={
                type:EEditor_Content_Line_Config_Type.IMAGE,
                value:"",
                link,
                width
            }
            let newItem:IEditor_Content_Line_Config=JSON.parse(JSON.stringify(selectItem))
            if(newItem.type==EEditor_Content_Line_Config_Type.IMAGE) {
                selectLine.arr.splice(selectLine.selectStartIndexPath[0]+1,0,imageItem)
            } else {
                newItem.value=newItem.value.substring(selectLine.selectStartIndexPath[1])
                selectItem.value=selectItem.value.substring(0,selectLine.selectStartIndexPath[1])
                selectLine.arr.splice(selectLine.selectStartIndexPath[0]+1,0,imageItem,newItem)
            }
        }
    }
}

function handle(obj:RichEditorEvent,style:string,value:string) {
    let lineList=obj.getLineList()
    let root=obj.getRoot()
    let selectElementList=obj.getSelectElementList()
    if(selectElementList.length==1) {
        let selectLine=lineList[Array.from(root.value.children).indexOf(selectElementList[0])]
        if(selectLine.selectStartIndexPath.length>0 && selectLine.selectEndIndexPath.length>0) {
            let newItem:IEditor_Content_Line_Config,newItemValueLength:number
            if(selectLine.selectEndIndexPath[0]>selectLine.selectStartIndexPath[0]) {
                let startItem=selectLine.arr[selectLine.selectStartIndexPath[0]]
                let endItem=selectLine.arr[selectLine.selectEndIndexPath[0]]
                let startIndex,endIndex
                for(let i=selectLine.selectStartIndexPath[0]; i<=selectLine.selectEndIndexPath[0]; i++) {
                    let item=selectLine.arr[i]
                    if(item==startItem) {
                        if(selectLine.selectStartIndexPath[1]>0 && item.style[style]!=value) {
                            let newItem:IEditor_Content_Line_Config
                            if(value) {
                                newItem = {
                                    style: Object.assign({}, item.style, {
                                        [style]: value
                                    }),
                                    value: item.value.substring(selectLine.selectStartIndexPath[1]),
                                    type:EEditor_Content_Line_Config_Type.TEXT
                                }
                            } else {
                                let objStyle={
                                    ...item.style
                                }
                                delete objStyle[style]
                                newItem = {
                                    style: objStyle,
                                    value: item.value.substring(selectLine.selectStartIndexPath[1]),
                                    type:EEditor_Content_Line_Config_Type.TEXT
                                }
                            }
                            item.value=item.value.substring(0,selectLine.selectStartIndexPath[1])
                            selectLine.arr.splice(i+1,0,newItem)
                            i++
                            selectLine.selectEndIndexPath[0]++
                            startItem=newItem
                            startIndex=0
                        } else {
                            if(value) {
                                Object.assign(item.style,item.style,{
                                    [style]:value
                                })
                            } else {
                                delete item.style[style]
                            }
                            startItem=item
                            startIndex=selectLine.selectStartIndexPath[1]
                        }
                    } else if(item==endItem) {
                        if(selectLine.selectEndIndexPath[1]<item.value.length && item.style[style]!=value) {
                            let newItem:IEditor_Content_Line_Config
                            if(value) {
                                newItem={
                                    style:Object.assign({},item.style,{
                                        [style]:value
                                    }),
                                    value:item.value.substring(0,selectLine.selectEndIndexPath[1]),
                                    type:EEditor_Content_Line_Config_Type.TEXT
                                }
                            } else {
                                let objStyle={
                                    ...item.style
                                }
                                delete objStyle[style]
                                newItem = {
                                    style: objStyle,
                                    value: item.value.substring(0,selectLine.selectEndIndexPath[1]),
                                    type:EEditor_Content_Line_Config_Type.TEXT
                                }
                            }
                            item.value=item.value.substring(selectLine.selectEndIndexPath[1])
                            selectLine.arr.splice(i,0,newItem)
                            i++
                            selectLine.selectEndIndexPath[0]++
                            endItem=newItem
                            endIndex=newItem.value.length
                        } else {
                            if(value) {
                                Object.assign(item.style,item.style,{
                                    [style]:value
                                })
                            } else {
                                delete item.style[style]
                            }
                            endItem=item
                            endIndex=selectLine.selectEndIndexPath[1]
                        }
                    } else {
                        if(value) {
                            Object.assign(item.style,item.style,{
                                [style]:value
                            })
                        } else {
                            delete item.style[style]
                        }
                    }
                }
                let objItem={
                    startItem,
                    endItem,
                    startIndex,
                    endIndex
                }
                RichEditorHandle.fixLine(selectLine,objItem)
                nextTick(()=>{
                    let selection=window.getSelection()
                    let range=document.createRange()
                    let startElement=selectElementList[0].childNodes[selectLine.arr.indexOf(objItem.startItem)] as HTMLElement
                    let endElement=selectElementList[0].childNodes[selectLine.arr.indexOf(objItem.endItem)] as HTMLElement
                    if(startElement.nodeType==Node.TEXT_NODE) {
                        range.setStart(startElement,objItem.startIndex)
                    } else if(startElement.nodeType==Node.ELEMENT_NODE) {
                        if(startElement.tagName=="IMG") {
                            range.setStartBefore(startElement)
                        } else {
                            range.setStart(startElement.firstChild,objItem.startIndex)
                        }
                    }
                    if(endElement.nodeType==Node.TEXT_NODE) {
                        range.setEnd(endElement,objItem.endIndex)
                    } else if(endElement.nodeType==Node.ELEMENT_NODE) {
                        if(endElement.tagName=="IMG") {
                            range.setEndAfter(endElement)
                        } else {
                            range.setEnd(endElement.firstChild,objItem.endIndex)
                        }
                    }
                    selection.removeAllRanges()
                    selection.addRange(range)
                })
            } else {
                let item=selectLine.arr[selectLine.selectStartIndexPath[0]]
                if(!item) {
                    return;
                }
                let startIndex:number,endIndex:number,selectItem:IEditor_Content_Line_Config
                if(item.style[style]!=value) {
                    let str=item.value.substring(selectLine.selectStartIndexPath[1],selectLine.selectEndIndexPath[1])
                    let startStr=item.value.substring(0,selectLine.selectStartIndexPath[1])
                    let endStr=item.value.substring(selectLine.selectEndIndexPath[1])
                    item.value=startStr
                    if(value) {
                        newItem=JSON.parse(JSON.stringify(item))
                        newItem.value=str
                        newItem.style=Object.assign({},item.style,{
                            [style]:value
                        })
                    } else {
                        newItem=JSON.parse(JSON.stringify(item))
                        let objStyle={
                            ...item.style
                        }
                        delete objStyle[style]
                        newItem.value=str
                        newItem.style=objStyle
                    }
                    selectLine.arr.splice(selectLine.selectStartIndexPath[0]+1,0,newItem,{
                        value:endStr,
                        style:{
                            ...item.style
                        },
                        type:EEditor_Content_Line_Config_Type.TEXT
                    })
                    RichEditorHandle.fixLine(selectLine)
                    startIndex=0;
                    endIndex=newItem.value.length
                    selectItem=newItem
                } else {
                    selectItem=item
                    startIndex=selectLine.selectStartIndexPath[1]
                    endIndex=selectLine.selectEndIndexPath[1]
                }
                nextTick(()=>{
                    let selection=window.getSelection()
                    let range=document.createRange()
                    let element=selectElementList[0].childNodes[selectLine.arr.indexOf(selectItem)] as HTMLElement;
                    if(!element) {
                        return;
                    }
                    if(element.nodeType==Node.TEXT_NODE) {
                        range.setStart(element,startIndex)
                        range.setEnd(element,endIndex)
                    } else if(element.nodeType==Node.ELEMENT_NODE) {
                        if(element.tagName=="IMG") {
                            range.selectNode(element)
                        } else {
                            range.setStart(element.firstChild,startIndex)
                            range.setEnd(element.firstChild,endIndex)
                        }
                    }
                    selection.removeAllRanges()
                    selection.addRange(range)
                })
            }
        }
    } else if(selectElementList.length>1) {
        let selectLineList:IEditor_Content_Line[]=[]
        selectElementList.forEach((ele)=>{
            selectLineList.push(lineList[Array.from(root.value.children).indexOf(ele)])
        })
        let selection=window.getSelection()
        let range=selection.getRangeAt(0)
        let startOffset=range.startOffset
        let endOffset=range.endOffset
        let startContainer=range.startContainer as HTMLElement
        let endContainer=range.endContainer as HTMLElement
        let selectStartIndexPath=[],selectEndIndexPath=[]
        if(startContainer.tagName=="DIV") {
            selectStartIndexPath=[startOffset,0]
        } else {
            selectStartIndexPath.unshift(startOffset)
            let parentElement=startContainer.parentElement
            if(parentElement.tagName=="DIV") {
                startOffset=Array.from(parentElement.childNodes).indexOf(startContainer as Element)
                selectStartIndexPath.unshift(startOffset)
            } else {
                startOffset=Array.from(parentElement.parentElement.childNodes).indexOf(parentElement as Element)
                selectStartIndexPath.unshift(startOffset)
            }
        }
        if(endContainer.tagName=="DIV") {
            selectEndIndexPath=[endOffset,endContainer.childNodes[endOffset].textContent.length]
        } else {
            selectEndIndexPath.unshift(endOffset)
            let parentElement=endContainer.parentElement
            if(parentElement.tagName=="DIV") {
                endOffset=Array.from(parentElement.childNodes).indexOf(endContainer as Element)
                selectEndIndexPath.unshift(endOffset)
            } else {
                endOffset=Array.from(parentElement.parentElement.childNodes).indexOf(parentElement as Element)
                selectEndIndexPath.unshift(endOffset)
            }
        }
        let startLine=selectLineList[0]
        let endLine=selectLineList[selectLineList.length-1]
        let startItem=startLine.arr[selectStartIndexPath[0]]
        let endItem=endLine.arr[selectEndIndexPath[0]]
        let startSelectItem:IEditor_Content_Line_Config=startItem,endSelectItem:IEditor_Content_Line_Config=endItem
        let startIndex,endIndex
        for(let line of selectLineList) {
            if(line==startLine) {
                for(let i=selectStartIndexPath[0];i<startLine.arr.length;i++) {
                    let item=startLine.arr[i]
                    if(item.style[style]!=value) {
                        if(item==startItem) {
                            let newItem:IEditor_Content_Line_Config
                            if(value) {
                                newItem={
                                    value:item.value.substring(selectStartIndexPath[1]),
                                    style:{
                                        ...item.style,
                                        [style]:value
                                    },
                                    type:EEditor_Content_Line_Config_Type.TEXT
                                }
                            } else {
                                let objStyle={
                                    ...item.style
                                }
                                delete objStyle[style]
                                newItem={
                                    value:item.value.substring(selectStartIndexPath[1]),
                                    style:objStyle,
                                    type:EEditor_Content_Line_Config_Type.TEXT
                                }
                            }
                            item.value=item.value.substring(0,selectStartIndexPath[1])
                            startLine.arr.splice(i+1,0,newItem)
                            i++
                            startSelectItem=newItem
                            startIndex=0
                        } else {
                            if(value) {
                                item.style[style]=value
                            } else {
                                delete item.style[style]
                            }
                        }
                    } else {
                        if(item==startItem) {
                            startIndex=selectStartIndexPath[1]
                        }
                    }
                }
            } else if(line==endLine) {
                for(let i=0;i<=selectEndIndexPath[0];i++) {
                    let item=endLine.arr[i]
                    if(item.style[style]!=value) {
                        if(item==endItem) {
                            let newItem:IEditor_Content_Line_Config
                            if(value) {
                                newItem={
                                    value:item.value.substring(0,selectEndIndexPath[1]),
                                    style:{
                                        ...item.style,
                                        [style]:value
                                    },
                                    type:EEditor_Content_Line_Config_Type.TEXT
                                }
                            } else {
                                let objStyle={
                                    ...item.style
                                }
                                delete objStyle[style]
                                newItem={
                                    value:item.value.substring(0,selectEndIndexPath[1]),
                                    style:objStyle,
                                    type:EEditor_Content_Line_Config_Type.TEXT
                                }
                            }
                            item.value=item.value.substring(selectEndIndexPath[1])
                            endLine.arr.splice(i,0,newItem)
                            endSelectItem=newItem
                            endIndex=newItem.value.length
                        } else {
                            if(value) {
                                item.style[style]=value
                            } else {
                                delete item.style[style]
                            }
                        }
                    } else {
                        if(item==endItem) {
                            endIndex=selectEndIndexPath[1]
                        }
                    }
                }
            } else {
                line.arr.forEach(item=>{
                    if(item.style[style]!=value) {
                        if(value) {
                            item.style[style]=value
                        } else {
                            delete item.style[style]
                        }
                    }
                })
            }
        }
        let objStart={
            startItem:startSelectItem,
            startIndex
        },objEnd={
            endItem:endSelectItem,
            endIndex
        }
        for(let line of selectLineList) {
            if(line==startLine) {
                RichEditorHandle.fixLine(line,objStart)
            } else if(line==endLine) {
                RichEditorHandle.fixLine(line,objEnd)
            } else {
                RichEditorHandle.fixLine(line)
            }
        }
        nextTick(()=>{
            let startElement=selectElementList[0].childNodes[startLine.arr.indexOf(objStart.startItem)] as HTMLElement
            let endElement=selectElementList[selectElementList.length-1].childNodes[endLine.arr.indexOf(objEnd.endItem)] as HTMLElement
            if(startElement.nodeType==Node.TEXT_NODE) {
                range.setStart(startElement,objStart.startIndex)
            } else if(startElement.nodeType==Node.ELEMENT_NODE) {
                if(startElement.tagName=="IMG") {
                    range.setStartBefore(startElement)
                } else {
                    range.setStart(startElement.firstChild,objStart.startIndex)
                }
            }
            if(endElement.nodeType==Node.TEXT_NODE) {
                range.setEnd(endElement,objEnd.endIndex)
            } else if(endElement.nodeType==Node.ELEMENT_NODE) {
                if(endElement.tagName=="IMG") {
                    range.setEndAfter(endElement)
                } else {
                    range.setEnd(endElement.firstChild,objEnd.endIndex)
                }
            }
            selection.removeAllRanges()
            selection.addRange(range)
        })
    }
}

function check(obj:RichEditorEvent,style:string,value:string):boolean {
    let itemList=[]
    obj.getSelectionItemList().forEach(item=>{
        itemList.push(...item.data.filter(item=>{
            return item.type===EEditor_Content_Line_Config_Type.TEXT || item.type===EEditor_Content_Line_Config_Type.LINK
        }))
    })
    for(let item of itemList) {
        if(!item.style || item.style[style]!=value) {
            return false
        }
    }
    return true
}

export class RichEditorFunc {
    static isBold(obj:RichEditorEvent) {
        let ret=check(obj,"fontWeight","bold")
        return ret;
    }
    static bold(obj:RichEditorEvent,isSet:boolean){
        handle(obj,"fontWeight",isSet?"bold":undefined)
    }
    static isItalic(obj:RichEditorEvent) {
        let ret=check(obj,"fontStyle","italic")
        return ret;
    }
    static italic(obj:RichEditorEvent,isSet:boolean){
        handle(obj,"fontStyle",isSet?"italic":undefined)
    }
    static isUnderLine(obj:RichEditorEvent) {
        let ret=check(obj,"textDecoration","underline")
        return ret;
    }
    static underLine(obj:RichEditorEvent,isSet:boolean) {
        handle(obj,"textDecoration",isSet?"underline":undefined)
    }
    static isDeleteLine(obj:RichEditorEvent) {
        let ret=check(obj,"textDecoration","line-through")
        return ret;
    }
    static deleteLine(obj:RichEditorEvent,isSet:boolean) {
        handle(obj,"textDecoration",isSet?"line-through":undefined)
    }
    static fontSize(obj:RichEditorEvent,size:string) {
        handle(obj,"fontSize",size)
    }
    static color(obj:RichEditorEvent,color:string) {
        handle(obj,"color",color)
    }
    static backgroundColor(obj:RichEditorEvent,color:string) {
        handle(obj,"backgroundColor",color)
    }
    static link(obj:RichEditorEvent,link:string) {
        handleLink(obj,link)
    }
    static image(obj:RichEditorEvent,link:string) {
        let img=document.createElement("img")
        img.src=link
        img.onload=()=>{
            handleImage(obj,link,img.width)
            img=null;
        }
    }
}