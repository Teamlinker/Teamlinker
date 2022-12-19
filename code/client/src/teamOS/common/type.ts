export interface ITeamOS_Point {
    left:`${number}%`,
    top:`${number}%`
}

export interface ITeamOS_Rect {
    left:`${number}%`,
    top:`${number}%`,
    width:`${number}%`,
    height:`${number}%`,
}

export interface ITeamOS_Menu {
    icon:string,
    title:string,
    value:any,
    func:(value:any)=>void
}