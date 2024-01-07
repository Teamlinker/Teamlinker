export function generateHttpErrorResponse(obj:{
    code:number,
    msg:{
        [lang:string]:string
    }
},lang:string) {
    return {
        code:obj?.code,
        msg:obj?.msg?.[lang]
    }
}

export function generateHttpOkResponse(data) {
    return {
        code:0,
        data:data
    }
}

