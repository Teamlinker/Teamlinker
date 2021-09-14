let v=0;
export abstract class Permission_Base {
    constructor(private readonly name:string,public readonly value=v++){}
    toString() {
        return this.name;
    }
}
export namespace Permission_Types {
    export class Project extends Permission_Base {
        static readonly READ =new Project("read project")
        static readonly EDIT =new Project("edit project")
        static readonly DELETE =new Project("delete project")
        static readonly CREATE =new Project("create project")
    }
}