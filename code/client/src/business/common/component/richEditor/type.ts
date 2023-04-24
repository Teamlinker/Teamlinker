export enum ELineConfigType {
    TEXT,
    LINK,
    IMAGE
}
export type LineStyle={
    fontStyle?:string
    fontWeight?:string,
    color?:string,
    backgroundColor?:string,
    textDecoration?:string,
    fontSize?:string
}

export type LineConfig={
    style?:LineStyle,
    value:string
    link?:string,
    type:ELineConfigType,
    width?:number
}
export type Line={
    arr:LineConfig[],
    selectStartIndexPath?:number[],
    selectEndIndexPath?:number[]
}