<template>
    <div ref="iconRef" style="display: inline-flex;" :style="{ fontSize: `${size}px`, color: color as any }">
    </div>
</template>

<script lang="ts" setup>

import {onMounted, ref} from 'vue';
import {Ant, AntJson, AntName} from './Ant';

const val = {
    [AntName]: AntJson,
}

const props = defineProps<{
  name:keyof typeof val,
  type:Ant,
  size:string,
  color:string
}>(
//     {
//     name: { default: 'Ant' as keyof typeof val },
//     type: { default: 'up' as Ant },
//     size: { default: '20' },
//     color: { default: undefined as any },
// }
)


const iconRef = ref<HTMLDivElement>({} as any)
const str = {
    svg: [`<svg style="width: 1em;height: 1em;vertical-align: middle;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">`, '</svg>'],
    getPath: (param: { d: string, fill?: string }) => {
        return `<path d="${param.d}" fill="${param.fill ?? 'currentColor'}" />`
    }
}
onMounted(() => {
    //@ts-ignore
    let obj: any = val[props.name][props.type]
    if (!obj) {
        const color = ['color:black;', 'color:red;']
        console.info(`%c sicon组件传入name<%c${props.name}%c> => type<%c${props.type}%c> 不存在`, `${color[0]} font-size:12px`, color[1], color[0], color[1], color[0]);
        return
    }
    let res = ''
    if (typeof (obj) === 'string') {
        res = `${str.svg[0]}<path d="${obj}" fill="currentColor" />${str.svg[1]}`
    } else {
        res = str.svg[0]
        if(obj.viewBox) {
            res=res.replace("0 0 1024 1024",obj.viewBox)
        }
        let objt: { d: string[]; fill: { [key: string]: number[] }; } = obj
        const getFill = (fill: { [key: string]: number[] }, index: number) => {
            const fillkeys = Object.keys(fill)
            const colors = props.color

            for (let i = 0; i < fillkeys.length; i++) {
                const key = fillkeys[i];
                const nums = fill[key]
                if (nums.includes(index)) {

                    if (colors) {
                        if (Array.isArray(colors))
                            return colors[i] ?? colors[colors.length - 1]
                        return colors
                    } else {
                        return key
                    }

                }

            }

            return 'currentColor'
        }

        objt.d.forEach((item, index) => {
            res += str.getPath({
                d: item,
                fill: getFill(objt.fill, index)
            })
        })
        res += str.svg[1]
    }

    iconRef.value.innerHTML = res
})
</script>
