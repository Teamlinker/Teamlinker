export function generateHttpErrorResponse(obj:{
    code:number,
    msg:string
}) {
    return {
        code:obj.code,
        msg:obj.msg
    }
}

export function generateHttpOkResponse(data) {
    return {
        code:0,
        data:data
    }
}

