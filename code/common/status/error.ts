export namespace Err {
    export abstract class BaseError {
        abstract code:number
        msg:string
    }
    export namespace Common {
        export class ParamError extends BaseError {
            code=0
            override msg="param error"
        }
        export class MysqlError extends BaseError {
            code=1
            override msg:string
            constructor(msg?:string) {
                super()
                this.msg=msg?msg:"mysql error"
            }
        }
    }
    export namespace User {
        export class UserNotFound extends BaseError {
            code=1000
            override msg="user not found"
        }
    
        export class UserExists extends BaseError {
            code=1001
            override msg="user exists"
        }

        export class UserIdNotExists extends BaseError {
            code=1002
            override msg="user id not exists"
        }

        export class UserNameNotExists extends BaseError {
            code=1003
            override msg="user name not exists"
        }

        export class UserPasswordWrong extends BaseError {
            code=1004
            override msg="user password wrong"
        }

        export class NotAuth extends BaseError {
            code=1005
            override msg="user not auth"
        }
    }
    export namespace Http {
        export class OverFileSize extends BaseError {
            code=2000
            override msg="over file size"
        }
    }
    

    


}

