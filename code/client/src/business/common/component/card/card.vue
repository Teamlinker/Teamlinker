<template>
	<div style="position: relative;" ref="root" :style="{...((type==='fixed' && !multiRow) && {
		overflowX:'visible',
		overflowY:'visible',
		height:rect.height+(gap??0)*2+15+'px'
	})}">
		<div v-if="props.type==='fixed' && !multiRow && $slots.pinHeader" style="position: sticky;z-index: 10;left: 0px;background-color: white;" :style="{height:rect.height+'px',width:(rect.width+(gap??0))+'px'}">
      <div style="height: 100%;background-color: rgb(244, 245, 247);border-radius: 5px;;position: relative;z-index: 1" :style="{marginLeft:(gap??0)+'px',width:rect.width+'px',top:(gap??0)+'px'}">
        <div style="width: 100%;height: 30px;position: sticky;top: 0px;background-color: rgb(244, 245, 247);z-index: 1">
          <slot name="pinHeader"></slot>
        </div>
        <div style="width: 100%;height: calc(100% - 30px)">
          <slot name="pinBody"></slot>
        </div>
      </div>
		</div>
		<div v-for="item in list" :key="item.id" style="position: absolute;background-color: rgb(244, 245, 247);border-radius: 5px;user-select: none;" :style="{left:item.x+'px',top:item.y+'px',transition:selectedObj?.id!==item.id?'all .3s':'none',height:rect.height+'px',width:type==='fixed'?(rect.width+'px'):(item.width+'px')}" @mousedown="onMouseDown($event,item)" @mousemove="onMouseMove" @mouseup="onMouseUp($event)" ref="cardEleList">
			<div style="width: 100%;height: 30px;background-color: rgb(244, 245, 247);z-index: 1" :style="{cursor:readonly?'normal':'move',...((type==='fixed' && !multiRow) && {
		position:selectedObj?.id===item.id?'':'sticky',
		top:'0px'
	})}">
				<slot name="header" :item="item"></slot>
			</div>
			<div style="width: 100%;height: calc(100% - 30px)">
				<slot name="body" :item="item"></slot>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {nextTick, onBeforeUnmount, onMounted, ref, useSlots, watchEffect} from "vue";

type Item={
	id:string,
	name:string,
	data:any,
	x:number,
	y:number,
	width?:number
}
const props=defineProps<{
	data:{
		id:string,
		name:string,
		data:any
	}[],
	type:"fixed"|"calculate",
	rect?:{
		width?:number,
		height?:number
	},
	column?:number,
	gap?:number,
	multiRow?:boolean,
	readonly?:boolean
}>()
const emit=defineEmits<{
	change:[id:string,index:number]
}>()
const list=ref<Item[]>([])
const cardEleList=ref<HTMLElement[]>([])
const root=ref<HTMLElement>()
const selectedObj=ref<Item>()
let pin:boolean=false
let originalIndex:number
let left:number,top:number,observer:ResizeObserver
let slots=useSlots()
let lastNopElement:HTMLElement
let scrollParent:HTMLElement
const handleData=()=>{
	let data=props.data
	if(props.type==="fixed") {
		if(props.multiRow) {
			nextTick(()=>{
				let row=0;
				let rootWidth=root.value.offsetWidth
				let columnCount=Math.floor(rootWidth/((props.gap??0)+props.rect.width))
				list.value=data.map((item,index)=>{
					let column=index%columnCount
					row=Math.floor(index/columnCount)
					return {
						x:(props.gap??0)*(column+1)+props.rect.width*column,
						y:(props.gap??0)*(row+1)+props.rect.height*row,
						id:item.id,
						name:item.name,
						...item.data
					}
				})
			})
		} else {
			if(slots.pinHeader) {
				pin=true
			} else {
				pin=false
			}
			list.value=data.map((item,index)=>{
				index=pin?(index+1):index
				return {
					x:(props.gap??0)*(index+1)+props.rect.width*index,
					y:props.gap??0,
					id:item.id,
					name:item.name,
					...item.data
				}
			})
		}
	} else if(props.type==="calculate") {
		nextTick(()=>{
			let row=0;
			let rootWidth=root.value.offsetWidth
			let width=Math.floor((rootWidth-(props.gap??0)*(props.column+1))/props.column)
			list.value=data.map((item,index)=>{
				let column=index%props.column
				row=Math.floor(index/props.column)
				return {
					x:(props.gap??0)*(column+1)+width*column,
					y:(props.gap??0)*(row+1)+props.rect.height*row,
					id:item.id,
					name:item.name,
					...item.data,
					width:width
				}
			})
		})
	}
}
watchEffect(()=>{
	handleData()
})
const onMouseDown=(event:MouseEvent,item:Item)=>{
	if(event.button!==0 || !(event.currentTarget as HTMLElement).firstChild.contains(event.target as HTMLElement) || props.readonly) {
		return
	}
	let ele=event.currentTarget as HTMLElement
	originalIndex=list.value.indexOf(item)
	selectedObj.value=item
	ele.style.zIndex="1"
	let rect=ele.getBoundingClientRect()
	left=event.x-rect.left
	top=event.y-rect.top
	if(props.type==="fixed" && !props.multiRow) {
		lastNopElement=document.createElement("div")
		lastNopElement.style.position="absolute"
		lastNopElement.style.width=props.rect.width+"px"
		lastNopElement.style.height=props.rect.height+"px"
		lastNopElement.style.left=(Array.from(root.value.children).at(-1) as HTMLElement).style.left
		lastNopElement.style.top=(Array.from(root.value.children).at(-1) as HTMLElement).style.top
		root.value.appendChild(lastNopElement)
	}
}
const onMouseMove=(event:MouseEvent)=>{
	if(selectedObj.value) {
		event.stopPropagation()
		event.preventDefault()
		let rootRect=root.value.getBoundingClientRect()
		rootRect.x+=scrollParent.scrollLeft
		rootRect.y+=scrollParent.scrollTop
		let selectedIndex=list.value.indexOf(selectedObj.value)
		selectedObj.value.x=event.x-rootRect.x-left+scrollParent.scrollLeft
		selectedObj.value.y=event.y-rootRect.y-top
		let index:number
		let rootWidth=root.value.scrollWidth
		let columnCount:number
		let width:number
		if(props.type==="fixed") {
			width=props.rect.width
			columnCount=Math.floor(rootWidth/((props.gap??0)+props.rect.width))
			if(props.multiRow) {
				let x=Math.floor((event.x-rootRect.x)/(width+(props.gap??0)))
				let y=Math.floor((event.y-rootRect.y)/(props.rect.height+(props.gap??0)))
				index=y*columnCount+x
			} else {
				index=Math.floor((event.x-rootRect.x+scrollParent.scrollLeft)/(width+(props.gap??0)))
				index=pin?(index-1):index
			}
		} else if(props.type==="calculate") {
			columnCount=props.column
			width=Math.floor((rootWidth-(props.gap??0)*(columnCount+1))/columnCount)
			let x=Math.floor((event.x-rootRect.x)/(width+(props.gap??0)))
			let y=Math.floor((event.y-rootRect.y)/(props.rect.height+(props.gap??0)))
			index=y*columnCount+x
		}
		if(index>=props.data.length) {
			index=props.data.length-1
		} else if(index<0) {
			index=0
		}
		if(index>selectedIndex) {
			let obj=list.value[selectedIndex]
			for(let i=selectedIndex;i<=index-1;i++) {
				list.value[i]=list.value[i+1]
				if(props.multiRow || props.type==="calculate") {
					let column=i%columnCount
					let row=Math.floor(i/columnCount)
					list.value[i].x=(props.gap??0)*(column+1)+width*column
					list.value[i].y=(props.gap??0)*(row+1)+props.rect.height*row
				} else {
					list.value[i].x=(props.gap??0)*((pin?(i+1):i)+1)+width*(pin?(i+1):i)
				}
			}
			list.value[index]=obj
		} else if(index<selectedIndex) {
			let obj=list.value[selectedIndex]
			for(let i=selectedIndex;i>=index+1;i--) {
				list.value[i]=list.value[i-1]
				if(props.multiRow || props.type==="calculate") {
					let column=i%columnCount
					let row=Math.floor(i/columnCount)
					list.value[i].x=(props.gap??0)*(column+1)+width*column
					list.value[i].y=(props.gap??0)*(row+1)+props.rect.height*row
				} else {
					list.value[i].x=(props.gap??0)*((pin?(i+1):i)+1)+width*(pin?(i+1):i)
				}
			}
			list.value[index]=obj
		}
		if(props.type==="fixed" && !props.multiRow) {
			if(event.x-rootRect.x+30>root.value.clientWidth) {
				index++
				if(index>=props.data.length) {
					index=props.data.length-1
				}
				root.value.children[pin?(index+1):index].scrollIntoView({
					behavior:"smooth"
				})
			} else if(event.x-rootRect.x-left<0) {
				index--
				if(index<0) {
					index=0
				}
				if(index==0 && pin) {
					root.value.children[0].scrollIntoView({
						behavior:"smooth"
					})
				} else {
					root.value.children[pin?(index+1):index].scrollIntoView({
						behavior:"smooth"
					})
				}
			}
		}
	}
}
const onMouseUp=(event:MouseEvent)=>{
	if(selectedObj.value) {
		if(lastNopElement) {
			lastNopElement.remove()
			lastNopElement=null;
		}
		let index=list.value.indexOf(selectedObj.value)
		if(props.type==="fixed") {
			if(props.multiRow) {
				let rootWidth=root.value.offsetWidth
				let columnCount=Math.floor(rootWidth/((props.gap??0)+props.rect.width))
				let column=index%columnCount
				let row=Math.floor(index/columnCount)
				selectedObj.value.x=(props.gap??0)*(column+1)+props.rect.width*column
				selectedObj.value.y=(props.gap??0)*(row+1)+props.rect.height*row
			} else {
				selectedObj.value.x=(props.gap??0)*((pin?(index+1):index)+1)+props.rect.width*(pin?(index+1):index)
				selectedObj.value.y=props.gap??0
			}
		} else if(props.type==="calculate") {
			let rootWidth=root.value.offsetWidth
			let column=index%props.column
			let row=Math.floor(index/props.column)
			let width=Math.floor((rootWidth-(props.gap??0)*(props.column+1))/props.column)
			selectedObj.value.x=(props.gap??0)*(column+1)+width*column
			selectedObj.value.y=(props.gap??0)*(row+1)+props.rect.height*row
		}
		let ele=event.currentTarget as HTMLElement
		ele.style.zIndex="0"
		if(index!==originalIndex) {
			emit("change",selectedObj.value.id,index)
		}
		selectedObj.value=null
	}
}
onMounted(()=>{
	if(props.multiRow || props.type==="calculate") {
		observer=new ResizeObserver(entries => {
			handleData()
		})
		observer.observe(root.value)
	}
  let ele=root.value.parentElement
  while(ele) {
    if(ele.tagName=="BODY" || ["auto","scroll"].includes(ele.style.overflow) || ["auto","scroll"].includes(ele.style.overflowX)) {
      scrollParent=ele;
      break
    } else {
      ele=ele.parentElement
    }
  }
})

onBeforeUnmount(()=>{
	if(observer) {
		observer.unobserve(root.value)
		observer.disconnect()
	}
})
defineExpose({
	showFirst:()=>{
		if(props.type==="fixed" && !props.multiRow) {
			Array.from(root.value.children)[0].scrollIntoView({
				behavior:"smooth"
			})
		}
	},
	showLast:()=>{
		if(props.type==="fixed" && !props.multiRow) {
			Array.from(root.value.children).at(-1).scrollIntoView({
				behavior:"smooth"
			})
		}
	}
})
</script>

<style scoped>

</style>