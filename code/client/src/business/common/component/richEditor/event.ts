import {nextTick, reactive, Ref} from "vue";
import {ELineConfigType, Line, LineConfig, LineStyle} from "./type";
import {RichEditorHandle} from "./handle";
import {RichEditorFunc} from "./func";

export class RichEditorEvent {
    private selectElementList:HTMLElement[]=[]
    private isMouseDown=false
    private root:Ref<HTMLElement>
    private elementList:Ref<HTMLElement[]>
    private lineList=reactive<Line[]>([])
    private imageHelperElement:HTMLElement
    private resizeImage:HTMLElement
    private resizeObserver:ResizeObserver
    private selectionMenuElement:HTMLElement
    private selectionTextElement:HTMLElement
    private selectionLinkElement:HTMLElement
    private selectionColorElement:HTMLElement
    private linkEditElement:HTMLElement
    getLineList(){
        return this.lineList
    }
    setLineList(data:Line[]) {
        this.lineList.splice(0,this.lineList.length,...data)
    }
    getSelectElementList() {
        return this.selectElementList
    }
    getRoot() {
        return this.root
    }
    addLine(value:string,style?:LineStyle){
        let line:Line={
            arr:[
                {
                    value:value,
                    ...style,
                    type:ELineConfigType.TEXT
                }
            ],
            selectEndIndexPath:[],
            selectStartIndexPath:[]
        }
        this.lineList.push(line)
    }
    onFocus(item:Line,event:MouseEvent){
        if(this.selectElementList.length==0) {
            this.selectElementList=[event.currentTarget as HTMLElement]
        }
    }
    onDbClick(event:MouseEvent){
        this.selectElementList=[event.currentTarget as HTMLElement]
    }

    onBlur(item:Line,event:FocusEvent){
        RichEditorHandle.handleInnerHtml(item,event.currentTarget as HTMLElement,true)
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
    }

    onEnter(line:Line,index:number,event:MouseEvent){
        event.preventDefault()
        event.stopPropagation()
        RichEditorHandle.handleInnerHtml(line,event.currentTarget as HTMLElement)
        let obj=line.arr[line.selectStartIndexPath[0]]
        let newLine:Line={
            arr:line.arr.slice(line.selectStartIndexPath[0]+1),
            selectStartIndexPath:[],
            selectEndIndexPath:[]
        }
        if(!obj || obj.type!=ELineConfigType.IMAGE) {
            let value=obj?.value.substring(line.selectStartIndexPath[1])
            if(value) {
                newLine.arr.unshift({
                    value,
                    style:{
                        ...obj.style
                    },
                    type:ELineConfigType.TEXT
                })
                obj.value=obj.value.substring(0,line.selectStartIndexPath[1])
            } else {
                newLine.arr.unshift({
                    value:"",
                    style:{},
                    type:ELineConfigType.TEXT
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
    onDelete(index,item:Line,event:MouseEvent){
        let ele=event.currentTarget as HTMLElement
        let selection=window.getSelection()
        let range=selection.getRangeAt(0)
        let startOffset=range.startOffset
        let endOffset=range.endOffset
        let startContainer=range.startContainer
        let endContainer=range.endContainer
        if(startOffset==0 && endOffset==0 && startContainer==endContainer && (startContainer==ele || startContainer.parentElement==ele || startContainer.parentElement.parentElement==ele)) {
            if(index>0) {
                event.preventDefault()
                event.stopPropagation()
                RichEditorHandle.handleInnerHtml(item,ele)
                let preLine=this.lineList[index-1]
                item.arr=item.arr.filter(obj=>{
                    return obj.value.length>0 || obj.type==ELineConfigType.IMAGE
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
                        if(ele.tagName=="IMG") {
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
        let range=selection.getRangeAt(0)
        if(this.selectElementList.length>0) {
            range=range.cloneRange()
            for(let ele of this.selectElementList) {
                ele.contentEditable="true"
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
            if(ele.tagName=="A") {
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
                    item.type=ELineConfigType.TEXT
                    delete item.link
                    RichEditorHandle.fixLine(this.lineList[lineIndex])
                    this.linkEditElement.style.display="none"
                }
            }
        }
    }

    onPaste(event:ClipboardEvent) {
        let types=event.clipboardData.types
        let elementList=this.getSelectElementList()
        if(types?.includes("text/html")) {
            event.stopPropagation()
            event.preventDefault();
            let ele=document.createElement("div")
            ele.innerHTML=event.clipboardData.getData("text/html")
            let divList=ele.getElementsByTagName("div")
            let isEdit=true
            Array.from(divList).forEach(item=>{
                if(item.contentEditable!="true") {
                    isEdit=false
                }
            })
            let isPlain=false
            if(divList.length==0) {
                let spanList=ele.getElementsByTagName("span")
                let linkList=ele.getElementsByTagName("a")
                let imgList=ele.getElementsByTagName("img")
                if(spanList.length+linkList.length+imgList.length==ele.children.length-1) {
                    isPlain=true
                    let div=ele.cloneNode(true) as HTMLDivElement
                    div.removeChild(div.firstChild)
                    let wrapper=document.createElement("div")
                    wrapper.appendChild(div)
                    divList=wrapper.getElementsByTagName("div")
                }
            }
            let selection=window.getSelection()
            let range=selection.getRangeAt(0)
            let container=range.startContainer as HTMLElement
            while (container.tagName!="DIV") {
                container=container.parentElement
            }
            let startIndex=Array.from(this.root.value.children).indexOf(container)
            let selectLine=this.lineList[Array.from(this.root.value.children).indexOf(container)]
            RichEditorHandle.handleInnerHtml(selectLine,container,true)
            if((isEdit && divList.length==ele.children.length-1) || isPlain) {
                let appendItemList:LineConfig[],indexPath:number[]=[];
                for(let i=0;i<divList.length;i++) {
                    let line:Line={
                        arr:[],
                        selectEndIndexPath:[],
                        selectStartIndexPath:[]
                    }
                    RichEditorHandle.handleInnerHtml(line,divList[i])
                    if(i==0 || i==divList.length-1) {
                        if(i==0) {
                            let text="",isImg=false
                            selectLine.arr.forEach(item=>{
                                text+=item.value
                                if(item.type==ELineConfigType.IMAGE) {
                                    isImg=true
                                }
                            })
                            if(!text && !isImg) {
                                this.lineList.splice(this.lineList.indexOf(selectLine),1,line)
                            } else {
                                let originItem=selectLine.arr[selectLine.selectStartIndexPath[0]]
                                let objTemp:LineConfig=JSON.parse(JSON.stringify(originItem))
                                objTemp.value=objTemp.value.substring(selectLine.selectStartIndexPath[1])
                                appendItemList=[...selectLine.arr.slice(selectLine.selectStartIndexPath[0]+1)]
                                if(objTemp.type!=ELineConfigType.IMAGE) {
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
                        type:ELineConfigType.TEXT,
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
            let left=ele.offsetLeft
            let top=ele.offsetTop
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
        if((event.metaKey || event.ctrlKey) && event.key=="a") {
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
            RichEditorHandle.handleInnerHtml(line,element)
            nextTick(()=>{
                let range=document.createRange()
                range.setStartBefore(this.root.value.children[0].firstChild)
                range.setEndAfter(this.root.value.children[this.root.value.children.length-1].lastChild)
                selection.removeAllRanges()
                selection.addRange(range)
            })
        }
    }

    constructor(root:Ref<HTMLElement>,elementList:Ref<HTMLElement[]>){
        this.root=root;
        this.elementList=elementList
        document.addEventListener("keydown",(event:KeyboardEvent)=>{
            if(event.key=="Backspace") {
                if(this.selectElementList.length>0 && !window.getSelection().getRangeAt(0)?.collapsed) {
                    event.preventDefault()
                    event.stopPropagation()
                    let selection=window.getSelection()
                    let range=selection.getRangeAt(0)
                    let startOffset=range.startOffset
                    let endOffset=range.endOffset
                    let startContainer=range.startContainer as HTMLElement
                    let endContainer=range.endContainer as HTMLElement
                    let selectStartIndexPath=[],selectEndIndexPath=[]
                    selectStartIndexPath.unshift(startOffset)
                    if(startContainer.tagName=="DIV") {
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
                    selectEndIndexPath.unshift(endOffset)
                    if(endContainer.tagName=="DIV") {
                        selectEndIndexPath.unshift(0)
                    } else {
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
                    if(startContainer==endContainer) {
                        let index=Array.from(root.value.children).indexOf(startContainer as HTMLElement)
                        let line=this.lineList[index];
                        RichEditorHandle.handleInnerHtml(line,startContainer as HTMLElement)
                        if(line.selectEndIndexPath[0]>line.selectStartIndexPath[0]) {
                            let startItem=line.arr[line.selectStartIndexPath[0]]
                            let endItem=line.arr[line.selectEndIndexPath[0]]
                            for(let i=line.selectStartIndexPath[0]; i<=line.selectEndIndexPath[0]; i++) {
                                let item=line.arr[i]
                                if(item==startItem) {
                                    if(item.type==ELineConfigType.IMAGE) {
                                        line.arr.splice(i,1)
                                        i--;
                                        line.selectEndIndexPath[0]--
                                    } else {
                                        item.value=item.value.substring(0,line.selectStartIndexPath[1])
                                    }
                                } else if(item==endItem) {
                                    if(item.type==ELineConfigType.IMAGE) {
                                        line.arr.splice(i,1)
                                        i--;
                                        line.selectEndIndexPath[0]--
                                    } else {
                                        item.value=item.value.substring(line.selectEndIndexPath[1])
                                    }
                                } else {
                                    line.arr.splice(i,1)
                                    i--;
                                    line.selectEndIndexPath[0]--
                                }
                            }
                            RichEditorHandle.fixLine(line)
                        } else {
                            let item=line.arr[line.selectStartIndexPath[0]]
                            item.value=item.value.substring(0,line.selectStartIndexPath[1])+item.value.substring(line.selectEndIndexPath[1])
                            RichEditorHandle.fixLine(line)
                        }
                    } else {
                        let indexStart=Array.from(root.value.children).indexOf(startContainer as HTMLElement)
                        let indexEnd=Array.from(root.value.children).indexOf(endContainer as HTMLElement)
                        let lineStart=this.lineList[indexStart];
                        let lineEnd=this.lineList[indexEnd]
                        let startItem=lineStart.arr[selectStartIndexPath[0]]
                        let endItem=lineEnd.arr[selectEndIndexPath[0]]
                        lineStart.arr.splice(selectStartIndexPath[0]+1)
                        lineEnd.arr.splice(0,selectEndIndexPath[0])
                        this.lineList.splice(indexStart+1,indexEnd-indexStart)
                        startItem.value=startItem.value.substring(0,selectStartIndexPath[1])
                        endItem.value=endItem.value.substring(selectEndIndexPath[1])
                        lineStart.arr=lineStart.arr.concat(lineEnd.arr)
                        RichEditorHandle.fixLine(lineStart)
                    }
                    nextTick(()=>{
                        let selection=window.getSelection()
                        let range=document.createRange()
                        let ele=startContainer.childNodes[selectStartIndexPath[0]] as HTMLElement
                        if(!ele) {
                            return
                        }
                        if(ele.nodeType==Node.TEXT_NODE) {
                            range.setStart(ele,selectStartIndexPath[1])
                            range.setEnd(ele,selectStartIndexPath[1])
                        } else if(ele.nodeType==Node.ELEMENT_NODE) {
                            if(ele.tagName=="IMG") {
                                range.selectNode(ele)
                                range.collapse(false)
                            } else {
                                range.setStart(ele.firstChild,selectStartIndexPath[1])
                                range.setEnd(ele.firstChild,selectStartIndexPath[1])
                            }
                        }
                        selection.removeAllRanges()
                        selection.addRange(range)
                        for(let ele of this.selectElementList) {
                            ele.contentEditable="true"
                        }
                        this.selectElementList=[]
                    })
                }
            } else if(event.key=="ArrowDown") {
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
                    let index=Array.from(root.value.children).indexOf(startContainer as HTMLElement)
                    if(index<this.lineList.length-1) {
                        let r=document.createRange()
                        r.selectNodeContents(root.value.children[index+1])
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
                    let index=Array.from(root.value.children).indexOf(startContainer as HTMLElement)
                    if(index>0) {
                        let r=document.createRange()
                        r.selectNodeContents(root.value.children[index-1])
                        r.collapse(false)
                        selection.removeAllRanges()
                        selection.addRange(r)
                    }
                }
            }
        })
    }
    getSelectionItemList():LineConfig[] {
        let selectLineList:Line[]=[]
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
            } else {
                startOffset=Array.from(parentElement.parentElement.childNodes).indexOf(parentElement as Element)
                selectStartIndexPath.unshift(startOffset)
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
            } else {
                endOffset=Array.from(parentElement.parentElement.childNodes).indexOf(parentElement as Element)
                selectEndIndexPath.unshift(endOffset)
            }
        }
        let startLine=selectLineList[0]
        let endLine=selectLineList[selectLineList.length-1]
        let itemList:LineConfig[]=[]
        if(selectLineList.length==1) {
            itemList=[...selectLineList[0].arr.slice(selectStartIndexPath[0],selectEndIndexPath[0]+1)]
        } else {
            for(let line of selectLineList) {
                if(line==startLine) {
                    for (let i = selectStartIndexPath[0]; i < startLine.arr.length; i++) {
                        let item=startLine.arr[i]
                        itemList.push(item)
                    }
                } else if(line==endLine) {
                    for (let i = 0; i <= selectEndIndexPath[0]; i++) {
                        let item=endLine.arr[i]
                        itemList.push(item)
                    }
                } else {
                    line.arr.forEach(item=>{
                        itemList.push(item)
                    })
                }
            }
        }
        return itemList
    }
    getCurrentInfo():{
        element:HTMLElement,
        line:Line,
        lineIndex:number,
        item:LineConfig,
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
        let item:LineConfig,itemIndex:number
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