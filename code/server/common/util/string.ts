export default class StringUtil {
    static format(str: string, ...arg: any[]) {
        let a = str;
        for (let k in arg) {
            a = a.replace("{" + k + "}", String(arg[k]))
        }
        return a
    }
}