
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
    export class Team extends Permission_Base {
        static readonly READ =new Team("READ","read team")
        static readonly EDIT =new Team("EDIT","edit team")
        static readonly DELETE =new Team("DELETE","delete team")
        static readonly CREATE =new Team("CREATE","create team")
        static readonly MEMBER =new Team("MEMBER","modify team member")
    }
}