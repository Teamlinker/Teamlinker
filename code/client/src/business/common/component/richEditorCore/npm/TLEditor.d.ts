import { App } from 'vue';
import { ComponentOptionsMixin } from 'vue';
import { DefineComponent } from 'vue';
import { ExtractPropTypes } from 'vue';
import { PropType } from 'vue';
import { PublicProps } from 'vue';

declare type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;

declare type __VLS_TypePropsToRuntimeProps<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? {
        type: PropType<__VLS_NonUndefinedable<T[K]>>;
    } : {
        type: PropType<T[K]>;
        required: true;
    };
};

export declare enum EEditor_Content_Line_Config_Type {
    TEXT = 0,
    LINK = 1,
    IMAGE = 2
}

export declare type IEditor_Content_Line = {
    arr: IEditor_Content_Line_Config[];
    selectStartIndexPath?: number[];
    selectEndIndexPath?: number[];
};

export declare type IEditor_Content_Line_Config = {
    style?: IEditor_Content_Line_Style;
    value: string;
    link?: string;
    type: any;
    width?: number;
    label?: string;
};

export declare type IEditor_Content_Line_Style = {
    fontStyle?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    textDecoration?: string;
    fontSize?: string;
};

declare const root: {
    install(app: App, options: any): void;
};
export default root;

export declare const TLEditor: DefineComponent<__VLS_TypePropsToRuntimeProps<{
readonly?: boolean;
modelValue: IEditor_Content_Line[];
border?: boolean;
popMenuList?: {
type: any;
title: string;
}[];
placeholder?: string;
quoteType?: any;
}>, {
insertConfig: (itemList: IEditor_Content_Line_Config[]) => void;
}, unknown, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {
"update:modelValue": (value: IEditor_Content_Line[]) => void;
uploadFile: (file: File, handleFunc: (fileId: string, path: string) => void) => void;
popMenuClick: (type: any, handleFunc: (item: IEditor_Content_Line_Config) => void) => void;
customAnchorClick: (type: any, value: string, link: string, label: string) => void;
quoteList: (keyword: string, handleFunc: (list: {
value: string;
label: string;
photo: string;
}[]) => void) => void;
metaEnter: () => void;
linkClick: (type: any, value: string, x: number, y: number) => void;
setLineConfigType: (linkElement: HTMLElement, objConfig: IEditor_Content_Line_Config) => void;
getLineConfigType: (config: IEditor_Content_Line_Config, linkElement: HTMLElement) => void;
}, string, PublicProps, Readonly<ExtractPropTypes<__VLS_TypePropsToRuntimeProps<{
readonly?: boolean;
modelValue: IEditor_Content_Line[];
border?: boolean;
popMenuList?: {
type: any;
title: string;
}[];
placeholder?: string;
quoteType?: any;
}>>> & {
onQuoteList?: (keyword: string, handleFunc: (list: {
value: string;
label: string;
photo: string;
}[]) => void) => any;
"onUpdate:modelValue"?: (value: IEditor_Content_Line[]) => any;
onUploadFile?: (file: File, handleFunc: (fileId: string, path: string) => void) => any;
onPopMenuClick?: (type: any, handleFunc: (item: IEditor_Content_Line_Config) => void) => any;
onCustomAnchorClick?: (type: any, value: string, link: string, label: string) => any;
onMetaEnter?: () => any;
onLinkClick?: (type: any, value: string, x: number, y: number) => any;
onSetLineConfigType?: (linkElement: HTMLElement, objConfig: IEditor_Content_Line_Config) => any;
onGetLineConfigType?: (config: IEditor_Content_Line_Config, linkElement: HTMLElement) => any;
}, {}, {}>;

export { }
