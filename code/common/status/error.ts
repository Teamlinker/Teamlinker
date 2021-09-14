export namespace Err {
    export let Common = {
        paramError:{
            code:0,
            msg:"param error"
        },
        mysqlError:{
            code:1,
            msg:"mysql error"
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
        }
    }
    export let Http = {
        overFileSize:{
            code:2000,
            msg:"over file size"
        }
    }
    

    


}

