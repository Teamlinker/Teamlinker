export interface IServer_GateWay_FormData {
    isFile:boolean,
    name:string,
    fileName:string,
    data:string
}
export function parseFormData(str:string) :IServer_GateWay_FormData[]{
    if(!str) {
        return null;
    }
    let ret:IServer_GateWay_FormData[]=[];
    let flag=str.substring(0,str.indexOf("\r\n"))
    let reg=new RegExp(`^${flag}\r\n([\\w\\W]*)\r\n${flag}\-\-\r\n$`)
    let match=str.match(reg)
    let matchText=match[1];
    let arr=matchText.split(`\r\n${flag}\r\n`)
    for(let obj of arr) {
        let headerText=obj.substring(0,obj.indexOf("\r\n\r\n"))
        let content=obj.substr(headerText.length+4)
        let arrHeader=headerText.split("; ")
        let objForm=<IServer_GateWay_FormData>{}
        for(let obj of arrHeader){
            let arr=obj.split("=")
            let key=arr[0]
            let value=arr[1]
            if(key=="filename"){
                objForm.isFile=true;
                objForm.fileName=value.split("\r\n")[0].replace(/[\'\"]/g,"");
            } else if(key=="name") {
                objForm.name=value.replace(/[\'\"]/g,"");
            }
        }
        objForm.data=content;
        ret.push(objForm)
    }
    return ret;
}