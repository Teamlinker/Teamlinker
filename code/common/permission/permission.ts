
export abstract class Permission_Base {
    constructor(private readonly name:string,public readonly value=name){}
    toString() {
        return this.name;
    }
}
export namespace Permission_Types {
    export class Project extends Permission_Base {
        static readonly READ =new Project("READ","read project")
        static readonly EDIT =new Project("EDIT","edit project")
        static readonly DELETE =new Project("DELETE","delete project")
        static readonly CREATE =new Project("CREATE","create project")
    }
}