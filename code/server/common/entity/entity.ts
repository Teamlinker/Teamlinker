export abstract class Entity<T> {
    protected item:T;
    getId():bigint{
        if(this.item) {
            return (<any>this.item).id
        } else {
            return null;
        }
    }
    setItem(item:T) {
        this.item=item
    }
    assignItem(item:any) {
        if(typeof(item)=="object") {
            this.item=<T>{}
            for(let key in item) {
                this.item[key]=item[key]
            }
        }
    }
    getItem():T {
        return this.item;
    }
    abstract create():Promise<T>;
    abstract update():Promise<T>;
    abstract delete();
    abstract loadItem():Promise<T>;
}