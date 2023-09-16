import {nextTick, toRaw} from "vue";
import {
    ECommon_Content_Line_Config_Type,
    ICommon_Content_Line,
    ICommon_Content_Line_Config
} from "../../../../../../common/model/content";
import {EClient_Drag_Type} from "../../../../teamOS/common/directive/drag";
import {ECommon_Model_Finder_Shortcut_Type} from "../../../../../../common/model/finder_item";

export class RichEditorHandle {
    static handle(line:ICommon_Content_Line){
        let str=""
        for(let obj of line.arr) {
            let ele:HTMLElement
            if(obj.type==ECommon_Content_Line_Config_Type.TEXT) {
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
            } else if(obj.type==ECommon_Content_Line_Config_Type.LINK) {
                ele=document.createElement("a")
                ele.setAttribute("href",obj.link)
                ele.setAttribute("target","_blank")
                ele.style.cursor="pointer"
                ele.innerText=obj.value
                if(obj.style) {
                    for(let key in obj.style) {
                        ele.style[key]=obj.style[key]
                    }
                }
            } else if(obj.type==ECommon_Content_Line_Config_Type.IMAGE) {
                ele=document.createElement("img")
                ele.setAttribute("src",obj.link)
                ele.setAttribute("width",String(obj.width??200))
                ele.setAttribute("height","auto")
                ele.setAttribute("fileId",obj.value)
                ele.setAttribute("allowDrag","1")
                ele.setAttribute("dragType",EClient_Drag_Type.FILE)
                ele.setAttribute("dragValue",obj.value)
            } else if(obj.type===ECommon_Content_Line_Config_Type.FILE) {
                ele=document.createElement("a")
                ele.setAttribute("href",obj.link)
                ele.setAttribute("download",obj.label)
                ele.setAttribute("fileId",obj.value)
                ele.style.margin="0 2px 0 2px"
                ele.style.cursor="pointer"
                ele.contentEditable="false"
                ele.innerText=obj.label
                ele.style.color="black"
                ele.setAttribute("allowDrag","1")
                ele.setAttribute("dragType",EClient_Drag_Type.FILE)
                ele.setAttribute("dragValue",obj.value)
                let icon=document.createElement("i")
                icon.className="svg svg-file"
                icon.style.marginRight="5px"
                icon.style.color="gray"
                ele.prepend(icon)
            } else if(obj.type===ECommon_Content_Line_Config_Type.PROJECT) {
                ele=document.createElement("a")
                ele.setAttribute("href","javascript:void(0)")
                ele.setAttribute("type",String(ECommon_Content_Line_Config_Type.PROJECT))
                ele.setAttribute("value",obj.value)
                ele.style.margin="0 2px 0 2px"
                ele.style.padding="0 5px 0 5px"
                ele.style.cursor="pointer"
                ele.contentEditable="false"
                ele.innerText=obj.label
                ele.style.color="black"
                ele.style.borderRadius="5px"
                ele.style.boxShadow="0px 0px 2px 2px rgba(169, 169, 169, 0.2)"
                ele.style.border="1px solid rgb(210,210,210)"
                ele.style.color="blue"
                ele.style.fontSize="medium"
                ele.style.textDecoration="none"
                ele.setAttribute("allowDrag","1")
                ele.setAttribute("dragType",EClient_Drag_Type.SHORTCUT)
                ele.setAttribute("shortcutType",ECommon_Model_Finder_Shortcut_Type.PROJECT)
                ele.setAttribute("shortcutRefId",obj.value)
                ele.setAttribute("shortcutName",obj.label)
                let icon=document.createElement("i")
                icon.className="svg svg-project"
                icon.style.marginRight="5px"
                icon.style.color="green"
                ele.prepend(icon)
            } else if(obj.type===ECommon_Content_Line_Config_Type.PROJECT_ISSUE) {
                ele=document.createElement("a")
                ele.setAttribute("href","javascript:void(0)")
                ele.setAttribute("type",String(ECommon_Content_Line_Config_Type.PROJECT_ISSUE))
                ele.setAttribute("value",obj.value)
                ele.setAttribute("link",obj.link)
                ele.style.margin="0 2px 0 2px"
                ele.style.padding="0 5px 0 5px"
                ele.style.cursor="pointer"
                ele.contentEditable="false"
                ele.innerText=obj.label
                ele.style.color="black"
                ele.style.borderRadius="5px"
                ele.style.boxShadow="0px 0px 2px 2px rgba(169, 169, 169, 0.2)"
                ele.style.border="1px solid rgb(210,210,210)"
                ele.style.color="blue"
                ele.style.fontSize="medium"
                ele.style.textDecoration="none"
                ele.setAttribute("allowDrag","1")
                ele.setAttribute("dragType",EClient_Drag_Type.SHORTCUT)
                ele.setAttribute("shortcutType",ECommon_Model_Finder_Shortcut_Type.PROJECT_ISSUE)
                ele.setAttribute("shortcutRefId",obj.value)
                ele.setAttribute("shortcutName",obj.label)
                let icon=document.createElement("i")
                icon.className="svg svg-project-issue"
                icon.style.marginRight="5px"
                icon.style.color="green"
                ele.prepend(icon)
            } else if(obj.type===ECommon_Content_Line_Config_Type.BOARD_SPRINT) {
                ele=document.createElement("a")
                ele.setAttribute("href","javascript:void(0)")
                ele.setAttribute("type",String(ECommon_Content_Line_Config_Type.BOARD_SPRINT))
                ele.setAttribute("value",obj.value)
                ele.setAttribute("link",obj.link)
                ele.style.margin="0 2px 0 2px"
                ele.style.padding="0 5px 0 5px"
                ele.style.cursor="pointer"
                ele.contentEditable="false"
                ele.innerText=obj.label
                ele.style.color="black"
                ele.style.borderRadius="5px"
                ele.style.boxShadow="0px 0px 2px 2px rgba(169, 169, 169, 0.2)"
                ele.style.border="1px solid rgb(210,210,210)"
                ele.style.color="blue"
                ele.style.fontSize="medium"
                ele.style.textDecoration="none"
                ele.setAttribute("allowDrag","1")
                ele.setAttribute("dragType",EClient_Drag_Type.SHORTCUT)
                ele.setAttribute("shortcutType",ECommon_Model_Finder_Shortcut_Type.BOARD_SPRINT)
                ele.setAttribute("shortcutRefId",obj.value)
                ele.setAttribute("shortcutName",obj.label)
                let icon=document.createElement("i")
                icon.className="svg svg-board-sprint"
                icon.style.marginRight="5px"
                icon.style.color="green"
                ele.prepend(icon)
            } else if(obj.type===ECommon_Content_Line_Config_Type.WIKI) {
                ele=document.createElement("a")
                ele.setAttribute("href","javascript:void(0)")
                ele.setAttribute("type",String(ECommon_Content_Line_Config_Type.WIKI))
                ele.setAttribute("value",obj.value)
                ele.style.margin="0 2px 0 2px"
                ele.style.padding="0 5px 0 5px"
                ele.style.cursor="pointer"
                ele.contentEditable="false"
                ele.innerText=obj.label
                ele.style.color="black"
                ele.style.borderRadius="5px"
                ele.style.boxShadow="0px 0px 2px 2px rgba(169, 169, 169, 0.2)"
                ele.style.border="1px solid rgb(210,210,210)"
                ele.style.color="blue"
                ele.style.fontSize="medium"
                ele.style.textDecoration="none"
                ele.setAttribute("allowDrag","1")
                ele.setAttribute("dragType",EClient_Drag_Type.SHORTCUT)
                ele.setAttribute("shortcutType",ECommon_Model_Finder_Shortcut_Type.WIKI)
                ele.setAttribute("shortcutRefId",obj.value)
                ele.setAttribute("shortcutName",obj.label)
                let icon=document.createElement("i")
                icon.className="svg svg-wiki"
                icon.style.marginRight="5px"
                icon.style.color="rgb(0,120,212)"
                ele.prepend(icon)
            } else if(obj.type===ECommon_Content_Line_Config_Type.WIKI_ITEM) {
                ele=document.createElement("a")
                ele.setAttribute("href","javascript:void(0)")
                ele.setAttribute("type",String(ECommon_Content_Line_Config_Type.WIKI_ITEM))
                ele.setAttribute("value",obj.value)
                ele.setAttribute("link",obj.link)
                ele.style.margin="0 2px 0 2px"
                ele.style.padding="0 5px 0 5px"
                ele.style.cursor="pointer"
                ele.contentEditable="false"
                ele.innerText=obj.label
                ele.style.color="black"
                ele.style.borderRadius="5px"
                ele.style.boxShadow="0px 0px 2px 2px rgba(169, 169, 169, 0.2)"
                ele.style.border="1px solid rgb(210,210,210)"
                ele.style.color="blue"
                ele.style.fontSize="medium"
                ele.style.textDecoration="none"
                ele.setAttribute("allowDrag","1")
                ele.setAttribute("dragType",EClient_Drag_Type.SHORTCUT)
                ele.setAttribute("shortcutType",ECommon_Model_Finder_Shortcut_Type.WIKI_ITEM)
                ele.setAttribute("shortcutRefId",obj.value)
                ele.setAttribute("shortcutName",obj.label)
                let icon=document.createElement("i")
                icon.className="svg svg-wiki-item"
                icon.style.marginRight="5px"
                icon.style.color="rgb(0,120,212)"
                ele.prepend(icon)
            } else if(obj.type===ECommon_Content_Line_Config_Type.CALENDAR_EVENT) {
                ele=document.createElement("a")
                ele.setAttribute("href","javascript:void(0)")
                ele.setAttribute("type",String(ECommon_Content_Line_Config_Type.CALENDAR_EVENT))
                ele.setAttribute("value",obj.value)
                ele.style.margin="0 2px 0 2px"
                ele.style.padding="0 5px 0 5px"
                ele.style.cursor="pointer"
                ele.contentEditable="false"
                ele.innerText=obj.label
                ele.style.color="black"
                ele.style.borderRadius="5px"
                ele.style.boxShadow="0px 0px 2px 2px rgba(169, 169, 169, 0.2)"
                ele.style.border="1px solid rgb(210,210,210)"
                ele.style.color="blue"
                ele.style.fontSize="medium"
                ele.style.textDecoration="none"
                ele.setAttribute("allowDrag","1")
                ele.setAttribute("dragType",EClient_Drag_Type.SHORTCUT)
                ele.setAttribute("shortcutType",ECommon_Model_Finder_Shortcut_Type.CALENDAR_EVENT)
                ele.setAttribute("shortcutRefId",obj.value)
                ele.setAttribute("shortcutName",obj.label)
                let icon=document.createElement("i")
                icon.className="svg svg-calendar-event"
                icon.style.marginRight="5px"
                icon.style.color="orange"
                ele.prepend(icon)
            } else if(obj.type===ECommon_Content_Line_Config_Type.MEETING_ROOM) {
                ele=document.createElement("a")
                ele.setAttribute("href","javascript:void(0)")
                ele.setAttribute("type",String(ECommon_Content_Line_Config_Type.MEETING_ROOM))
                ele.setAttribute("value",obj.value)
                ele.style.margin="0 2px 0 2px"
                ele.style.padding="0 5px 0 5px"
                ele.style.cursor="pointer"
                ele.contentEditable="false"
                ele.innerText=obj.label
                ele.style.color="black"
                ele.style.borderRadius="5px"
                ele.style.boxShadow="0px 0px 2px 2px rgba(169, 169, 169, 0.2)"
                ele.style.border="1px solid rgb(210,210,210)"
                ele.style.color="blue"
                ele.style.fontSize="medium"
                ele.style.textDecoration="none"
                ele.setAttribute("allowDrag","1")
                ele.setAttribute("dragType",EClient_Drag_Type.SHORTCUT)
                ele.setAttribute("shortcutType",ECommon_Model_Finder_Shortcut_Type.MEETING_ROOM)
                ele.setAttribute("shortcutRefId",obj.value)
                ele.setAttribute("shortcutName",obj.label)
                let icon=document.createElement("i")
                icon.className="svg svg-meeting-room"
                icon.style.marginRight="5px"
                icon.style.color="red"
                ele.prepend(icon)
            } else if(obj.type===ECommon_Content_Line_Config_Type.QUOTE_PERSON) {
                ele=document.createElement("a")
                ele.setAttribute("href","javascript:void(0)")
                ele.setAttribute("type",String(ECommon_Content_Line_Config_Type.QUOTE_PERSON))
                ele.setAttribute("value",obj.value)
                ele.style.margin="0 2px 0 2px"
                ele.style.padding="0 5px 0 5px"
                ele.style.cursor="pointer"
                ele.contentEditable="false"
                ele.innerText=obj.label
                ele.style.backgroundColor="rgba(9, 30, 66, 0.08)"
                ele.style.color="#42526E"
                ele.style.borderRadius="10px"
                ele.style.textDecoration="none"
                ele.prepend(document.createTextNode("@"))
            }
            if(ele) {
                str+=ele.outerHTML
            }
        }
        return str;
    }
    static handleInnerHtml(item:ICommon_Content_Line, root:HTMLElement, relocate:boolean=false){
        item.selectEndIndexPath=[]
        item.selectStartIndexPath=[]
        item.arr=[]
        root.childNodes.forEach(node=>{
            if(node.nodeType==Node.TEXT_NODE) {
                let objTemp:ICommon_Content_Line_Config={
                    value:node.nodeValue,
                    style:{},
                    type:ECommon_Content_Line_Config_Type.TEXT
                }
                item.arr.push(objTemp)
            } else if(node.nodeType==Node.ELEMENT_NODE) {
                let obj=<ICommon_Content_Line_Config>{
                    value:"",
                    style:{}
                }
                let ele=node as HTMLElement
                if(ele.tagName=="SPAN") {
                    obj.type=ECommon_Content_Line_Config_Type.TEXT
                    obj.value=ele.innerText??""
                } else if(ele.tagName=="A") {
                    let fileId=ele.getAttribute("fileId")
                    if(fileId) {
                        obj.type=ECommon_Content_Line_Config_Type.FILE
                        obj.link=ele.getAttribute("href")
                        obj.value=fileId
                        obj.label=ele.innerText??""
                    } else {
                        let type=ele.getAttribute("type")
                        if(type) {
                            let configType=Number(type)
                            if(configType===ECommon_Content_Line_Config_Type.PROJECT) {
                                let projectId=ele.getAttribute("value")
                                obj.type=ECommon_Content_Line_Config_Type.PROJECT
                                obj.value=projectId
                                obj.label=ele.innerText??""
                            } else if(configType===ECommon_Content_Line_Config_Type.PROJECT_ISSUE) {
                                let projectId=ele.getAttribute("link")
                                let projectIssueId=ele.getAttribute("value")
                                obj.type=ECommon_Content_Line_Config_Type.PROJECT_ISSUE
                                obj.value=projectIssueId
                                obj.link=projectId
                                obj.label=ele.innerText??""
                            } else if(configType===ECommon_Content_Line_Config_Type.PROJECT_RELEASE) {
                                let projectId=ele.getAttribute("link")
                                let projectReleaseId=ele.getAttribute("value")
                                obj.type=ECommon_Content_Line_Config_Type.PROJECT_RELEASE
                                obj.value=projectReleaseId
                                obj.link=projectId
                                obj.label=ele.innerText??""
                            } else if(configType===ECommon_Content_Line_Config_Type.BOARD_SPRINT) {
                                let projectAndBoardId=ele.getAttribute("link")
                                let boardSprintId=ele.getAttribute("value")
                                obj.type=ECommon_Content_Line_Config_Type.BOARD_SPRINT
                                obj.value=boardSprintId
                                obj.link=projectAndBoardId
                                obj.label=ele.innerText??""
                            } else if(configType===ECommon_Content_Line_Config_Type.WIKI) {
                                let wikiId=ele.getAttribute("value")
                                obj.type=ECommon_Content_Line_Config_Type.WIKI
                                obj.value=wikiId
                                obj.label=ele.innerText??""
                            } else if(configType===ECommon_Content_Line_Config_Type.WIKI_ITEM) {
                                let wikiItemId=ele.getAttribute("value")
                                let wikiId=ele.getAttribute("link")
                                obj.type=ECommon_Content_Line_Config_Type.WIKI_ITEM
                                obj.value=wikiItemId
                                obj.link=wikiId
                                obj.label=ele.innerText??""
                            } else if(configType===ECommon_Content_Line_Config_Type.CALENDAR_EVENT) {
                                let calendarEventId=ele.getAttribute("value")
                                obj.type=ECommon_Content_Line_Config_Type.CALENDAR_EVENT
                                obj.value=calendarEventId
                                obj.label=ele.innerText??""
                            } else if(configType===ECommon_Content_Line_Config_Type.MEETING_ROOM) {
                                let meetingRoomId=ele.getAttribute("value")
                                obj.type=ECommon_Content_Line_Config_Type.MEETING_ROOM
                                obj.value=meetingRoomId
                                obj.label=ele.innerText??""
                            } else if(configType===ECommon_Content_Line_Config_Type.QUOTE_PERSON) {
                                let organizationUserId=ele.getAttribute("value")
                                obj.type=ECommon_Content_Line_Config_Type.QUOTE_PERSON
                                obj.value=organizationUserId
                                obj.label=ele.innerText.replaceAll("@","")??""
                            }
                        } else {
                            obj.type=ECommon_Content_Line_Config_Type.LINK
                            obj.link=ele.getAttribute("href")
                            obj.value=ele.innerText??""
                        }
                    }
                } else if(ele.tagName=="IMG") {
                    obj.type=ECommon_Content_Line_Config_Type.IMAGE
                    obj.link=ele.getAttribute("src")
                    obj.width=parseInt(ele.getAttribute("width"))
                    obj.value=ele.getAttribute("fileId")
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
    static fixLine(line:ICommon_Content_Line, objItem?:{startItem?:ICommon_Content_Line_Config,endItem?:ICommon_Content_Line_Config,startIndex?:number,endIndex?:number}){
        for(let i=1;i<line.arr.length;i++) {
            let obj=line.arr[i]
            let preObj=line.arr[i-1]
            if((obj.style && preObj.style && JSON.stringify(obj.style)===JSON.stringify(preObj.style) && obj.type==preObj.type && obj.type==ECommon_Content_Line_Config_Type.TEXT) || (!obj.value && obj.type!=ECommon_Content_Line_Config_Type.IMAGE)) {
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
            if(!obj.value && obj.type!=ECommon_Content_Line_Config_Type.IMAGE) {
                line.arr.splice(i,1)
                i--
            }
        }
    }
}