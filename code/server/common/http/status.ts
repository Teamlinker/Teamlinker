export default class HttpStatus {
    private status=200;
    set(status:number){
        this.status=status
    }
    get value(){
        return this.status
    }
}