export default class StringUtil {
    static format(str: string, ...arg: any[]) {
        let a = str;
        for (let k in arg) {
            if(arg[k]!==undefined && arg[k]!==null) {
                a = a.replace("{" + k + "}", String(arg[k]))
            }
        }
        return a
    }
    static isEmpty(str:string) {
        if(str===null || str===undefined || str==="") {
            return true
        }
        return false
    }
}
