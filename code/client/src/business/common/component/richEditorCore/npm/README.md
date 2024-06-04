<h1 align="center">
TLEditor
</h1>
<p align="center">
A simple block-style editor based on <b>vue3</b> and <b>typescript</b>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/tleditor">
    <img src="https://flat.badgen.net/npm/v/tleditor?icon=npm" alt="npm"/>
  </a>
  <a href="https://www.npmjs.com/package/tleditor">
    <img src="https://flat.badgen.net/bundlephobia/minzip/tleditor?color=green" alt="Minzipped size"/>
  </a>
</p>

## About
It is an open-source editor of [Teamlinker](https://team-linker.com). It provides a variety of features to help users to build their own text editors like these below:

![](https://team-linker.com/assets/exampleWiki1-fade1060.png)
![](https://team-linker.com/assets/exampleIM2-1c2642fb.png)

## Features
1. Output a clean json
2. Customize the style and behavior of pop menu,quote menu
3. Insert your own block style content
4. type "/" to get pop menu and "@" to get quote menu
5. Well-designed API
6. Free and open source

**It solves the cross-line selection issue that many other components can't support**

## Demo
[Teamlinker](https://team-linker.com)

Teamlinker provides a full experience of this package.Have a try!

## Installation
```shell
npm i tleditor
```
## Usage

### Global
main.ts
```typescript
import Editor from "tleditor"
import "tleditor/style.css"

app.use(Editor)
```
.vue
```vue
<script setup lang="ts">
import {ref} from "vue";
const content=ref([])
</script>

<template>
	<div style="width: 500px">
		<TLEditor v-model="content"></TLEditor>
	</div>
</template>
```

### Sfc
.vue
```vue
<script setup lang="ts">
import {ref} from "vue";
import {TLEditor} from "tleditor"
import "tleditor/style.css"
const content=ref([])
</script>

<template>
	<div style="width: 500px">
		<TLEditor v-model="content"></TLEditor>
	</div>
</template>
```

## Customization
### Props
```typescript
readonly: {
    type: PropType<boolean>;
};
border: {
    type: PropType<boolean>;
};
popMenuList: {          //the pop menu list when user type "/"
    type: PropType<{
        type: any;
        title: string;
    }[]>;
};
placeholder: {
    type: PropType<string>;
};
quoteType: {           //a quote type should be specified when user type "@"
    type: PropType<any>;
};
```

### emits
```typescript
onQuoteList: (keyword: string, handleFunc: (list: {
        value: string;
        label: string;
        photo: string;
    }[]) => void) => any;
//users use keyword to call user api and return a users' list,the call handleFunc to complete this search
onUploadFile: (file: File, handleFunc: (fileId: string, path: string) => void) => any;
//users use File object to process upload business,get a file id and path ,then call handleFunc to complete this upload
onPopMenuClick: (type: any, handleFunc: (item: IEditor_Content_Line_Config) => void) => any;
//the pop menu item click
onCustomAnchorClick: (type: any, value: string, link: string, label: string) => any;
//the anchor click of customized content 
onMetaEnter: () => any;
//use press meta+enter button
onLinkClick: (type: any, value: string, x: number, y: number) => any;
//all anchors click
onSetLineConfigType: (linkElement: HTMLElement, objConfig: IEditor_Content_Line_Config) => any;
//customize the link and image to the html element
onGetLineConfigType: (config: IEditor_Content_Line_Config, linkElement: HTMLElement) => any;
//parse the link and image from html element
```
here is an example about onSetLineConfigType and onGetLineConfigType
```typescript
const onSetLineConfigType=(ele:HTMLElement,obj:IEditor_Content_Line_Config)=> {
    if (obj.type == ECommon_Content_Line_Config_Type.LINK) {
        ele.setAttribute("href", obj.link)
        ele.setAttribute("target", "_blank")
        ele.style.cursor = "pointer"
        ele.innerText = obj.value
        if (obj.style) {
            for (let key in obj.style) {
                ele.style[key] = obj.style[key]
            }
        }
    } else if (obj.type == ECommon_Content_Line_Config_Type.IMAGE) {
        ele.setAttribute("src", obj.link)
        ele.setAttribute("width", String(obj.width ?? 200))
        ele.setAttribute("height", "auto")
        ele.setAttribute("fileId", obj.value)
    } else if (obj.type === ECommon_Content_Line_Config_Type.FILE) {
        ele.setAttribute("href", obj.link)
        ele.setAttribute("download", obj.label)
        ele.setAttribute("fileId", obj.value)
        ele.style.margin = "0 2px 0 2px"
        ele.style.cursor = "pointer"
        ele.contentEditable = "false"
        ele.innerText = obj.label
        ele.style.color = "black"
        let icon = document.createElement("i")
        icon.className = "svg svg-file"
        icon.style.marginRight = "5px"
        icon.style.color = "gray"
        ele.prepend(icon)
    }
}

const onGetLineConfigType=(obj:IEditor_Content_Line_Config,ele:HTMLElement)=>{
    if(ele.tagName=="A") {
        let fileId=ele.getAttribute("fileId")
        if(fileId) {
            obj.type=ECommon_Content_Line_Config_Type.FILE
            obj.link=ele.getAttribute("href")
            obj.value=fileId
            obj.label=ele.innerText??""
        } else {
            obj.type=ECommon_Content_Line_Config_Type.LINK
            obj.link=ele.getAttribute("href")
            obj.value=ele.innerText??""
        }
    } else if(ele.tagName=="IMG") {
        obj.type=EEditor_Content_Line_Config_Type.IMAGE
        obj.link=ele.getAttribute("src")
        obj.width=parseInt(ele.getAttribute("width"))
        obj.value=ele.getAttribute("fileId")
    }
}
```

### Methods
```typescript
insertConfig: (itemList: IEditor_Content_Line_Config[]) => void;
```
here is an example:
```typescript
let arrPromise=await Promise.allSettled((data.data as File[]).map(file=>{
    return apiFile.upload({
        file:file as any
    }).then(res=>{
        let ret:ICommon_Content_Line_Config
        if(res?.code==0) {
            ret={
                type:ECommon_Content_Line_Config_Type.FILE,
                value:res.data.id,
                link:res.data.path,
                label:file.name
            }
        }
        return ret;
    })
}))
if(loading) {
    loading.value=false
}
let itemList=arrPromise.filter(item=>{
    if(item.status==="fulfilled" && item.value) {
        return true
    }
}).map(item=>{
    return (item as any).value
})
objEditor.value.insertConfig(itemList)
```
## About Teamlinker
Teamlinker is a cooperation platform that integrates different kind of modules.You can contact your teammates,assign your tasks,start a meeting,schedule your events,manage your files and so on with Teamlinker.
