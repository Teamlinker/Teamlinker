export type IEditor_Content_Line ={
    arr:IEditor_Content_Line_Config[],
    selectStartIndexPath?:number[],
    selectEndIndexPath?:number[]
}

export type IEditor_Content_Line_Config ={
    style?:IEditor_Content_Line_Style,
    value:string
    link?:string,
    type:any,
    width?:number,
    label?:string
}

export type IEditor_Content_Line_Style ={
    fontStyle?:string
    fontWeight?:string,
    color?:string,
    backgroundColor?:string,
    textDecoration?:string,
    fontSize?:string
}

export enum EEditor_Content_Line_Config_Type {
    TEXT,
    LINK,
    IMAGE,
}
