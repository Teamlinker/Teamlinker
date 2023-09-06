export interface ITeamOS_Point {
    left:`${number|string}%`,
    top:`${number|string}%`
}

export interface ITeamOS_Rect {
    left:`${number}%`,
    top:`${number}%`,
    width:`${number}%`,
    height:`${number}%`,
}

export interface ITeamOS_Menu {
    icon?:string,
    title:string,
    value?:any,
    func?:(value:any)=>void
}