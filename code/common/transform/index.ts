export declare function keys<T extends object>(): {
    name:keyof T,
    optional:boolean,
    type:string
}[];
