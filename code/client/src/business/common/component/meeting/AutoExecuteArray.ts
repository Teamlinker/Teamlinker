export class AutoExecuteArray {
    private static arr=[]
    static async push(func:any) {
        if(this.arr.length>0) {
            this.arr.unshift(func)
        } else {
            this.arr.unshift(func)
            while(this.arr.length>0) {
                let func=this.arr[this.arr.length-1]
                await func()
                this.arr.pop()
            }
        }
    }
}