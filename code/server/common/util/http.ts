export function generateHttpErrorResponse(obj:{
    code:number,
    msg:string
}) {
    return {
        code:obj.code,
        msg:obj.msg
    }
}

export function generateHttpOkResponse(msg:string,data) {
    return {
        code:0,
        msg:msg,
        data:data
    }
}

