import {nextTick, reactive, Ref} from "vue";
import {RichEditorHandle} from "./handle";
import {RichEditorFunc} from "./func";
import {
    EEditor_Content_Line_Config_Type,
    IEditor_Content_Line,
    IEditor_Content_Line_Config,
    IEditor_Content_Line_Style
} from "./types";

let g_activeEditor:RichEditorEvent
function onDeleteCrossLine(event:KeyboardEvent) {
    let range=window.getSelection()?.getRangeAt(0)
    if(event.key==="Backspace" && g_activeEditor && range && g_activeEditor.getRoot().value?.contains(range.commonAncestorContainer)) {
        if(g_activeEditor.getSelectElementList().length>0 && !window.getSelection().getRangeAt(0)?.collapsed) {
            event.preventDefault()
            event.stopPropagation()
            let list=g_activeEditor.getSelectionItemList()
            let objStartInfo={
                startItem:null,
                startIndex:0
            }
            if(list.length==1) {
                let line=list[0].line
                let startItem=line.arr[line.selectStartIndexPath[0]]
                let endItem=line.arr[line.selectEndIndexPath[0]]
                if(startItem===endItem) {
                    if(startItem.type===EEditor_Content_Line_Config_Type.TEXT || startItem.type===EEditor_Content_Line_Config_Type.LINK) {
                        let start=startItem.value.substring(0,line.selectStartIndexPath[1])
                        let end=startItem.value.substring(line.selectEndIndexPath[1])
                        startItem.value=start+end
                    } else {
                        line.arr.splice(line.selectStartIndexPath[0],1)
                    }
                    objStartInfo.startItem=startItem
                    objStartInfo.startIndex=line.selectStartIndexPath[1]
                } else {
                    for(let obj of list[0].data) {
                        if(obj===startItem) {
                            if(startItem.type===EEditor_Content_Line_Config_Type.TEXT || startItem.type===EEditor_Content_Line_Config_Type.LINK) {
                                startItem.value=startItem.value.substring(0,line.selectStartIndexPath[1])
                            } else {
                                line.arr.splice(line.arr.indexOf(startItem),1)
                            }
                            objStartInfo.startItem=startItem
                            objStartInfo.startIndex=line.selectStartIndexPath[1]
                        } else if(obj===endItem) {
                            if(endItem.type===EEditor_Content_Line_Config_Type.TEXT || endItem.type===EEditor_Content_Line_Config_Type.LINK) {
                                endItem.value=endItem.value.substring(line.selectEndIndexPath[1])
                            } else {
                                line.arr.splice(line.arr.indexOf(endItem),1)
                            }
                        } else {
                            line.arr.splice(line.arr.indexOf(obj),1)
                        }
                    }
                }
                RichEditorHandle.fixLine(line,objStartInfo)
            } else {
                let startLine:IEditor_Content_Line
                for(let i=0;i<list.length;i++) {
                    let obj=list[i]
                    let line=obj.line
                    if(i==0 || i==list.length-1) {
                        if(i==0) {
                            startLine=line
                            for(let i=0;i<obj.data.length;i++) {
                                let startItem=obj.data[i]
                                if(i==0) {
                                    if(startItem.type===EEditor_Content_Line_Config_Type.TEXT || startItem.type===EEditor_Content_Line_Config_Type.LINK) {
                                        startItem.value=startItem.value.substring(0,line.selectStartIndexPath[1])
                                    } else {
                                        line.arr.splice(line.arr.indexOf(startItem),1)
                                    }
                                } else {
                                    line.arr.splice(line.arr.indexOf(startItem),1)
                                }
                            }
                        } else {
                            for(let i=0;i<obj.data.length;i++) {
                                let endItem=obj.data[i]
                                if(i==obj.data.length-1) {
                                    if(endItem.type===EEditor_Content_Line_Config_Type.TEXT || endItem.type===EEditor_Content_Line_Config_Type.LINK) {
                                        endItem.value=endItem.value.substring(line.selectEndIndexPath[1])
                                    } else {
                                        line.arr.splice(line.arr.indexOf(endItem),1)
                                    }
                                } else {
                                    line.arr.splice(line.arr.indexOf(endItem),1)
                                }
                            }
                            startLine.arr=startLine.arr.concat(line.arr)
                            g_activeEditor.getLineList().splice(g_activeEditor.getLineList().indexOf(line),1)
                            RichEditorHandle.fixLine(startLine)
                        }
                    } else {
                        g_activeEditor.getLineList().splice(g_activeEditor.getLineList().indexOf(line),1)
                    }
                }
            }
            nextTick(()=>{
                let selection=window.getSelection()
                let range=document.createRange()
                let index=g_activeEditor.getLineList().indexOf(list[0].line)
                let ele=g_activeEditor.getRoot().value.children[index].childNodes[list[0].line.selectStartIndexPath[0]] as HTMLElement
                if(!ele) {
                    return
                }
                if(ele.nodeType===Node.TEXT_NODE || ele.tagName==="SPAN") {
                    let text=ele.tagName==="SPAN"?ele.innerText:ele.textContent
                    if(list[0].line.selectStartIndexPath[1]>=text.length) {
                        range.setStartAfter(ele)
                        range.setEndAfter(ele)
                    } else {
                        range.setStart(ele,list[0].line.selectStartIndexPath[1])
                        range.setEnd(ele,list[0].line.selectStartIndexPath[1])
                    }
                } else {
                    range.setStartAfter(ele)
                    range.setEndAfter(ele)
                }
                selection.removeAllRanges()
                selection.addRange(range)
                for(let ele of g_activeEditor.getSelectElementList()) {
                    ele.contentEditable="true"
                }
                g_activeEditor.setSelectElementList([])
            })
        }
    }
}


export class RichEditorEvent {
    private selectElementList:HTMLElement[]=[]
    private isMouseDown=false
    private root:Ref<HTMLElement>
    private lineList=reactive<IEditor_Content_Line[]>([])
    private imageHelperElement:HTMLElement
    private resizeImage:HTMLElement
    private resizeObserver:ResizeObserver
    private selectionMenuElement:HTMLElement
    private selectionTextElement:HTMLElement
    private selectionLinkElement:HTMLElement
    private selectionColorElement:HTMLElement
    private linkEditElement:HTMLElement
    private popMenuPosition:Ref<{
        left:number,
        top:number
    }>
    private quotePosition:Ref<{
        left:number,
        top:number
    }>
    private destroyFunc:()=>void
    private destroyQuoteFunc:()=>void
    onUploadFileFunc:(file:File,handleFunc:(fileId:string,path:string)=>void)=>void
    onPopMenuClickFunc:(type:any,handleFunc:(item:IEditor_Content_Line_Config)=>void)=>void
    onCustomMenuClickFunc:(type:EEditor_Content_Line_Config_Type,value:string,link:string,label:string)=>void
    onQuoteListFunc:(keyword:string,handleFunc:(list:{
        value:string,
        label:string,
        photo:string
    }[])=>void)=>void
    onSetLineConfigType:(linkElement:HTMLElement,obj:IEditor_Content_Line_Config)=>void
    onGetLineConfigType:(config:IEditor_Content_Line_Config,linkElement:HTMLElement)=>void
    setSelectElementList(list:HTMLElement[]) {
        this.selectElementList=list
    }
    clear() {
        this.destroyFunc?.()
        this.destroyQuoteFunc?.()
        this.imageHelperElement?.remove()
        this.resizeObserver?.disconnect()
        this.selectionMenuElement?.remove()
        this.linkEditElement?.remove()
        this.popMenuPosition.value=null
        this.quotePosition.value=null
    }
    clearQuote() {
        this.quotePosition.value=null;
    }
    getLineList(){
        return this.lineList
    }
    setLineList(data:IEditor_Content_Line[]) {
        this.lineList.splice(0,this.lineList.length,...data)
    }
    getSelectElementList() {
        return this.selectElementList
    }
    getRoot() {
        return this.root
    }
    addLine(value:string,style?:IEditor_Content_Line_Style){
        let line:IEditor_Content_Line={
            arr:[
                {
                    value:value,
                    ...style,
                    type:EEditor_Content_Line_Config_Type.TEXT
                }
            ],
            selectEndIndexPath:[],
            selectStartIndexPath:[]
        }
        this.lineList.push(line)
    }
    onFocus(item:IEditor_Content_Line, event:MouseEvent){
        g_activeEditor=this
        if(this.selectElementList.length==0) {
            this.selectElementList=[event.currentTarget as HTMLElement]
        }
    }
    onDbClick(event:MouseEvent){
        this.selectElementList=[event.currentTarget as HTMLElement]
    }

    onBlur(item:IEditor_Content_Line, event:FocusEvent){
        RichEditorHandle.handleInnerHtml(item,event.currentTarget as HTMLElement,true,this.onGetLineConfigType)
        if(this.selectionMenuElement) {
            if(!this.selectionMenuElement.contains(event.relatedTarget as HTMLElement) && !this.selectionLinkElement.contains(event.relatedTarget as HTMLElement)) {
                this.selectionMenuElement.style.display="none"
            }
        }
        if(this.imageHelperElement) {
            this.imageHelperElement.style.display="none"
            this.resizeObserver.unobserve(this.imageHelperElement)
            this.resizeImage=null;
        }
        this.popMenuPosition.value=null;
    }

    onEnter(line:IEditor_Content_Line, index:number, event:KeyboardEvent){
        event.preventDefault()
        event.stopPropagation()
        RichEditorHandle.handleInnerHtml(line,event.currentTarget as HTMLElement,false,this.onGetLineConfigType)
        let obj=line.arr[line.selectStartIndexPath[0]]
        let newLine:IEditor_Content_Line={
            arr:line.arr.slice(line.selectStartIndexPath[0]+1),
            selectStartIndexPath:[],
            selectEndIndexPath:[]
        }
        if(!obj || obj.type===EEditor_Content_Line_Config_Type.TEXT || obj.type===EEditor_Content_Line_Config_Type.LINK) {
            let value=obj?.value.substring(line.selectStartIndexPath[1])
            if(value) {
                newLine.arr.unshift({
                    value,
                    style:{
                        ...obj.style
                    },
                    type:EEditor_Content_Line_Config_Type.TEXT
                })
                obj.value=obj.value.substring(0,line.selectStartIndexPath[1])
            } else {
                newLine.arr.unshift({
                    value:"",
                    style:{},
                    type:EEditor_Content_Line_Config_Type.TEXT
                })
            }
        }
        line.arr.splice(line.selectStartIndexPath[0]+1)
        this.lineList.splice(index+1,0,newLine)
        nextTick(()=>{
            this.selectElementList=[this.root.value.children[index+1] as HTMLElement]
            let ele=this.root.value.children[index+1]
            let selection=window.getSelection()
            let range=document.createRange()
            range.selectNodeContents(ele)
            range.collapse(true)
            selection.removeAllRanges()
            selection.addRange(range)
        })
    }
    onDelete(index, item:IEditor_Content_Line, event:MouseEvent){
        let ele=event.currentTarget as HTMLElement
        let selection=window.getSelection()
        let range=selection.getRangeAt(0)
        let startOffset=range.startOffset
        let endOffset=range.endOffset
        let startContainer=range.startContainer as HTMLElement
        let originStartContainer=startContainer
        let endContainer=range.endContainer  as HTMLElement
        let originEndContainer=endContainer
        let selectStartIndexPath=[],selectEndIndexPath=[]
        if(startContainer.tagName=="DIV") {
            selectStartIndexPath=[0,startOffset]
        } else {
            selectStartIndexPath.unshift(startOffset)
            let parentElement=startContainer.parentElement
            if(parentElement.tagName=="DIV") {
                startOffset=Array.from(parentElement.childNodes).indexOf(startContainer as Element)
                selectStartIndexPath.unshift(startOffset)
                startContainer=parentElement
            } else {
                startOffset=Array.from(parentElement.parentElement.childNodes).indexOf(parentElement as Element)
                selectStartIndexPath.unshift(startOffset)
                startContainer=parentElement.parentElement
            }
        }
        if(endContainer.tagName=="DIV") {
            selectEndIndexPath=[0,endOffset]
        } else {
            selectEndIndexPath.unshift(endOffset)
            let parentElement=endContainer.parentElement
            if(parentElement.tagName=="DIV") {
                endOffset=Array.from(parentElement.childNodes).indexOf(endContainer as Element)
                selectEndIndexPath.unshift(endOffset)
                endContainer=parentElement
            } else {
                endOffset=Array.from(parentElement.parentElement.childNodes).indexOf(parentElement as Element)
                selectEndIndexPath.unshift(endOffset)
                endContainer=parentElement.parentElement
            }
        }
        if(selectStartIndexPath[0]==0 && selectStartIndexPath[1]==0 && selectEndIndexPath[0]==0 && selectEndIndexPath[1]==0 && originStartContainer==originEndContainer) {
            if(index>0) {
                event.preventDefault()
                event.stopPropagation()
                RichEditorHandle.handleInnerHtml(item,ele,false,this.onGetLineConfigType)
                let preLine=this.lineList[index-1]
                item.arr=item.arr.filter(obj=>{
                    return obj.value.length>0 || obj.type===EEditor_Content_Line_Config_Type.IMAGE
                })
                let path=[preLine.arr.length-1>=0?preLine.arr.length-1:0,preLine.arr.length>0?preLine.arr[preLine.arr.length-1].value.length:0]
                preLine.arr=preLine.arr.concat(item.arr)
                this.lineList.splice(index,1)
                RichEditorHandle.fixLine(preLine)
                nextTick(()=>{
                    let selection=window.getSelection()
                    let range=document.createRange()
                    let ele=this.root.value.children[index-1].childNodes[path[0]] as HTMLElement
                    if(!ele) {
                        let ele=this.root.value.children[index-1]
                        range.selectNodeContents(ele)
                        range.collapse(true)
                    } else if(ele.nodeType==Node.TEXT_NODE) {
                        range.setStart(ele,path[1])
                        range.setEnd(ele,path[1])
                    } else if(ele.nodeType==Node.ELEMENT_NODE) {
                        if(ele.tagName=="IMG" || ele.tagName=="A") {
                            range.selectNode(ele)
                            range.collapse(false)
                        } else {
                            range.setStart(ele.firstChild,path[1])
                            range.setEnd(ele.firstChild,path[1])
                        }
                    }
                    selection.removeAllRanges()
                    selection.addRange(range)
                })
            }
        }
    }

    onMouseDown(event:MouseEvent){
        this.popMenuPosition.value=null;
        this.clearQuote()
        if(event.detail==1) {
            this.selectElementList=[event.currentTarget as HTMLElement]
            this.isMouseDown=true
        }
    }
    onMouseMove(event:MouseEvent){
        let ele=event.currentTarget as HTMLElement
        if(this.isMouseDown){
            if(!this.selectElementList.includes(ele)){
                this.selectElementList.push(ele)
                for(let obj of this.selectElementList) {
                    if(obj.innerHTML!=="") {
                        obj.contentEditable="false"
                    }
                }
            }
        }
    }

    onMouseUp(event:MouseEvent){
        this.isMouseDown=false
        let selection=window.getSelection()
        if(selection.rangeCount==0) {
            return
        }
        let range=selection.getRangeAt(0)
        if(this.selectElementList.length>0) {
            range=range.cloneRange()
            for(let ele of this.selectElementList) {
                nextTick(()=>{
                    ele.contentEditable="true"
                })
            }
            let startContainer=range.startContainer as HTMLElement
            while (startContainer.tagName!=="DIV") {
                startContainer=startContainer.parentElement
            }
            let endContainer=range.endContainer as HTMLElement
            while (endContainer.tagName!=="DIV") {
                endContainer=endContainer.parentElement
            }
            let children=Array.from(this.root.value.children)
            this.selectElementList=[]
            for(let i=children.indexOf(startContainer);i<=children.indexOf(endContainer);i++) {
                this.selectElementList.push(children[i] as HTMLElement)
            }
            selection.removeAllRanges()
            selection.addRange(range)
            this.handleMenu(event,range)
        }
    }

    onClick(event:MouseEvent) {
        let target=event.target as HTMLElement
        if(target.tagName==="A" || target.parentElement.tagName==="A") {
           let linkElement:HTMLAnchorElement
           if(target.tagName==="A") {
               linkElement=target as HTMLAnchorElement
           } else if(target.parentElement.tagName==="A") {
               linkElement=target.parentElement as HTMLAnchorElement
           }
           let type=linkElement.getAttribute("type")
            if(type) {
                this.onCustomMenuClickFunc?.(Number(type),linkElement.getAttribute("value"),linkElement.getAttribute("link"),linkElement.innerText)
            }
        }
    }

    private generatorSelectionMenu(ele:HTMLElement) {
        let parent=ele.offsetParent
        this.selectionMenuElement=document.createElement("div")
        this.selectionMenuElement.tabIndex=-1
        this.selectionMenuElement.style.position="absolute"
        this.selectionMenuElement.style.borderRadius="5px"
        this.selectionMenuElement.style.boxShadow="0px 0px 2px 2px rgba(169, 169, 169, 0.2)"
        this.selectionMenuElement.style.backgroundColor="white"
        this.selectionMenuElement.style.border="1px solid rgba(169, 169, 169, 0.2)"
        let fontSizeElement=document.createElement("span")
        fontSizeElement.setAttribute("name","text")
        fontSizeElement.style.cursor="pointer"
        fontSizeElement.style.display="inline-block"
        fontSizeElement.style.width="50px"
        fontSizeElement.style.height="30px"
        fontSizeElement.style.textAlign="center"
        fontSizeElement.style.lineHeight="30px"
        fontSizeElement.style.borderRight="1px solid lightgray"
        fontSizeElement.innerText="Text"
        fontSizeElement.onmouseenter=()=>{
            this.selectionTextElement.style.display="block"
            this.selectionTextElement.style.left=this.selectionMenuElement.offsetLeft+"px"
            this.selectionTextElement.style.top=this.selectionMenuElement.offsetTop+this.selectionMenuElement.offsetHeight-2+"px"
        }
        fontSizeElement.onmouseleave=(event:MouseEvent)=>{
            let relatedTarget=event.relatedTarget as HTMLElement
            if(!relatedTarget || !this.selectionTextElement.contains(relatedTarget)) {
                this.selectionTextElement.style.display="none"
            }
        }
        this.selectionMenuElement.appendChild(fontSizeElement)
        let boldElement=document.createElement("button")
        boldElement.setAttribute("name","bold")
        boldElement.style.cursor="pointer"
        boldElement.style.width="30px"
        boldElement.style.height="30px"
        boldElement.style.textAlign="center"
        boldElement.style.lineHeight="30px"
        boldElement.style.fontWeight="bold"
        boldElement.style.backgroundColor="transparent"
        boldElement.style.border="0px"
        boldElement.innerText="B"
        boldElement.onclick=()=>{
            RichEditorFunc.bold(this,boldElement.style.color=="black")
            boldElement.style.color=boldElement.style.color=="black"?"blue":"black"
        }
        this.selectionMenuElement.appendChild(boldElement)
        let italicElement=document.createElement("button")
        italicElement.setAttribute("name","italic")
        italicElement.style.cursor="pointer"
        italicElement.style.width="30px"
        italicElement.style.height="30px"
        italicElement.style.textAlign="center"
        italicElement.style.lineHeight="30px"
        italicElement.style.fontStyle="italic"
        italicElement.style.backgroundColor="transparent"
        italicElement.style.border="0px"
        italicElement.innerText="I"
        italicElement.onclick=()=>{
            RichEditorFunc.italic(this,italicElement.style.color=="black")
            italicElement.style.color=italicElement.style.color=="black"?"blue":"black"
        }
        this.selectionMenuElement.appendChild(italicElement)
        let underLineElement=document.createElement("button")
        underLineElement.setAttribute("name","underline")
        underLineElement.style.cursor="pointer"
        underLineElement.style.width="30px"
        underLineElement.style.height="30px"
        underLineElement.style.textAlign="center"
        underLineElement.style.lineHeight="30px"
        underLineElement.style.textDecoration="underline"
        underLineElement.style.backgroundColor="transparent"
        underLineElement.style.border="0px"
        underLineElement.innerText="U"
        underLineElement.onclick=()=>{
            RichEditorFunc.underLine(this,underLineElement.style.color=="black")
            underLineElement.style.color=underLineElement.style.color=="black"?"blue":"black"
        }
        this.selectionMenuElement.appendChild(underLineElement)
        let lineThroughElement=document.createElement("button")
        lineThroughElement.setAttribute("name","lineThrough")
        lineThroughElement.style.cursor="pointer"
        lineThroughElement.style.width="30px"
        lineThroughElement.style.height="30px"
        lineThroughElement.style.textAlign="center"
        lineThroughElement.style.lineHeight="30px"
        lineThroughElement.style.textDecoration="line-through"
        lineThroughElement.style.backgroundColor="transparent"
        lineThroughElement.style.border="0px"
        lineThroughElement.innerText="S"
        lineThroughElement.onclick=()=>{
            RichEditorFunc.deleteLine(this,lineThroughElement.style.color=="black")
            lineThroughElement.style.color=lineThroughElement.style.color=="black"?"blue":"black"
        }
        this.selectionMenuElement.appendChild(lineThroughElement)
        let colorElement=document.createElement("span")
        colorElement.setAttribute("name","color")
        colorElement.style.cursor="pointer"
        colorElement.style.display="inline-block"
        colorElement.style.width="30px"
        colorElement.style.height="30px"
        colorElement.style.textAlign="center"
        colorElement.style.lineHeight="30px"
        colorElement.innerText="A"
        colorElement.onmouseenter=()=>{
            this.selectionColorElement.style.display="block"
            this.selectionColorElement.style.left=this.selectionMenuElement.offsetLeft+colorElement.offsetLeft-100+"px"
            this.selectionColorElement.style.top=this.selectionMenuElement.offsetTop+this.selectionMenuElement.offsetHeight-2+"px"
        }
        colorElement.onmouseleave=(event:MouseEvent)=>{
            let relatedTarget=event.relatedTarget as HTMLElement
            if(!relatedTarget || !this.selectionColorElement.contains(relatedTarget)) {
                this.selectionColorElement.style.display="none"
            }
        }
        this.selectionMenuElement.appendChild(colorElement)
        let linkElement=document.createElement("span")
        linkElement.setAttribute("name","link")
        linkElement.style.cursor="pointer"
        linkElement.style.display="inline-block"
        linkElement.style.width="50px"
        linkElement.style.height="30px"
        linkElement.style.textAlign="center"
        linkElement.style.lineHeight="30px"
        linkElement.innerText="Link"
        linkElement.onmouseenter=()=>{
            this.selectionLinkElement.style.display="block"
            this.selectionLinkElement.style.left=this.selectionMenuElement.offsetLeft+linkElement.offsetLeft-100+"px"
            this.selectionLinkElement.style.top=this.selectionMenuElement.offsetTop+this.selectionMenuElement.offsetHeight-2+"px"
            this.selectionLinkElement.querySelector("input").value=""
        }
        linkElement.onmouseleave=(event:MouseEvent)=>{
            let relatedTarget=event.relatedTarget as HTMLElement
            if(!relatedTarget || !this.selectionLinkElement.contains(relatedTarget)) {
                this.selectionLinkElement.style.display="none"
            }
        }
        this.selectionMenuElement.appendChild(linkElement)
        parent.appendChild(this.selectionMenuElement)
    }

    private generatorSelectionColor(ele:HTMLElement) {
        let parent = ele.offsetParent
        this.selectionColorElement=document.createElement("div")
        this.selectionColorElement.style.position="absolute"
        this.selectionColorElement.setAttribute("name","colorList")
        this.selectionColorElement.style.display="none"
        this.selectionColorElement.appendChild(document.createTextNode("Text Color"))
        this.selectionColorElement.style.borderRadius="5px"
        this.selectionColorElement.style.boxShadow="0px 0px 2px 2px rgba(169, 169, 169, 0.2)"
        this.selectionColorElement.style.backgroundColor="white"
        this.selectionColorElement.style.border="1px solid rgba(169, 169, 169, 0.2)"
        this.selectionColorElement.style.width="200px"
        this.selectionColorElement.style.padding="5px"
        this.selectionColorElement.style.color="gray"
        this.selectionColorElement.style.fontSize="14px"
        this.selectionColorElement.onmouseleave=()=>{
            this.selectionColorElement.style.display="none"
        }
        let colorWrapper=document.createElement("div")
        colorWrapper.style.display="flex"
        colorWrapper.style.flexWrap="wrap"
        colorWrapper.style.marginTop="5px"
        colorWrapper.style.marginBottom="10px"
        let colors=["black","red","blue","green","yellow","gray","brown","orange","pink","purple"]
        for(let color of colors) {
            let ele=document.createElement("button")
            ele.style.cursor="pointer"
            ele.style.width="25px"
            ele.style.height="25px"
            ele.style.textAlign="center"
            ele.style.lineHeight="25px"
            ele.style.backgroundColor="transparent"
            ele.style.border="1px solid lightgray"
            ele.style.color=color
            ele.style.marginRight="5px"
            ele.style.marginTop="5px"
            ele.style.borderRadius="5px"
            ele.innerText="A"
            ele.onclick=()=>{
                RichEditorFunc.color(this,color)
                this.selectionColorElement.style.display="none"
            }
            colorWrapper.appendChild(ele)
        }
        this.selectionColorElement.appendChild(colorWrapper)
        this.selectionColorElement.appendChild(document.createTextNode("Background Color"))
        let backgroundColorWrapper=document.createElement("div")
        backgroundColorWrapper.style.display="flex"
        backgroundColorWrapper.style.flexWrap="wrap"
        backgroundColorWrapper.style.marginTop="5px"
        let backgroundColors=["transparent","red","blue","green","yellow","gray","brown","orange","pink","purple"]
        for(let color of backgroundColors) {
            let ele=document.createElement("button")
            ele.style.cursor="pointer"
            ele.style.width="25px"
            ele.style.height="25px"
            ele.style.marginRight="5px"
            ele.style.marginTop="5px"
            ele.style.border="0px"
            ele.style.borderRadius="5px"
            if(color!="transparent") {
                ele.style.backgroundColor=color
            }
            ele.onclick=()=>{
                RichEditorFunc.backgroundColor(this,color)
                this.selectionColorElement.style.display="none"
            }
            backgroundColorWrapper.appendChild(ele)
        }
        this.selectionColorElement.appendChild(backgroundColorWrapper)
        parent.appendChild(this.selectionColorElement)
    }

    private generatorSelectionText(ele:HTMLElement) {
        let parent=ele.offsetParent
        this.selectionTextElement=document.createElement("div")
        this.selectionTextElement.setAttribute("name","fontSizeList")
        this.selectionTextElement.style.display="none"
        this.selectionTextElement.style.flexDirection="column"
        this.selectionTextElement.style.width="60px"
        this.selectionTextElement.style.position="absolute"
        this.selectionTextElement.style.borderRadius="5px"
        this.selectionTextElement.style.boxShadow="0px 0px 2px 2px rgba(169, 169, 169, 0.2)"
        this.selectionTextElement.style.backgroundColor="white"
        this.selectionTextElement.style.border="1px solid rgba(169, 169, 169, 0.2)"
        this.selectionTextElement.onmouseleave=()=>{
            this.selectionTextElement.style.display="none"
        }
        for(let i=16;i<=48;i+=8) {
            let ele=document.createElement("button")
            ele.style.cursor="pointer"
            ele.style.width="100%"
            ele.style.height="30px"
            ele.style.textAlign="center"
            ele.style.lineHeight="30px"
            ele.style.backgroundColor="transparent"
            ele.style.border="0px"
            if(i==16) {
                ele.innerText="Normal"
            } else if(i==24) {
                ele.innerText="H4"
            } else if(i==32) {
                ele.innerText="H3"
            } else if(i==40) {
                ele.innerText="H2"
            } else if(i==48) {
                ele.innerText="H1"
            }
            ele.onclick=()=>{
                RichEditorFunc.fontSize(this,String(i)+"px")
                this.selectionTextElement.style.display="none"
            }
            this.selectionTextElement.appendChild(ele)
        }
        parent.appendChild(this.selectionTextElement)
    }

    private generatorSelectionLink(ele:HTMLElement) {
        let parent=ele.offsetParent
        this.selectionLinkElement=document.createElement("div")
        this.selectionLinkElement.setAttribute("name","link")
        this.selectionLinkElement.style.display="none"
        this.selectionLinkElement.style.position="absolute"
        this.selectionLinkElement.style.borderRadius="5px"
        this.selectionLinkElement.style.boxShadow="0px 0px 2px 2px rgba(169, 169, 169, 0.2)"
        this.selectionLinkElement.style.backgroundColor="white"
        this.selectionLinkElement.style.border="1px solid rgba(169, 169, 169, 0.2)"
        this.selectionLinkElement.style.padding="5px"
        this.selectionLinkElement.onmouseleave=()=>{
            this.selectionLinkElement.style.display="none"
        }
        let input=document.createElement("input")
        input.placeholder="type your link"
        let save=document.createElement("button")
        save.innerText="save"
        save.style.backgroundColor="transparent"
        save.style.border="0px"
        save.style.marginLeft="10px"
        save.onclick=()=>{
            if(input.value) {
                RichEditorFunc.link(this,input.value)
                this.selectionLinkElement.style.display="none"
            }
        }
        this.selectionLinkElement.appendChild(input)
        this.selectionLinkElement.appendChild(save)
        parent.appendChild(this.selectionLinkElement)
    }

    private generatorLinkEdit(ele:HTMLElement) {
        let parent=ele.offsetParent
        this.linkEditElement=document.createElement("div")
        this.linkEditElement.setAttribute("name","linkEdit")
        this.linkEditElement.style.display="none"
        this.linkEditElement.style.position="absolute"
        this.linkEditElement.style.borderRadius="5px"
        this.linkEditElement.style.boxShadow="0px 0px 2px 2px rgba(169, 169, 169, 0.2)"
        this.linkEditElement.style.backgroundColor="white"
        this.linkEditElement.style.border="1px solid rgba(169, 169, 169, 0.2)"
        this.linkEditElement.style.padding="5px"
        this.linkEditElement.style.color="gray"
        this.linkEditElement.style.fontSize="14px"
        this.linkEditElement.onmouseleave=()=>{
            this.linkEditElement.style.display="none"
        }
        this.linkEditElement.appendChild(document.createTextNode("uri"))
        this.linkEditElement.appendChild(document.createElement("br"))
        let link=document.createElement("input")
        link.style.marginTop="5px"
        link.style.marginBottom="10px"
        link.style.width="90%"
        link.placeholder="type your link"
        this.linkEditElement.appendChild(link)
        this.linkEditElement.appendChild(document.createElement("br"))
        this.linkEditElement.appendChild(document.createTextNode("title"))
        this.linkEditElement.appendChild(document.createElement("br"))
        let title=document.createElement("input")
        title.placeholder="type your title"
        title.style.marginTop="5px"
        title.style.width="90%"
        this.linkEditElement.appendChild(title)
        let save=document.createElement("button")
        save.setAttribute("name","save")
        save.innerText="save"
        save.style.borderRadius="5px"
        save.style.border="0px"
        save.style.marginTop="10px"
        save.style.width="100%"
        save.style.height="25px"
        this.linkEditElement.appendChild(save)
        this.linkEditElement.appendChild(document.createElement("br"))
        let remove=document.createElement("button")
        remove.setAttribute("name","remove")
        remove.innerText="remove"
        remove.style.borderRadius="5px"
        remove.style.border="0px"
        remove.style.marginTop="10px"
        remove.style.width="100%"
        remove.style.height="25px"
        this.linkEditElement.appendChild(remove)
        parent.appendChild(this.linkEditElement)
    }

    private handleMenu(event:MouseEvent,range:Range) {
        if(!range.collapsed) {
            if(!this.selectionMenuElement) {
                let ele=event.target as HTMLElement
                this.generatorSelectionMenu(ele)
                this.generatorSelectionText(ele)
                this.generatorSelectionColor(ele)
                this.generatorSelectionLink(ele)
            }
            this.selectionMenuElement.style.display="block"
            let rect=range.getBoundingClientRect()
            let parent=(event.target as HTMLElement).offsetParent
            let parentRect=parent.getBoundingClientRect();
            let offsetLeft=rect.left-parentRect.left
            let offsetTop=rect.top-parentRect.top
            let offsetBottom=rect.bottom-parentRect.top
            let left=offsetLeft-10
            let top=offsetTop-40
            if(left<0) {
                left=offsetLeft
            }
            if(top<0) {
                top=offsetBottom+10
            }
            this.selectionMenuElement.style.left=left+"px"
            this.selectionMenuElement.style.top=top+"px"
            let isBold=RichEditorFunc.isBold(this)
            let isItalic=RichEditorFunc.isItalic(this)
            let isUnderLine=RichEditorFunc.isUnderLine(this)
            let isLineThrough=RichEditorFunc.isDeleteLine(this)
            let element=this.selectionMenuElement.querySelector("[name='bold']") as HTMLElement
            element.style.color=isBold?"blue":"black"
            element=this.selectionMenuElement.querySelector("[name='italic']") as HTMLElement
            element.style.color=isItalic?"blue":"black"
            element=this.selectionMenuElement.querySelector("[name='underline']") as HTMLElement
            element.style.color=isUnderLine?"blue":"black"
            element=this.selectionMenuElement.querySelector("[name='lineThrough']") as HTMLElement
            element.style.color=isLineThrough?"blue":"black"
        } else {
            if(this.selectionMenuElement) {
                this.selectionMenuElement.style.display="none"
            }
            let ele=event.target as HTMLElement
            if(ele.tagName=="A" && ele.getAttribute("target")) {
                if(!this.linkEditElement) {
                    this.generatorLinkEdit(ele)
                }
                let element=ele.parentElement
                let index=Array.from(element.childNodes).indexOf(ele)
                let lineIndex=Array.from(this.root.value.children).indexOf(element)
                let item=this.lineList[lineIndex].arr[index]
                this.linkEditElement.style.display="block"
                let rect=range.getBoundingClientRect()
                let parent=(event.target as HTMLElement).offsetParent
                let parentRect=parent.getBoundingClientRect();
                let offsetLeft=rect.left-parentRect.left
                let offsetTop=rect.top-parentRect.top
                let offsetBottom=rect.bottom-parentRect.top
                let left=offsetLeft-10
                let top=offsetBottom+10
                if(left<0) {
                    left=0
                }
                this.linkEditElement.style.left=left+"px"
                this.linkEditElement.style.top=top+"px"
                let linkInput=this.linkEditElement.querySelectorAll("input")[0]
                linkInput.value=item.link
                let titleInput=this.linkEditElement.querySelectorAll("input")[1]
                titleInput.value=item.value
                let save=this.linkEditElement.querySelector("[name='save']") as HTMLElement
                save.onclick=()=>{
                    let item=this.lineList[lineIndex].arr[index]
                    let link=linkInput.value
                    let title=titleInput.value
                    if(!link || !title) {
                        return
                    }
                    item.link=link
                    item.value=title
                    this.linkEditElement.style.display="none"
                }
                let remove=this.linkEditElement.querySelector("[name='remove']") as HTMLElement
                remove.onclick=()=>{
                    let item=this.lineList[lineIndex].arr[index]
                    item.type=EEditor_Content_Line_Config_Type.TEXT
                    delete item.link
                    RichEditorHandle.fixLine(this.lineList[lineIndex])
                    this.linkEditElement.style.display="none"
                }
            }
        }
    }

    onCopy(event:ClipboardEvent) {
        const range=window.getSelection().getRangeAt(0)
        if(range.startContainer.nodeType===Node.TEXT_NODE && range.startContainer.parentElement.tagName==="A") {
            range.setStartBefore(range.startContainer.parentElement)
        }
        const content=range.cloneContents()
        const ele=document.createElement("div")
        ele.setAttribute("copy","teamlinker")
        ele.appendChild(content)
        event.clipboardData.setData("text/html",ele.outerHTML)
        event.clipboardData.setData("text/plain",ele.innerText)
        event.preventDefault()
        event.stopPropagation()
    }

    onPaste(event:ClipboardEvent) {
        let types=event.clipboardData.types
        let elementList=this.getSelectElementList()
        if(types.includes("Files")) {
            let file=event.clipboardData.files[0]
            if(file) {
                let selection=window.getSelection()
                let range=selection.getRangeAt(0)
                let container=range.startContainer as HTMLElement
                while (container.tagName!="DIV") {
                    container=container.parentElement
                }
                let startIndex=Array.from(this.root.value.children).indexOf(container)
                let selectLine=this.lineList[startIndex]
                RichEditorHandle.handleInnerHtml(selectLine,container,true,this.onGetLineConfigType)
                this.onUploadFileFunc?.(file,(fileId, path) => {
                    let originItem=selectLine.arr[selectLine.selectStartIndexPath[0]]
                    let objItem:IEditor_Content_Line_Config={
                        value:fileId,
                        link:path,
                        type:EEditor_Content_Line_Config_Type.IMAGE
                    }
                    let index:number
                    if(originItem) {
                        let objTemp:IEditor_Content_Line_Config=JSON.parse(JSON.stringify(originItem))
                        objTemp.value=objTemp.value.substring(selectLine.selectStartIndexPath[1])
                        let appendItemList=[...selectLine.arr.slice(selectLine.selectStartIndexPath[0]+1)]
                        if(objTemp.type!=EEditor_Content_Line_Config_Type.IMAGE) {
                            appendItemList.unshift(objTemp)
                        }
                        originItem.value=originItem.value.substring(0,selectLine.selectStartIndexPath[1])
                        selectLine.arr.splice(selectLine.selectStartIndexPath[0]+1,0,objItem)
                        index=selectLine.arr.length-1
                        selectLine.arr=selectLine.arr.concat(appendItemList)
                    } else {
                        selectLine.arr=[objItem]
                        index=0
                    }
                    RichEditorHandle.fixLine(selectLine)
                    nextTick(()=>{
                        let range=document.createRange()
                        range.selectNode(container.childNodes[index])
                        range.collapse(false)
                        selection.removeAllRanges()
                        selection.addRange(range)
                    })
                })
            }
        } else if(types?.includes("text/html")) {
            event.stopPropagation()
            event.preventDefault();
            let ele=document.createElement("div")
            ele.innerHTML=event.clipboardData.getData("text/html")
            let divList=ele.getElementsByTagName("div")
            let isFromTeamLinker=false
            if(ele.childNodes.length==2 && (ele.firstChild as HTMLElement).tagName==="META" && (ele.childNodes[1] as HTMLElement).tagName==="DIV" && (ele.childNodes[1] as HTMLElement).getAttribute("copy")==="teamlinker") {
                isFromTeamLinker=true
            }
            let selection=window.getSelection()
            let range=selection.getRangeAt(0)
            let container=range.startContainer as HTMLElement
            while (container.tagName!="DIV") {
                container=container.parentElement
            }
            let startIndex=Array.from(this.root.value.children).indexOf(container)
            let selectLine=this.lineList[Array.from(this.root.value.children).indexOf(container)]
            RichEditorHandle.handleInnerHtml(selectLine,container,true,this.onGetLineConfigType)
            if(isFromTeamLinker) {
                let appendItemList:IEditor_Content_Line_Config[],indexPath:number[]=[];
                for(let i=0;i<divList.length;i++) {
                    let line:IEditor_Content_Line={
                        arr:[],
                        selectEndIndexPath:[],
                        selectStartIndexPath:[]
                    }
                    RichEditorHandle.handleInnerHtml(line,divList[i],false,this.onGetLineConfigType)
                    if(i==0 || i==divList.length-1) {
                        if(i==0) {
                            let text="",isImg=false
                            selectLine.arr.forEach(item=>{
                                text+=item.value
                                if(item.type==EEditor_Content_Line_Config_Type.IMAGE) {
                                    isImg=true
                                }
                            })
                            if(!text && !isImg) {
                                this.lineList.splice(this.lineList.indexOf(selectLine),1,line)
                            } else {
                                let originItem=selectLine.arr[selectLine.selectStartIndexPath[0]]
                                let objTemp:IEditor_Content_Line_Config=JSON.parse(JSON.stringify(originItem))
                                objTemp.value=objTemp.value.substring(selectLine.selectStartIndexPath[1])
                                appendItemList=[...selectLine.arr.slice(selectLine.selectStartIndexPath[0]+1)]
                                if(objTemp.type!=EEditor_Content_Line_Config_Type.IMAGE) {
                                    appendItemList.unshift(objTemp)
                                }
                                originItem.value=originItem.value.substring(0,selectLine.selectStartIndexPath[1])
                                selectLine.arr.splice(selectLine.selectStartIndexPath[0]+1,selectLine.arr.length,...line.arr)
                                RichEditorHandle.fixLine(selectLine)
                            }
                            if(divList.length==1) {
                                let obj;
                                if(appendItemList) {
                                    obj={
                                        endItem:selectLine.arr[selectLine.arr.length-1]
                                    }
                                    selectLine.arr=selectLine.arr.concat(appendItemList)
                                    RichEditorHandle.fixLine(selectLine,obj)
                                }
                                indexPath=[startIndex+i,obj?selectLine.arr.indexOf(obj.endItem):line.arr.length-1]
                            }
                        } else {
                            let obj;
                            if(appendItemList) {
                                obj={
                                    endItem:line.arr[line.arr.length-1]
                                }
                                line.arr=line.arr.concat(appendItemList)
                                RichEditorHandle.fixLine(line,obj)
                            }
                            this.lineList.splice(startIndex+i,0,line)
                            indexPath=[startIndex+i,obj?line.arr.indexOf(obj.endItem):line.arr.length-1]
                        }
                    } else {
                        this.lineList.splice(startIndex+i,0,line)
                    }
                }
                nextTick(()=>{
                    let selection=window.getSelection()
                    let range=document.createRange()
                    range.selectNode(this.root.value.children[indexPath[0]].childNodes[indexPath[1]])
                    range.collapse(false)
                    selection.removeAllRanges()
                    selection.addRange(range)
                })
            } else {
                let item=selectLine.arr[selectLine.selectStartIndexPath[0]]
                if(item) {
                    let len=(item.value.substring(0,selectLine.selectStartIndexPath[1])+ele.innerText).length
                    item.value=item.value.substring(0,selectLine.selectStartIndexPath[1])+ele.innerText+item.value.substring(selectLine.selectStartIndexPath[1])
                    nextTick(()=>{
                        let node=container.childNodes[selectLine.selectStartIndexPath[0]] as HTMLElement
                        let range=document.createRange()
                        if(node.nodeType==Node.TEXT_NODE) {
                            range.setStart(node,len)
                            range.setEnd(node,len)
                        } else if(node.nodeType==Node.ELEMENT_NODE) {
                            if(node.tagName=="IMG") {
                                range.selectNode(node)
                                range.collapse(false)
                            } else {
                                range.setStart(node.firstChild,len)
                                range.setEnd(node.firstChild,len)
                            }
                        }
                        selection.removeAllRanges()
                        selection.addRange(range)
                    })
                } else {
                    selectLine.arr.push({
                        value:ele.innerText,
                        type:EEditor_Content_Line_Config_Type.TEXT,
                        style:{}
                    })
                    nextTick(()=>{
                        let node=container.firstChild
                        let range=document.createRange()
                        range.selectNodeContents(node)
                        range.collapse(false)
                        selection.removeAllRanges()
                        selection.addRange(range)
                    })
                }

            }
        }
    }

    onMouseOver(event:MouseEvent) {
        let ele=event.target as HTMLElement
        if(ele.tagName=="IMG") {
            let parent=ele.offsetParent;
            let parentRect=parent.getBoundingClientRect()
            let rect=ele.getBoundingClientRect();
            let left=rect.left-parentRect.left
            let top=rect.top-parentRect.top
            let width=ele.offsetWidth
            let height=ele.offsetHeight
            if(!this.imageHelperElement) {
                this.imageHelperElement=document.createElement("div")
                parent.appendChild(this.imageHelperElement)
                this.resizeObserver=new ResizeObserver((entries, observer)=>{
                    for(let entry of entries) {
                        if(this.resizeImage) {
                            (this.resizeImage as HTMLImageElement).width=entry.contentRect.width
                        }
                    }
                })
            }
            this.imageHelperElement.style.border="1px solid blue"
            this.imageHelperElement.style.position="absolute"
            this.imageHelperElement.style.left=left+"px"
            this.imageHelperElement.style.top=top+"px"
            this.imageHelperElement.style.width=width+"px"
            this.imageHelperElement.style.height=height+"px"
            this.imageHelperElement.style.overflow="hidden"
            this.imageHelperElement.style.resize="both"
            this.imageHelperElement.style.display="block"
            this.resizeImage=ele;
            this.resizeObserver.observe(this.imageHelperElement)
        } else {
            if(this.imageHelperElement) {
                this.imageHelperElement.style.display="none"
                this.resizeObserver.unobserve(this.imageHelperElement)
            }
            if(this.resizeImage) {
                this.resizeImage=null;
            }
        }
    }

    onKeyDown(event:KeyboardEvent) {
        if(event.metaKey || event.ctrlKey) {
            if(event.key=="a") {
                event.stopPropagation()
                event.preventDefault()
                let selection=window.getSelection()
                let range=selection.getRangeAt(0)
                let element=range.startContainer as HTMLElement
                while (element.tagName!="DIV") {
                    element=element.parentElement
                }
                let index=Array.from(this.root.value.children).indexOf(element)
                let line=this.lineList[index]
                RichEditorHandle.handleInnerHtml(line,element,false,this.onGetLineConfigType)
                this.selectElementList=Array.from(this.root.value.children) as HTMLElement[]
                nextTick(()=>{
                    let range=document.createRange()
                    let startNode:Node,endNode:Node
                    for(let i=0;i<this.root.value.childNodes.length;i++) {
                        let node=this.root.value.childNodes[i]
                        for(let j=0;j<node.childNodes.length;j++) {
                            let node1=node.childNodes[j]
                            if(node1) {
                                startNode=node1
                                break
                            }
                        }
                        if(startNode) {
                            break
                        }
                    }
                    for(let i=this.root.value.childNodes.length-1;i>=0;i--) {
                        let node=this.root.value.childNodes[i]
                        for(let j=node.childNodes.length-1;j>=0;j--) {
                            let node1=node.childNodes[j]
                            if(node1) {
                                endNode=node1
                                break
                            }
                        }
                        if(endNode) {
                            break
                        }
                    }
                    if(startNode && endNode) {
                        range.setStartBefore(startNode)
                        range.setEndAfter(endNode)
                        selection.removeAllRanges()
                        selection.addRange(range)
                    }
                })
            }
        }
        if(event.key==="/") {
            let selection=window.getSelection()
            let range=selection.getRangeAt(0)
            let rect=range.getBoundingClientRect()
            if(rect.left==0 && rect.top==0 && rect.width==0 && rect.height==0) {
                let ele=range.startContainer as HTMLElement
                if(ele.tagName=="DIV" && range.startOffset!==0) {
                    return
                }
                rect=(range.startContainer as HTMLElement).getBoundingClientRect()
            }
            let right=rect.right+rect.width
            let bottom=rect.bottom
            let left:number,top:number
            if(right>160) {
                left=rect.left
            } else {
                left=rect.left-150
            }
            if(document.body.clientHeight-bottom>210) {
                top=rect.top+rect.height
            } else {
                top=rect.top-200
            }
            this.popMenuPosition.value={
                left,
                top
            }
        } else {
            this.popMenuPosition.value=null;
        }
        if(event.key==="@") {
            if(!this.onQuoteListFunc) {
                return;
            }
            let selection=window.getSelection()
            let range=selection.getRangeAt(0)
            let rect=range.getBoundingClientRect()
            if(rect.left==0 && rect.top==0 && rect.width==0 && rect.height==0) {
                let ele=range.startContainer as HTMLElement
                if(ele.tagName=="DIV" && range.startOffset!==0) {
                    return
                }
                rect=(range.startContainer as HTMLElement).getBoundingClientRect()
            }
            let right=rect.right+rect.width
            let bottom=rect.bottom
            let left:number,top:number
            if(right>160) {
                left=rect.left
            } else {
                left=rect.left-150
            }
            if(document.body.clientHeight-bottom>210) {
                top=rect.top+rect.height
            } else {
                top=rect.top-200
            }
            this.quotePosition.value={
                left,
                top
            }
        } else {
            this.clearQuote()
        }
        if(event.key=="ArrowDown") {
            let selection=window.getSelection()
            let range=selection.getRangeAt(0)
            let startOffset=range.startOffset
            let startContainer=range.startContainer
            let selectStartIndexPath=[]
            selectStartIndexPath.unshift(startOffset)
            let parentElement=startContainer.parentElement
            if((startContainer as HTMLElement).tagName=="DIV") {
                selectStartIndexPath.unshift(0)
            } else {
                if(parentElement.tagName=="DIV") {
                    startOffset=Array.from(parentElement.childNodes).indexOf(startContainer as Element)
                    selectStartIndexPath.unshift(startOffset)
                    startContainer=parentElement
                } else {
                    startOffset=Array.from(parentElement.parentElement.childNodes).indexOf(parentElement as Element)
                    selectStartIndexPath.unshift(startOffset)
                    startContainer=parentElement.parentElement
                }
            }
            if(range.collapsed && (startContainer.childNodes.length==0 || (selectStartIndexPath[0]==startContainer.childNodes.length-1 && selectStartIndexPath[1]==startContainer.lastChild.textContent.length))) {
                event.stopPropagation()
                event.preventDefault()
                let index=Array.from(this.root.value.children).indexOf(startContainer as HTMLElement)
                if(index<this.lineList.length-1) {
                    let r=document.createRange()
                    r.selectNodeContents(this.root.value.children[index+1])
                    r.collapse(true)
                    selection.removeAllRanges()
                    selection.addRange(r)
                }
            }
        } else if(event.key=="ArrowUp") {
            let selection=window.getSelection()
            let range=selection.getRangeAt(0)
            let startOffset=range.startOffset
            let startContainer=range.startContainer
            let selectStartIndexPath=[]
            selectStartIndexPath.unshift(startOffset)
            if((startContainer as HTMLElement).tagName=="DIV") {
                selectStartIndexPath.unshift(0)
            } else {
                let parentElement=startContainer.parentElement
                if(parentElement.tagName=="DIV") {
                    startOffset=Array.from(parentElement.childNodes).indexOf(startContainer as Element)
                    selectStartIndexPath.unshift(startOffset)
                    startContainer=parentElement
                } else {
                    startOffset=Array.from(parentElement.parentElement.childNodes).indexOf(parentElement as Element)
                    selectStartIndexPath.unshift(startOffset)
                    startContainer=parentElement.parentElement
                }
            }
            if(range.collapsed && selectStartIndexPath[0]==0 && selectStartIndexPath[1]==0) {
                event.stopPropagation()
                event.preventDefault()
                let index=Array.from(this.root.value.children).indexOf(startContainer as HTMLElement)
                if(index>0) {
                    let r=document.createRange()
                    r.selectNodeContents(this.root.value.children[index-1])
                    r.collapse(false)
                    selection.removeAllRanges()
                    selection.addRange(r)
                }
            }
        }
    }

    constructor(root:Ref<HTMLElement>,popMenuPosition:Ref<{
        left:number,
        top:number
    }>,quotePosition:Ref<{
        left:number,
        top:number
    }>){
        this.root=root;
        this.popMenuPosition=popMenuPosition
        this.quotePosition=quotePosition
        document.addEventListener("keydown",onDeleteCrossLine)
    }
    getSelectionItemList():{
        line:IEditor_Content_Line,
        data:IEditor_Content_Line_Config[]
    }[] {
        let selectLineList:IEditor_Content_Line[]=[]
        this.selectElementList.forEach((ele)=>{
            selectLineList.push(this.lineList[Array.from(this.root.value.children).indexOf(ele)])
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
                startContainer=parentElement
            } else {
                startOffset=Array.from(parentElement.parentElement.childNodes).indexOf(parentElement as Element)
                selectStartIndexPath.unshift(startOffset)
                startContainer=parentElement.parentElement
            }
        }
        if(endContainer.tagName=="DIV") {
            selectEndIndexPath=[endOffset,endContainer.childNodes[endOffset]?endContainer.childNodes[endOffset].textContent.length:0]
        } else {
            selectEndIndexPath.unshift(endOffset)
            let parentElement=endContainer.parentElement
            if(parentElement.tagName=="DIV") {
                endOffset=Array.from(parentElement.childNodes).indexOf(endContainer as Element)
                selectEndIndexPath.unshift(endOffset)
                endContainer=parentElement
            } else {
                endOffset=Array.from(parentElement.parentElement.childNodes).indexOf(parentElement as Element)
                selectEndIndexPath.unshift(endOffset)
                endContainer=parentElement.parentElement
            }
        }
        let startLine=selectLineList[0]
        startLine.selectStartIndexPath=selectStartIndexPath
        let endLine=selectLineList[selectLineList.length-1]
        endLine.selectEndIndexPath=selectEndIndexPath
        let itemList:{
            line:IEditor_Content_Line,
            data:IEditor_Content_Line_Config[]
        }[]=[]
        if(selectLineList.length==1) {
            RichEditorHandle.handleInnerHtml(selectLineList[0],startContainer,false,this.onGetLineConfigType)
            itemList=[{
                line:selectLineList[0],
                data:[...selectLineList[0].arr.slice(selectStartIndexPath[0],selectEndIndexPath[0]+1)]
            }]
        } else {
            for(let line of selectLineList) {
                let obj=itemList.find(value => {
                    return value.line===line
                })
                if(!obj) {
                    obj={
                        line:line,
                        data:[]
                    }
                    itemList.push(obj)
                }
                if(line==startLine) {
                    RichEditorHandle.handleInnerHtml(line,startContainer,false,this.onGetLineConfigType)
                    for (let i = selectStartIndexPath[0]; i < startLine.arr.length; i++) {
                        let item=startLine.arr[i]
                        obj.data.push(item)
                    }
                } else if(line==endLine) {
                    RichEditorHandle.handleInnerHtml(line,endContainer,false,this.onGetLineConfigType)
                    for (let i = 0; i <= selectEndIndexPath[0]; i++) {
                        let item=endLine.arr[i]
                        if(item) {
                            obj.data.push(item)
                        }
                    }
                } else {
                    RichEditorHandle.handleInnerHtml(line,this.root.value.children[this.lineList.indexOf(line)] as HTMLElement,false,this.onGetLineConfigType)
                    line.arr.forEach(item=>{
                        obj.data.push(item)
                    })
                }
            }
        }
        return itemList
    }
    getCurrentInfo():{
        element:HTMLElement,
        line:IEditor_Content_Line,
        lineIndex:number,
        item:IEditor_Content_Line_Config,
        itemIndex
    }{
        let selection=window.getSelection()
        let range=selection.getRangeAt(0)
        let container=range.startContainer
        let element=container as HTMLElement
        while (element.tagName!="DIV") {
            element=element.parentElement
        }
        let lineIndex=Array.from(this.root.value.children).indexOf(element)
        let line=this.lineList[lineIndex]
        let item:IEditor_Content_Line_Config,itemIndex:number
        if(container!=element) {
            itemIndex=Array.from(element.childNodes).indexOf(container as HTMLElement)
            item=line.arr[itemIndex]
        }
        return {
            element,
            line,
            lineIndex,
            item,
            itemIndex
        }
    }
}