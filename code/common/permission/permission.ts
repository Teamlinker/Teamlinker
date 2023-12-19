export function getAllPermissions(obj):Permission_Base[] {
    let arr:Permission_Base[] =[]
    let keys = Object.keys(obj)
    for (let key of keys) {
        let val = obj[key]
        if (val instanceof Permission_Base) {
            arr.push(val)
        }
    }
    return arr;
}

export function checkPermission(permission:number,permissionChecked:Permission_Base) {
    return (permission & permissionChecked.value) && permission>=permissionChecked.value
}

export class Permission_Base {
    constructor(public readonly name:string,public readonly description=name,public readonly value){}
    toString() {
        return this.name;
    }
}
export namespace Permission_Types {

    export class Organization extends Permission_Base {
        static readonly ADMIN =new Organization("ADMIN","admin",2**31-1)
        static readonly CREATE_PROJECT =new Organization("create project","create project",2**30)
        static readonly CREATE_TEAM =new Organization("create team","create team",2**29)
        static readonly READ =new Organization("read organization","read organization",2**28)
        static readonly EDIT =new Organization("edit organization","edit organization",2**27)
        static readonly CREATE_WIKI =new Organization("create wiki","create wiki",2**26)
    }
    export class Common extends Permission_Base {
        static readonly SELF=new Common("SELF","self",2**2)
    }
    export class Project extends Permission_Base {
        static readonly ADMIN =new Project("ADMIN","admin",(2**(8-2)-1<<3))
        static readonly READ =new Project("READ","read project",2**8)
        static readonly EDIT =new Project("EDIT","edit project",2**7)
        static readonly DELETE =new Project("DELETE","delete project",2**6)
        static readonly CREATE =new Project("CREATE","create project",2**5)
    }
    export class Team extends Permission_Base {
        static readonly ADMIN =new Team("ADMIN","admin",(2**(15-8)-1<<9))
        static readonly READ =new Team("READ","read team",2**15)
        static readonly EDIT =new Team("EDIT","edit team",2**14)
        static readonly DELETE =new Team("DELETE","delete team",2**13)
    }
    export class Wiki extends Permission_Base {
        static readonly ADMIN =new Wiki("ADMIN","admin",(2**(19-15)-1<<16))
        static readonly READ =new Wiki("READ","read wiki",2**19)
        static readonly EDIT =new Wiki("EDIT","edit wiki",2**18)
    }
}