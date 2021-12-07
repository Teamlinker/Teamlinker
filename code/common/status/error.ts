export namespace Err {
    export let Common = {
        paramError:{
            code:1,
            msg:"param error"
        },
        mysqlError:{
            code:2,
            msg:"mysql error"
        },
        itemNotFound:{
            code:3,
            msg:"item not found"
        },
        itemExists:{
            code:4,
            msg:"item exists"
        }
    }
    export let User = {
        userNotFound:{
            code:1000,
            msg:"user not found"
        },
        userExists:{
            code:1001,
            msg:"user exists"
        },
        userIdNotExists:{
            code:1002,
            msg:"user id not exists"
        },
        userNameNotExists:{
            code:1003,
            msg:"user not found"
        },
        userPasswordWrong:{
            code:1004,
            msg:"user password wrong"
        },
        notAuth:{
            code:1005,
            msg:"user not auth"
        },
        accessDenied:{
            code:1006,
            msg:"access denied"
        }
    }
    export let Http = {
        overFileSize:{
            code:2000,
            msg:"over file size"
        },
        requireParam:{
            code:2001,
            msg:"require param"
        }
    }
    export let Project = {
        userIdNotExists:{
            code:3000,
            msg:"project id not exists"
        },
        projectNotFound:{
            code:3001,
            msg:"project not found"
        },
        projectExists:{
            code:3002,
            msg:"project exists"
        },
        Tag:{
            tagSizeEmpty:{
                code:3100,
                msg:"tag size empty"
            }
        },
        Module:{
            moduleNotFound:{
                code:3200,
                msg:"module not found"
            }
        },
        Member:{
            memberExists:{
                code:3300,
                msg:"member exists"
            },
            memberNotExists:{
                code:3301,
                msg:"member not exists"
            }
        }
    }
    export let Team = {
        teamNotFound:{
            code:4000,
            msg:"team not found"
        },
        teamExists:{
            code:4001,
            msg:"team exists"
        },
        teamMemberExists:{
            code:4002,
            msg:"team member exists"
        },
        teamMemeberNotExists:{
            code:4003,
            msg:"team member not exists"
        }
    }
    export let Role ={
        roleNotFound:{
            code:5000,
            msg:"role not found"
        },
        roleNotExists:{
            code:5001,
            msg:"role not exists"
        }
    }
    export let File ={
        fileNotFound:{
            code:6000,
            msg:"file not found"
        },
        md5NotExists:{
            code:6001,
            msg:"md5 not exists"
        }
    }
}

