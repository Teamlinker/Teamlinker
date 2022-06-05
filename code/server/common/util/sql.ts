import * as intFormat from "biguint-format";
import * as FlakeId from 'flake-idgen';
import { BaseModel } from '../../../common/model/base';

const uid = new FlakeId(); 

type EXPR={
    [key:string]:EXPRVALUE
}
type EXPRVALUEEXP ={
    value?:string|number|boolean|string[]|[number,number]|string|Date,
    exp?:"="|">="|"<="|">"|"<"|"<>"|"is null"|"in"|"is not null"|"between"|"%like"|"like%"|"%like%"|"> <"|">= <="|">= <"|"> <="
}
type EXPRVALUE=string|number|boolean|string|Date|EXPRVALUEEXP|{
    type:"and"|"or",
    values:EXPRVALUEEXP[]
}

type QUERYJOINEXPSIMPLE = {
    value:EXPRVALUE,
    model:{
        table:string
    }
}

type QUERYJOINMULTI = {
    [param :string]:{ 
        value:EXPRVALUE,
        model:{
            table:string
        }
    }
}

type QUERYJOINEXP=QUERYJOINEXPSIMPLE|QUERYJOINMULTI


export async function generateSnowId() {
    let id = intFormat(uid.next(),"dec") as string
    return id
}

function isEXPRVALUEEXP(value:any):value is EXPRVALUEEXP {
    return typeof(value)=="object" && value.exp
}

function handleExp(key:string,value:EXPRVALUEEXP,arrExpr:string[],table?:string) {
    if (value.exp == "=" || value.exp=="<=" || value.exp==">" || value.exp=="<" || value.exp=="<>" || !value.exp) {
        if(!value.exp) {
            value.exp="="
        }
        if(value.exp=="> <" || value.exp=="> <=" || value.exp==">= <" || value.exp==">= <=" ) {
            let val1 = value.value[0]
            let val2 = value.value[1]
            if(value.exp=="> <") {
                arrExpr.push(`${table?(table+"."):""}${key}>${val1} and ${key}<${val2}`)
            } else if(value.exp==">= <=") {
                arrExpr.push(`${table?(table+"."):""}${key}>=${val1} and ${key}<=${val2}`)
            } else if(value.exp==">= <") {
                arrExpr.push(`${table?(table+"."):""}${key}>=${val1} and ${key}<${val2}`)
            } else if(value.exp=="> <=") {
                arrExpr.push(`${table?(table+"."):""}${key}>${val1} and ${key}<=${val2}`)
            }
        } else {
            let val = typeof (value.value) == "number" ? value.value : typeof (value.value) == "boolean" ? (value.value ? 1 : 0) : ("'" + value.value + "'")
            arrExpr.push(`${table?(table+"."):""}${key}${value.exp}${val}`)
        }
    } else if(value.exp=="is null") {
        arrExpr.push(`${table?(table+"."):""}${key} is null`)
    } else if(value.exp=="in") {
        if(typeof(value.value)=="string") {
            arrExpr.push(`${table?(table+"."):""}${key} in (${value.value})`)
        } else {
            arrExpr.push(`${table?(table+"."):""}${key} in (${(<string[] | number[]>value.value).map((item)=>{
                return typeof(item)=="number"?item:("'"+item+"'")
            }).join(",")})`)
        }
    } else if(value.exp=="is not null") {
        arrExpr.push(`${table?(table+"."):""}${key} is not null`)
    } else if(value.exp=="between") {
        let val=value.value as [number,number];
        arrExpr.push(`${table?(table+"."):""}${key} between ${val[0]} and ${val[1]}`)
    } else if(value.exp=="%like") {
        arrExpr.push(`${table?(table+"."):""}${key} like '%${value.value}'`)
    } else if(value.exp=="like%") {
        arrExpr.push(`${table?(table+"."):""}${key} like '${value.value}%'`)
    } else if(value.exp=="%like%") {
        arrExpr.push(`${table?(table+"."):""}${key} like '%${value.value}%'`)
    }
}

function generateExp(objExpr?:EXPR,exprMode?:"and"|"or"):string{
    let expr="",arrExpr=[]
    if(objExpr) {
        for(let key in objExpr) {
            let value=objExpr[key]
            if(typeof(value)!="object") {
                let val=typeof(value)=="number"?value:typeof(value)=="boolean"?(value?1:0):("'"+value+"'")
                arrExpr.push(`${key}=${val}`)
            } else if (typeof(value)=="object" && (value instanceof Date)){
                arrExpr.push(`${key}=${value.getTime()}`)
            } else if(value===null) {
                arrExpr.push(`isnull(${key})`)
            } else if (isEXPRVALUEEXP(value)) {
                handleExp(key,value,arrExpr)
            }else {
                let arr=[];
                for(let obj of value.values) {
                    handleExp(key,obj,arr)
                }
                arrExpr.push(`(${arr.join(` ${value.type?value.type:"and"} `)})`)
            }
        }
        expr=arrExpr.join(` ${exprMode?exprMode:"and"} `)
    }
    return expr;
}

function isQueryJoinSimple(obj:QUERYJOINEXP):obj is QUERYJOINEXPSIMPLE {
    return (obj as QUERYJOINEXPSIMPLE).model!==undefined && (obj as QUERYJOINEXPSIMPLE).model.table!==undefined
}

function generateLeftJoinExp(objExpr?:{
    [param :string]:QUERYJOINEXP
},exprMode?:"and"|"or"):string{
    let expr="",arrExpr=[]
    if(objExpr) {
        for(let key in objExpr) {
            let value=objExpr[key]
            if(isQueryJoinSimple(value)) {
                if(typeof(value.value)!="object") {
                    let val=typeof(value.value)=="number"?value.value:typeof(value.value)=="boolean"?(value.value?1:0):("'"+value.value+"'")
                    arrExpr.push(`${value.model.table}.${key}=${val}`)
                } else if (typeof(value.value)=="object" && (value.value instanceof Date)){
                    arrExpr.push(`${value.model.table}.${key}=${value.value.getTime()}`)
                } else if(value.value===null) {
                    arrExpr.push(`isnull(${value.model.table}.${key})`)
                } else if (isEXPRVALUEEXP(value.value)) {
                    handleExp(key,value.value,arrExpr,value.model.table)
                }else {
                    let arr=[];
                    for(let obj of value.value.values) {
                        handleExp(key,obj,arr,value.model.table)
                    }
                    arrExpr.push(`(${arr.join(` ${value.value.type?value.value.type:"and"} `)})`)
                }
            } else {
                let arr=[]
                for(let k in value){
                    let v=value[k];
                    if(typeof(v.value)!="object") {
                        let val=typeof(v.value)=="number"?v.value:typeof(v.value)=="boolean"?(v.value?1:0):("'"+v.value+"'")
                        arr.push(`${v.model.table}.${k}=${val}`)
                    } else if (typeof(v.value)=="object" && (v.value instanceof Date)){
                        arr.push(`${v.model.table}.${k}=${v.value.getTime()}`)
                    } else if (isEXPRVALUEEXP(v.value)) {
                        handleExp(k,v.value,arr,v.model.table)
                    }else {
                        let arr1=[];
                        for(let obj of v.value.values) {
                            handleExp(k,obj,arr1,v.model.table)
                        }
                        arr.push(`(${arr1.join(` ${v.value.type?v.value.type:"and"} `)})`)
                    }
                }
                arrExpr.push(`(${arr.join(` ${key.startsWith("$and")?"and":"or"} `)})`)
            }        
        }
        expr=arrExpr.join(` ${exprMode?exprMode:"and"} `)
    }
    return expr;
}
export function generateCreateSql<T extends BaseModel>(model:T,obj:{
    [param in keyof T["model"]]?:T["model"][param]
}):{
    value:string,
    type:T["model"]
} {
    let keys="",values=""
    for(let key in obj) {
        let value=obj[key]
        keys+=(value!==null && value!==undefined)?(key+","):""
        values+=(value!==null && value!==undefined)?("'"+(Array.isArray(value)?JSON.stringify(value):value)+"'"+","):""
    }
    if(keys[keys.length-1]==","){
        keys=keys.substring(0,keys.length-1);
    }
    if(values[values.length-1]==","){
        values=values.substring(0,values.length-1);
    }
    return {
        value:`insert into ${model.table} (${keys}) values (${values})`,
        type:model.model
    }
}

export function generateBatchCreateSql<T extends BaseModel>(model:T,arr:{
    [param in keyof T["model"]]?:T["model"][param]
}[]):{
    value:string,
    type:T["model"]
} {
    let arrKey:string[]=[]
    for(let item of arr) {
        for(let key in item) {
            if(!arrKey.includes(key)) {
                arrKey.push(key)
            }
        }
    }
    let keys=arrKey.join(","),arrValues:string[]=[]
    for(let item of arr) {
        let arrValue:string[]=[]
        for(let key of arrKey) {
            let value=item[key]
            arrValue.push((value!==undefined)?(value===null?"null":("'"+(Array.isArray(value)?JSON.stringify(value):value)+"'")):"default")
        }
        arrValues.push("("+arrValue.join(",")+")")
    }
    return {
        value:`insert into ${model.table} (${keys}) values ${arrValues.join(",")}`,
        type:model.model
    }
}

export function generateQuerySql<T extends BaseModel,K1 extends keyof T["model"]>(model:T,columns:K1[],objExpr?:{
    [param in keyof T["model"]]?:EXPRVALUE
},exprMode?:"and"|"or",order?:{
    field:keyof T["model"],
    type:"asc"|"desc"
},limit?:number,size?:number):{
    value:string,
    type:{
        [key in Extract<keyof T["model"],K1>]:T["model"][key]
    }
} {
    let column=""
    if(Array.isArray(columns) && columns.length>0) {
        column=columns.join(",")
    } else {
        column="*"
    }
    let expr=generateExp(objExpr,exprMode);
    return {
        value:`select ${column} from ${model.table}${expr?(" where "+expr):""}${order?` order by ${order.field} ${order.type}`:""}${limit!==undefined?` limit ${limit},${size}`:""}`,
        type:model.model
    }
}

export function generateUpdateSql<T extends BaseModel>(model:T,obj:{
    [param in keyof T["model"]]?:{
        exp:"+"|"-",
        value:number
    }|T["model"][param]
},objExpr?:{
    [param in keyof T["model"]]?:EXPRVALUE
},exprMode?:"and"|"or"):{
    value:string,
    type:T["model"]
} {
    let arrVal=[];
    for(let key in obj) {
        let value=obj[key]
        let val;
        if(value===null) {
            val="null"
        } else if(value===undefined) {
            continue
        } else if (typeof(value)=="number") {
            val=String(value)
        } else if(typeof(value)=="boolean") {
            val=value?1:0+""
        } else if(typeof(value)=="object" && !(value instanceof Date) && !Array.isArray(value) && value.exp) {
            val=`${key}${value.exp}${value.value}`
        } else if(Array.isArray(value)) {
            val="'"+JSON.stringify(value)+"'"
        } else if(value==="") {
            val=null
        } else {
            val="'"+value+"'"
        }
        arrVal.push(`${key}=${val}`)
    }
    let expr=generateExp(objExpr,exprMode);
    return {
        value:`update ${model.table} set ${arrVal.join(",")}${expr?(" where "+expr):""}`,
        type:model.model
    }
}

export function generateDeleteSql<T extends BaseModel>(model:T,objExpr?:{
    [param in keyof T["model"]]?:EXPRVALUE
},exprMode?:"and"|"or"):{
    value:string,
    type:T["model"]
} {
    let expr=generateExp(objExpr,exprMode);
    return {
        value:`delete from ${model.table}${expr?(" where "+expr):""}`,
        type:model.model
    }
}

type Rename<T, K extends keyof T, N extends string> = Pick<T, Exclude<keyof T, K>> & { [P in N]: T[K] }

export function generateLeftJoinSql<T1 extends BaseModel,T2 extends BaseModel,K1 extends keyof T1["model"]=null,K2 extends keyof T2["model"]=null,F1 extends string=null,F2 extends string=null,R1 extends K1=null,RR1 extends string=null,R2 extends K2=null,RR2 extends string=null>(mainModel:{
    model:T1,
    columns?:K1[],
    aggregation?:F1,
    rename?:{
        fields:R1[],
        newFields:RR1[]
    }
},joinModel:{
    model:T2,
    columns?:K2[],
    aggregation?:F2,
    rename?:{
        fields:R2[],
        newFields:RR2[]
    }
    expression:{
        [key in keyof T2["model"]]?:{
            model:T1,
            field:keyof T1["model"]
        }
    }
},objExpr?:{
    [param in ((keyof (T1 & T2)["model"])|`${"$and"|"$or"}${number}`)]?:{
        value:EXPRVALUE,
        model:T1|T2
    }|{
        [param in keyof (T1 & T2)["model"]]?:{ 
            value:EXPRVALUE,
            model:T1|T2
        }
    }
},exprMode?:"and"|"or",order?:{
    field:keyof (T1["model"] & T2["model"]),
    model:T1|T2
    type:"asc"|"desc"
},limit?:number,size?:number):{
    value:string,
    type:(F1 extends null ? Rename<{
        [key in K1]:T1["model"][key]
    },R1,RR1>:{
        [key in F1]:Rename<{
            [key in K1]:T1["model"][key]
        },R1,RR1>
    }) & (F2 extends null ? Rename<{
        [key in K2]:T2["model"][key]
    },R2,RR2>:{
        [key in F2]:Rename<{
            [key in K2]:T2["model"][key]
        },R2,RR2>
    }),
    aggregation:{
        [key:string]:string
    }
} {
    let expr=generateLeftJoinExp(objExpr,exprMode);
    let table=mainModel.model.table
    let joinTable=joinModel.model.table
    let key=Object.keys(joinModel.expression)[0]
    let value=joinModel.expression[key]
    let expression=`${joinTable}.${key}=${value.model.table}.${value.field}`
    let rename=mainModel.rename
    let renameJoin=joinModel.rename
    let aggregation={}
    let column=""
    if(mainModel.columns && mainModel.columns.length>0) {
        let str=mainModel.columns.map((item)=>{
            return `${table}.${item} _${table}__${(rename && rename.fields.includes(item as any))?rename.newFields[rename.fields.indexOf(item as any)]:item}`
        }).join(",")
        column+=str;
    }
    if(joinModel.columns && joinModel.columns.length>0) {
        let str=joinModel.columns.map((item)=>{
            return `${joinTable}.${item} _${joinTable}__${(renameJoin && renameJoin.fields.includes(item as any))?renameJoin.newFields[renameJoin.fields.indexOf(item as any)]:item}`
        }).join(",")
        column+=","+str;
    }
    column=column.trim()
    if(column[0]==",")
    {
        column=column.substr(1)
    }
    aggregation[table]=mainModel.aggregation??""
    aggregation[joinTable]=joinModel.aggregation??""
    return {
        value:`select ${column} from ${table} left join ${joinTable} on ${expression} ${expr?(" where "+expr):""}${order?` order by ${order.model.table}.${order.field} ${order.type}`:""}${limit!==undefined?` limit ${limit},${size}`:""}`,
        type:null,
        aggregation:aggregation
    }
}



export function generateLeftJoin2Sql<T1 extends BaseModel,T2 extends BaseModel,T3 extends BaseModel,K1 extends keyof T1["model"]=null,K2 extends keyof T2["model"]=null,K3 extends keyof T3["model"]=null,F1 extends string=null,F2 extends string=null,F3 extends string=null,R1 extends K1=null,RR1 extends string=null,R2 extends K2=null,RR2 extends string=null,R3 extends K3=null,RR3 extends string=null>(mainModel:{
    model:T1,
    columns?:K1[],
    aggregation?:F1,
    rename?:{
        fields:R1[],
        newFields:RR1[]
    }
},joinModel:{
    model:T2,
    columns?:K2[],
    rename?:{
        fields:R2[],
        newFields:RR2[]
    }
    aggregation?:F2,
    expression:{
        [key in keyof T2["model"]]?:{
            model:T1|T3,
            field:keyof (T1 & T3)["model"]
        }
    }
},joinModel2:{
    model:T3,
    columns?:K3[],
    aggregation?:F3,
    rename?:{
        fields:R3[],
        newFields:RR3[]
    }
    expression:{
        [key in keyof T3["model"]]?:{
            model:T1|T2,
            field:keyof (T1 & T2)["model"]
        }
    }
},objExpr?:{
    [param in keyof (T1 & T2 & T3)["model"]]?:{
        value:EXPRVALUE,
        model:T1|T2|T3
    }|{
        [param in keyof (T1 & T2 & T3)["model"]]?:{ 
            value:EXPRVALUE,
            model:T1|T2|T3
        }
    }
},exprMode?:"and"|"or",order?:{
    field:keyof(T1["model"] & T2["model"] & T3["model"]),
    model:T1 | T2 | T3,
    type:"asc"|"desc"
},limit?:number,size?:number):{
    value:string,
    type:(F1 extends null ? Rename<{
        [key in K1]:T1["model"][key]
    },R1,RR1>:{
        [key in F1]:Rename<{
            [key in K1]:T1["model"][key]
        },R1,RR1>
    }) & (F2 extends null ? Rename<{
        [key in K2]:T2["model"][key]
    },R2,RR2>:{
        [key in F2]:Rename<{
            [key in K2]:T2["model"][key]
        },R2,RR2>
    }) & (F3 extends null ? Rename<{
        [key in K3]:T3["model"][key]
    },R3,RR3>:{
        [key in F3]:Rename<{
            [key in K3]:T3["model"][key]
        },R3,RR3>
    }),
    aggregation:{
        [key:string]:string
    }
} {
    let expr=generateLeftJoinExp(objExpr,exprMode);
    let table=mainModel.model.table
    let joinTable=joinModel.model.table
    let joinTable2=joinModel2.model.table
    let key=Object.keys(joinModel.expression)[0]
    let value=joinModel.expression[key]
    let key2=Object.keys(joinModel2.expression)[0]
    let value2=joinModel2.expression[key]
    let expression=`${joinTable}.${key}=${value.model.table}.${value.field}`
    let expression2=`${joinTable2}.${key2}=${value2.model.table}.${value2.field}`
    let rename=mainModel.rename
    let renameJoin=joinModel.rename
    let renameJoin2=joinModel2.rename
    let aggregation={}
    let column=""
    if(mainModel.columns && mainModel.columns.length>0) {
        let str=mainModel.columns.map((item)=>{
            return `${table}.${item} _${table}__${(rename && rename.fields.includes(item as any))?rename.newFields[rename.fields.indexOf(item as any)]:item}`
        }).join(",")
        column+=str;
    }
    if(joinModel.columns && joinModel.columns.length>0) {
        let str=joinModel.columns.map((item)=>{
            return `${joinTable}.${item} _${joinTable}__${(renameJoin && renameJoin.fields.includes(item as any))?renameJoin.newFields[renameJoin.fields.indexOf(item as any)]:item}`
        }).join(",")
        column+=","+str;
    }
    if(joinModel2.columns && joinModel2.columns.length>0) {
        let str=joinModel2.columns.map((item)=>{
            return `${joinTable2}.${item} _${joinTable2}__${(renameJoin2 && renameJoin2.fields.includes(item as any))?renameJoin2.newFields[renameJoin2.fields.indexOf(item as any)]:item}`
        }).join(",")
        column+=","+str;
    }
    column=column.trim()
    if(column[0]==",")
    {
        column=column.substr(1)
    }
    aggregation[table]=mainModel.aggregation??""
    aggregation[joinTable]=joinModel.aggregation??""
    aggregation[joinTable2]=joinModel2.aggregation??""
    return {
        value:`select ${column} from ${table} left join ${joinTable} on ${expression} left join ${joinTable2} on ${expression2} ${expr?(" where "+expr):""}${order?` order by ${order.model.table}.${order.field} ${order.type}`:""}${limit!==undefined?` limit ${limit},${size}`:""}`,
        type:null,
        aggregation:aggregation
    }
}

export function generateLeftJoin3Sql<T1 extends BaseModel,T2 extends BaseModel,T3 extends BaseModel,T4 extends BaseModel,K1 extends keyof T1["model"]=null,K2 extends keyof T2["model"]=null,K3 extends keyof T3["model"]=null,K4 extends keyof T4["model"]=null,F1 extends string=null,F2 extends string=null,F3 extends string=null,F4 extends string=null,R1 extends K1=null,RR1 extends string=null,R2 extends K2=null,RR2 extends string=null,R3 extends K3=null,RR3 extends string=null,R4 extends K4=null,RR4 extends string=null>(mainModel:{
    model:T1,
    columns?:K1[],
    aggregation?:F1,
    rename?:{
        fields:R1[],
        newFields:RR1[]
    }
},joinModel:{
    model:T2,
    columns?:K2[],
    rename?:{
        fields:R2[],
        newFields:RR2[]
    }
    aggregation?:F2,
    expression:{
        [key in keyof T2["model"]]?:{
            model:T1|T3|T4,
            field:keyof (T1 & T3 & T4)["model"]
        }
    }
},joinModel2:{
    model:T3,
    columns?:K3[],
    aggregation?:F3,
    rename?:{
        fields:R3[],
        newFields:RR3[]
    }
    expression:{
        [key in keyof T3["model"]]?:{
            model:T1|T2|T4,
            field:keyof (T1 & T2 & T4)["model"]
        }
    }
},joinModel3:{
    model:T4,
    columns?:K4[],
    aggregation?:F4,
    rename?:{
        fields:R4[],
        newFields:RR4[]
    }
    expression:{
        [key in keyof T4["model"]]?:{
            model:T1|T2|T3,
            field:keyof (T1 & T2 & T3)["model"]
        }
    }
},objExpr?:{
    [param in keyof (T1 & T2 & T3 & T4)["model"]]?:{
        value:EXPRVALUE,
        model:T1|T2|T3|T4
    }|{
        [param in keyof (T1 & T2 & T3 & T4)["model"]]?:{ 
            value:EXPRVALUE,
            model:T1|T2|T3|T4
        }
    }
},exprMode?:"and"|"or",order?:{
    field:keyof(T1["model"] & T2["model"] & T3["model"] & T4["model"]),
    model:T1 | T2 | T3 | T4,
    type:"asc"|"desc"
},limit?:number,size?:number):{
    value:string,
    type:(F1 extends null ? Rename<{
        [key in K1]:T1["model"][key]
    },R1,RR1>:{
        [key in F1]:Rename<{
            [key in K1]:T1["model"][key]
        },R1,RR1>
    }) & (F2 extends null ? Rename<{
        [key in K2]:T2["model"][key]
    },R2,RR2>:{
        [key in F2]:Rename<{
            [key in K2]:T2["model"][key]
        },R2,RR2>
    }) & (F3 extends null ? Rename<{
        [key in K3]:T3["model"][key]
    },R3,RR3>:{
        [key in F3]:Rename<{
            [key in K3]:T3["model"][key]
        },R3,RR3>
    }) & (F4 extends null ? Rename<{
        [key in K4]:T4["model"][key]
    },R4,RR4>:{
        [key in F4]:Rename<{
            [key in K4]:T4["model"][key]
        },R4,RR4>
    }),
    aggregation:{
        [key:string]:string
    }
} {
    let expr=generateLeftJoinExp(objExpr,exprMode);
    let table=mainModel.model.table
    let joinTable=joinModel.model.table
    let joinTable2=joinModel2.model.table
    let joinTable3=joinModel3.model.table
    let key=Object.keys(joinModel.expression)[0]
    let value=joinModel.expression[key]
    let key2=Object.keys(joinModel2.expression)[0]
    let value2=joinModel2.expression[key]
    let key3=Object.keys(joinModel3.expression)[0]
    let value3=joinModel3.expression[key]
    let expression=`${joinTable}.${key}=${value.model.table}.${value.field}`
    let expression2=`${joinTable2}.${key2}=${value2.model.table}.${value2.field}`
    let expression3=`${joinTable3}.${key3}=${value3.model.table}.${value3.field}`
    let rename=mainModel.rename
    let renameJoin=joinModel.rename
    let renameJoin2=joinModel2.rename
    let renameJoin3=joinModel3.rename
    let aggregation={}
    let column=""
    if(mainModel.columns && mainModel.columns.length>0) {
        let str=mainModel.columns.map((item)=>{
            return `${table}.${item} _${table}__${(rename && rename.fields.includes(item as any))?rename.newFields[rename.fields.indexOf(item as any)]:item}`
        }).join(",")
        column+=str;
    }
    if(joinModel.columns && joinModel.columns.length>0) {
        let str=joinModel.columns.map((item)=>{
            return `${joinTable}.${item} _${joinTable}__${(renameJoin && renameJoin.fields.includes(item as any))?renameJoin.newFields[renameJoin.fields.indexOf(item as any)]:item}`
        }).join(",")
        column+=","+str;
    }
    if(joinModel2.columns && joinModel2.columns.length>0) {
        let str=joinModel2.columns.map((item)=>{
            return `${joinTable2}.${item} _${joinTable2}__${(renameJoin2 && renameJoin2.fields.includes(item as any))?renameJoin2.newFields[renameJoin2.fields.indexOf(item as any)]:item}`
        }).join(",")
        column+=","+str;
    }
    if(joinModel3.columns && joinModel3.columns.length>0) {
        let str=joinModel3.columns.map((item)=>{
            return `${joinTable3}.${item} _${joinTable3}__${(renameJoin3 && renameJoin3.fields.includes(item as any))?renameJoin3.newFields[renameJoin3.fields.indexOf(item as any)]:item}`
        }).join(",")
        column+=","+str;
    }
    column=column.trim()
    if(column[0]==",")
    {
        column=column.substr(1)
    }
    aggregation[table]=mainModel.aggregation??""
    aggregation[joinTable]=joinModel.aggregation??""
    aggregation[joinTable2]=joinModel2.aggregation??""
    aggregation[joinTable3]=joinModel3.aggregation??""
    return {
        value:`select ${column} from ${table} left join ${joinTable} on ${expression} left join ${joinTable2} on ${expression2} left join ${joinTable3} on ${expression3} ${expr?(" where "+expr):""}${order?` order by ${order.model.table}.${order.field} ${order.type}`:""}${limit!==undefined?` limit ${limit},${size}`:""}`,
        type:null,
        aggregation:aggregation
    }
}

export function exculdeColumns<R1 extends keyof BaseModel["model"],R2 extends R1=null>(originColumns:R1[],excludeColums:R2[]):Exclude<R1,(any extends R2?null:R2)>[]{
    if(originColumns && Array.isArray(originColumns) && originColumns.length>0 && excludeColums && Array.isArray(excludeColums) && excludeColums.length>0) {
        let arr=originColumns.filter(item=>{
            if(excludeColums.includes(item as unknown as R2)){
                return false
            }
            return true;
        })
        return <any>arr;
    }
}

export function generateCountSql<T extends BaseModel>(model:T,objExpr?:{
    [param in keyof T["model"]]?:EXPRVALUE
},exprMode?:"and"|"or"):{
    value:string,
    type:{
        "count(1)":string
    }
} {
    let expr=generateExp(objExpr,exprMode);
    return {
        value:`select count(1) from ${model.table}${expr?(" where "+expr):""}`,
        type:{
            "count(1)":""
        }
    }
}

export function generateMaxSql<T extends BaseModel,K1 extends keyof T["model"]>(model:T,columnMax:K1,objExpr?:{
    [param in keyof T["model"]]?:EXPRVALUE
},exprMode?:"and"|"or"):{
    value:string,
    type:{
        [key in Extract<keyof T["model"],K1>]:T["model"][key]
    }
} {
    let column=`max(${columnMax}) ${columnMax}`
    let expr=generateExp(objExpr,exprMode);
    return {
        value:`select ${column} from ${model.table}${expr?(" where "+expr):""}`,
        type:model.model
    }
}

export function generateMinSql<T extends BaseModel,K1 extends keyof T["model"]>(model:T,columnMin:K1,objExpr?:{
    [param in keyof T["model"]]?:EXPRVALUE
},exprMode?:"and"|"or"):{
    value:string,
    type:{
        [key in Extract<keyof T["model"],K1>]:T["model"][key]
    }
} {
    let column=`min(${columnMin}) ${columnMin}`
    let expr=generateExp(objExpr,exprMode);
    return {
        value:`select ${column} from ${model.table}${expr?(" where "+expr):""}`,
        type:model.model
    }
}

type COLUMNSVALUEVALUETYPE<T>={
    exp:"="|"<>"|"<"|">"|">="|"<=",
    value:string|number,
    field:T
}

type COLUMNSVALUETYPE<R,K>={
    exp:"count"|"sum"|"avg"|"max"|"min",
    value:R|COLUMNSVALUEVALUETYPE<R>,
    rename:K
}

function ISCOLUMNSVALUEVALUETYPE<R,K>(value:COLUMNSVALUETYPE<R,K>["value"]):value is COLUMNSVALUEVALUETYPE<R> {
    if(typeof(value)=="object" && (value as COLUMNSVALUEVALUETYPE<R>).exp && (value as COLUMNSVALUEVALUETYPE<R>).value!==undefined && (value as COLUMNSVALUEVALUETYPE<R>).value!==null) {
        return true
    }
}

function ISCOLUMNSVALUETYPE<T,R,K>(value:T|COLUMNSVALUETYPE<R,K>):value is COLUMNSVALUETYPE<R,K> {
    if(typeof(value)=="object" && (value as COLUMNSVALUETYPE<R,K>).exp && (value as COLUMNSVALUETYPE<R,K>).value && (value as COLUMNSVALUETYPE<R,K>).rename) {
        return true
    }
}

function handleEachColumn<T,R,K>(column:T|COLUMNSVALUETYPE<R,K>) {
    if(typeof(column)=="string") {
        return column
    } else if(ISCOLUMNSVALUETYPE(column)) {
        let str=column.exp+"("
        if(typeof(column.value)=="string") {
            str+=column.value
        } else if(ISCOLUMNSVALUEVALUETYPE(column.value)) {
            str+=column.value.field+column.value.exp+(typeof(column.value.value=="string")?("'"+column.value.value+"'"):column.value.value)
        }
        str+=") "+column.rename
        return str
    }
}

function handleLeftJoinEachColumn<T,R,K>(column:T|COLUMNSVALUETYPE<R,K>,table:string):{
    rename:string,
    exp:boolean,
    field:string
} {
    if(typeof(column)=="string") {
        return {
            rename:column,
            exp:false,
            field:column
        }
    } else if(ISCOLUMNSVALUETYPE(column)) {
        let str=column.exp+"("
        if(typeof(column.value)=="string") {
            str+=table+"."+column.value
        } else if(ISCOLUMNSVALUEVALUETYPE(column.value)) {
            str+=table+"."+column.value.field+column.value.exp+(typeof(column.value.value=="string")?("'"+column.value.value+"'"):column.value.value)
        }
        str+=") "
        return {
            rename:<string><unknown>column.rename,
            field:str,
            exp:true
        }
    }
}

function handleColums<T,R,K>(columns:{
    columns:T[],
    calcColumns:COLUMNSVALUETYPE<R,K>[]
}) {
    let column="",arrColumn:string[]=[]
    let arr=[...columns.columns,...columns.calcColumns]
    if(arr.length>0) {
        for(let obj of arr){
            let str=handleEachColumn(obj)
            arrColumn.push(str)
        }
        column=arrColumn.join(",")
    } else {
        column="*"
    }
    return column;
}

type HAVINGEXP={
    func:"sum"|"max"|"min"|"avg"|"count"
    exp:"="|">"|"<"|"<>"|">="|"<=",
    value:string|number
}

function generateHavingExp(obj:{
    [param:string]:HAVINGEXP
},objMode:"and"|"or"):string {
    let arr=[]
    for(let key in obj) {
        let val=obj[key]
        arr.push(`${val.func}(${key})${val.exp}${typeof(val.value)=="string"?("'"+val.value+"'"):val.value}`)
    }
    let ret=arr.join(` ${objMode?objMode:"and"} `)
    return ret;
}

function generateLeftJoinHavingExp<T extends BaseModel>(obj:{
    [param:string]:{
        model:T,
        exp:HAVINGEXP
    }
},objMode:"and"|"or"):string {
    let arr=[]
    for(let key in obj) {
        let val=obj[key]
        arr.push(`${val.exp.func}(${val.model.table}.${key})${val.exp}${typeof(val.exp.value)=="string"?("'"+val.exp.value+"'"):val.exp.value}`)
    }
    let ret=arr.join(` ${objMode?objMode:"and"} `)
    return ret;
}

export function testSql<T extends BaseModel,K1 extends keyof T["model"]=null,R extends keyof T["model"]=null,RR extends string=null,O extends boolean=false>(model:T,groups:(keyof T["model"])[],columns:{
    columns:K1[],
    calcColumns:COLUMNSVALUETYPE<R,RR>[]
},objExpr?:{
    [param in keyof T["model"]]?:EXPRVALUE
},exprMode?:"and"|"or",having?:{
    [param in keyof T["model"]]?:HAVINGEXP
},havingMode?:"and"|"or",order?:{
    field:O extends false?(keyof T["model"]):RR,
    isVitualField:O,
    type:"asc"|"desc"
},limit?:number,size?:number):{
    value:string,
    type:Rename<{
        [key in K1|R]:T["model"][key]
    },R,RR>
} {
    return null
}

export function generateGroupSql<T extends BaseModel,K1 extends keyof T["model"],R extends keyof T["model"],RR extends string=null,O extends boolean=false>(model:T,groups:(keyof T["model"])[],columns:{
    columns:K1[],
    calcColumns:COLUMNSVALUETYPE<R,RR>[]
},objExpr?:{
    [param in keyof T["model"]]?:EXPRVALUE
},exprMode?:"and"|"or",having?:{
    [param in keyof T["model"]]?:HAVINGEXP
},havingMode?:"and"|"or",order?:{
    field:O extends false?(keyof T["model"]):RR,
    isVitualField:O,
    type:"asc"|"desc"
},limit?:number,size?:number):{
    value:string,
    type:Rename<{
        [key in K1|R]:T["model"][key]
    },R,RR>
} {
    let column=handleColums(columns)
    let expr=generateExp(objExpr,exprMode);
    let havingExpr=generateHavingExp(having,havingMode);
    return {
        value:`select ${column} from ${model.table}${expr?(" where "+expr):""} group by ${groups.join(",")}${having?(" having "+havingExpr):""}${order?` order by ${order.field} ${order.type}`:""}${limit!==undefined?` limit ${limit},${size}`:""}`,
        type:model.model
    }
}

export function generateGroupLeftJoinSql<T1 extends BaseModel,T2 extends BaseModel,K1 extends keyof T1["model"]=null,K2 extends keyof T2["model"]=null,F1 extends string=null,F2 extends string=null,R1 extends keyof T1["model"]=null,RR1 extends string=null,R2 extends keyof T2["model"]=null,RR2 extends string=null,O extends boolean=false>(mainModel:{
    model:T1,
    columns?:{
        columns:K1[],
        calcColumns:COLUMNSVALUETYPE<R1,RR1>[]
    },
    aggregation?:F1,
},joinModel:{
    model:T2,
    columns?:{
        columns:K2[],
        calcColumns:COLUMNSVALUETYPE<R2,RR2>[]
    },
    aggregation?:F2
    expression:{
        [key in keyof T2["model"]]?:{
            model:T1,
            field:keyof T1["model"]
        }
    }
},groups:(keyof T1["model"])[],objExpr?:{
    [param in keyof (T1 & T2)["model"]]?:{
        value:EXPRVALUE,
        model:T1|T2
    }
},exprMode?:"and"|"or",having?:{
    [param in keyof T1["model"]]?:{
        model:T1,
        exp:HAVINGEXP
    }
},havingMode?:"and"|"or",order?:{
    field:O extends false?(keyof(T1["model"] & T2["model"])):(RR1|RR2),
    model:T1 | T2,
    isVitualField:O,
    type:"asc"|"desc"
},limit?:number,size?:number):{
    value:string,
    type:(F1 extends null ? Rename<{
        [key in K1|R1]:T1["model"][key]
    },R1,RR1>:{
        [key in F1]:Rename<{
            [key in K1|R1]:T1["model"][key]
        },R1,RR1>
    }) & (F2 extends null ? Rename<{
        [key in K2|R2]:T2["model"][key]
    },R2,RR2>:{
        [key in F2]:Rename<{
            [key in K2|R2]:T2["model"][key]
        },R2,RR2>
    }),
    aggregation:{
        [key:string]:string
    }
} {
    let expr=generateLeftJoinExp(objExpr,exprMode);
    let table=mainModel.model.table
    let joinTable=joinModel.model.table
    let key=Object.keys(joinModel.expression)[0]
    let value=joinModel.expression[key]
    let expression=`${joinTable}.${key}=${value.model.table}.${value.field}`
    let aggregation={}
    let column=""
    let havingExpr=generateLeftJoinHavingExp(having,havingMode);
    if(mainModel.columns) {
        let arr=[]
        if(mainModel.columns.columns && mainModel.columns.columns.length>0) {
            arr=arr.concat(mainModel.columns.columns)
        }
        if(mainModel.columns.calcColumns && mainModel.columns.calcColumns.length>0) {
            arr=arr.concat(mainModel.columns.calcColumns)
        }
        let str=arr.map((item)=>{
            let val=handleLeftJoinEachColumn(item,table)
            return `${val.exp?"":table}${val.field} _${table}__${val.rename}`
        }).join(",")
        column+=str;
    }
    if(joinModel.columns) {
        let arr=[]
        if(joinModel.columns.columns && joinModel.columns.columns.length>0) {
            arr=arr.concat(joinModel.columns.columns)
        }
        if(joinModel.columns.calcColumns && joinModel.columns.calcColumns.length>0) {
            arr=arr.concat(joinModel.columns.calcColumns)
        }
        let str=arr.map((item)=>{
            let val=handleLeftJoinEachColumn(item,joinTable)
            return `${val.exp?"":joinTable}${val.field} _${joinTable}__${val.rename}`
        }).join(",")
        column+=","+str;
    }
    column=column.trim()
    if(column[0]==",")
    {
        column=column.substr(1)
    }
    aggregation[table]=mainModel.aggregation??""
    aggregation[joinTable]=joinModel.aggregation??""
    return {
        value:`select ${column} from ${table} left join ${joinTable} on ${expression} ${expr?(" where "+expr):""} group by ${groups.join(",")}${having?(" having "+havingExpr):""}${order?` order by ${order.isVitualField?`_${order.model.table}__${order.field}`:(order.model.table+"."+order.field)} ${order.type}`:""}${limit!==undefined?` limit ${limit},${size}`:""}`,
        type:null,
        aggregation:aggregation
    }
}

export function generateGroupLeftJoin2Sql<T1 extends BaseModel,T2 extends BaseModel,T3 extends BaseModel,K1 extends keyof T1["model"]=null,K2 extends keyof T2["model"]=null,K3 extends keyof T3["model"]=null,F1 extends string=null,F2 extends string=null,F3 extends string=null,R1 extends keyof T1["model"]=null,RR1 extends string=null,R2 extends keyof T2["model"]=null,RR2 extends string=null,R3 extends keyof T3["model"]=null,RR3 extends string=null,O extends boolean=false>(mainModel:{
    model:T1,
    columns?:{
        columns:K1[],
        calcColumns:COLUMNSVALUETYPE<R1,RR1>[]
    },
    aggregation?:F1,
},joinModel:{
    model:T2,
    columns?:{
        columns:K2[],
        calcColumns:COLUMNSVALUETYPE<R2,RR2>[]
    },
    aggregation?:F2,
    expression:{
        [key in keyof T2["model"]]?:{
            model:T1|T3,
            field:keyof (T1 & T3)["model"]
        }
    }
},joinModel2:{
    model:T3,
    columns?:{
        columns:K3[],
        calcColumns:COLUMNSVALUETYPE<R3,RR3>[]
    },
    aggregation?:F3,
    expression:{
        [key in keyof T3["model"]]?:{
            model:T1|T2,
            field:keyof (T1 & T2)["model"]
        }
    }
},groups:(keyof T1["model"])[],objExpr?:{
    [param in keyof (T1 & T2 & T3)["model"]]?:{
        value:EXPRVALUE,
        model:T1|T2|T3
    }
},exprMode?:"and"|"or",having?:{
    [param in keyof T1["model"]]?:{
        model:T1,
        exp:HAVINGEXP
    }
},havingMode?:"and"|"or",order?:{
    field:O extends false?(keyof(T1["model"] & T2["model"] & T3["model"])):(RR1|RR2|RR3),
    model:T1 | T2 | T3,
    isVitualField:O,
    type:"asc"|"desc"
},limit?:number,size?:number):{
    value:string,
    type:(F1 extends null ? Rename<{
        [key in K1|R1]:T1["model"][key]
    },R1,RR1>:{
        [key in F1]:Rename<{
            [key in K1|R1]:T1["model"][key]
        },R1,RR1>
    }) & (F2 extends null ? Rename<{
        [key in K2|R2]:T2["model"][key]
    },R2,RR2>:{
        [key in F2]:Rename<{
            [key in K2|R2]:T2["model"][key]
        },R2,RR2>
    }) & (F3 extends null ? Rename<{
        [key in K3|R3]:T3["model"][key]
    },R3,RR3>:{
        [key in F3]:Rename<{
            [key in K3|R3]:T3["model"][key]
        },R3,RR3>
    }),
    aggregation:{
        [key:string]:string
    }
} {
    let expr=generateLeftJoinExp(objExpr,exprMode);
    let table=mainModel.model.table
    let joinTable=joinModel.model.table
    let joinTable2=joinModel2.model.table
    let key=Object.keys(joinModel.expression)[0]
    let value=joinModel.expression[key]
    let key2=Object.keys(joinModel2.expression)[0]
    let value2=joinModel2.expression[key]
    let expression=`${joinTable}.${key}=${value.model.table}.${value.field}`
    let expression2=`${joinTable2}.${key2}=${value2.model.table}.${value2.field}`
    let havingExpr=generateLeftJoinHavingExp(having,havingMode);
    let aggregation={}
    let column=""
    if(mainModel.columns) {
        let arr=[]
        if(mainModel.columns.columns && mainModel.columns.columns.length>0) {
            arr=arr.concat(mainModel.columns.columns)
        }
        if(mainModel.columns.calcColumns && mainModel.columns.calcColumns.length>0) {
            arr=arr.concat(mainModel.columns.calcColumns)
        }
        let str=arr.map((item)=>{
            let val=handleLeftJoinEachColumn(item,table)
            return `${val.exp?"":(table+".")}${val.field} _${table}__${val.rename}`
        }).join(",")
        column+=str;
    }
    if(joinModel.columns) {
        let arr=[]
        if(joinModel.columns.columns && joinModel.columns.columns.length>0) {
            arr=arr.concat(joinModel.columns.columns)
        }
        if(joinModel.columns.calcColumns && joinModel.columns.calcColumns.length>0) {
            arr=arr.concat(joinModel.columns.calcColumns)
        }
        let str=arr.map((item)=>{
            let val=handleLeftJoinEachColumn(item,joinTable)
            return `${val.exp?"":(joinTable+".")}${val.field} _${joinTable}__${val.rename}`
        }).join(",")
        column+=","+str;
    }
    if(joinModel2.columns) {
        let arr=[]
        if(joinModel2.columns.columns && joinModel2.columns.columns.length>0) {
            arr=arr.concat(joinModel2.columns.columns)
        }
        if(joinModel2.columns.calcColumns && joinModel2.columns.calcColumns.length>0) {
            arr=arr.concat(joinModel2.columns.calcColumns)
        }
        let str=arr.map((item)=>{
            let val=handleLeftJoinEachColumn(item,joinTable2)
            return `${val.exp?"":(joinTable2+".")}${val.field} _${joinTable2}__${val.rename}`
        }).join(",")
        column+=","+str;
    }
    column=column.trim()
    if(column[0]==",")
    {
        column=column.substr(1)
    }
    aggregation[table]=mainModel.aggregation??""
    aggregation[joinTable]=joinModel.aggregation??""
    aggregation[joinTable2]=joinModel2.aggregation??""
    return {
        value:`select ${column} from ${table} left join ${joinTable} on ${expression} left join ${joinTable2} on ${expression2} ${expr?(" where "+expr):""} group by ${groups.join(",")}${having?(" having "+havingExpr):""}${order?` order by ${order.isVitualField?`_${order.model.table}__${order.field}`:(order.model.table+"."+order.field)} ${order.type}`:""}${limit!==undefined?` limit ${limit},${size}`:""}`,
        type:null,
        aggregation:aggregation
    }
}

export function generateGroupLeftJoin3Sql<T1 extends BaseModel,T2 extends BaseModel,T3 extends BaseModel,T4 extends BaseModel,K1 extends keyof T1["model"]=null,K2 extends keyof T2["model"]=null,K3 extends keyof T3["model"]=null,K4 extends keyof T4["model"]=null,F1 extends string=null,F2 extends string=null,F3 extends string=null,F4 extends string=null,R1 extends keyof T1["model"]=null,RR1 extends string=null,R2 extends keyof T2["model"]=null,RR2 extends string=null,R3 extends keyof T3["model"]=null,RR3 extends string=null,R4 extends keyof T4["model"]=null,RR4 extends string=null,O extends boolean=false>(mainModel:{
    model:T1,
    columns?:{
        columns:K1[],
        calcColumns:COLUMNSVALUETYPE<R1,RR1>[]
    },
    aggregation?:F1
},joinModel:{
    model:T2,
    columns?:{
        columns:K1[],
        calcColumns:COLUMNSVALUETYPE<R1,RR1>[]
    },
    aggregation?:F2,
    expression:{
        [key in keyof T2["model"]]?:{
            model:T1|T3|T4,
            field:keyof (T1 & T3 & T4)["model"]
        }
    }
},joinModel2:{
    model:T3,
    columns?:{
        columns:K1[],
        calcColumns:COLUMNSVALUETYPE<R1,RR1>[]
    },
    aggregation?:F3,
    expression:{
        [key in keyof T3["model"]]?:{
            model:T1|T2|T4,
            field:keyof (T1 & T2 & T4)["model"]
        }
    }
},joinModel3:{
    model:T4,
    columns?:{
        columns:K1[],
        calcColumns:COLUMNSVALUETYPE<R1,RR1>[]
    },
    aggregation?:F4,
    expression:{
        [key in keyof T4["model"]]?:{
            model:T1|T2|T3,
            field:keyof (T1 & T2 & T3)["model"]
        }
    }
},groups:(keyof T1["model"])[],objExpr?:{
    [param in keyof (T1 & T2 & T3 & T4)["model"]]?:{
        value:EXPRVALUE,
        model:T1|T2|T3|T3
    }
},exprMode?:"and"|"or",having?:{
    [param in keyof T1["model"]]?:{
        model:T1,
        exp:HAVINGEXP
    }
},havingMode?:"and"|"or",order?:{
    field:O extends false?(keyof(T1["model"] & T2["model"] & T3["model"] & T4["model"])):(RR1|RR2|RR3|RR4),
    model:T1 | T2 | T3 | T4,
    isVitualField:O,
    type:"asc"|"desc"
},limit?:number,size?:number):{
    value:string,
    type:(F1 extends null ? Rename<{
        [key in K1|R1]:T1["model"][key]
    },R1,RR1>:{
        [key in F1]:Rename<{
            [key in K1|R1]:T1["model"][key]
        },R1,RR1>
    }) & (F2 extends null ? Rename<{
        [key in K2|R2]:T2["model"][key]
    },R2,RR2>:{
        [key in F2]:Rename<{
            [key in K2|R2]:T2["model"][key]
        },R2,RR2>
    }) & (F3 extends null ? Rename<{
        [key in K3|R3]:T3["model"][key]
    },R3,RR3>:{
        [key in F3]:Rename<{
            [key in K3|R3]:T3["model"][key]
        },R3,RR3>
    }) & (F4 extends null ? Rename<{
        [key in K4|R4]:T4["model"][key]
    },R4,RR4>:{
        [key in F4]:Rename<{
            [key in K4|R4]:T4["model"][key]
        },R4,RR4>
    }),
    aggregation:{
        [key:string]:string
    }
} {
    let expr=generateLeftJoinExp(objExpr,exprMode);
    let table=mainModel.model.table
    let joinTable=joinModel.model.table
    let joinTable2=joinModel2.model.table
    let joinTable3=joinModel3.model.table
    let key=Object.keys(joinModel.expression)[0]
    let value=joinModel.expression[key]
    let key2=Object.keys(joinModel2.expression)[0]
    let value2=joinModel2.expression[key]
    let key3=Object.keys(joinModel3.expression)[0]
    let value3=joinModel3.expression[key]
    let expression=`${joinTable}.${key}=${value.model.table}.${value.field}`
    let expression2=`${joinTable2}.${key2}=${value2.model.table}.${value2.field}`
    let expression3=`${joinTable3}.${key3}=${value3.model.table}.${value3.field}`
    let havingExpr=generateLeftJoinHavingExp(having,havingMode);
    let aggregation={}
    let column=""
    if(mainModel.columns) {
        let arr=[]
        if(mainModel.columns.columns && mainModel.columns.columns.length>0) {
            arr=arr.concat(mainModel.columns.columns)
        }
        if(mainModel.columns.calcColumns && mainModel.columns.calcColumns.length>0) {
            arr=arr.concat(mainModel.columns.calcColumns)
        }
        let str=arr.map((item)=>{
            let val=handleLeftJoinEachColumn(item,table)
            return `${val.exp?"":table}${val.field} _${table}__${val.rename}`
        }).join(",")
        column+=str;
    }
    if(joinModel.columns) {
        let arr=[]
        if(joinModel.columns.columns && joinModel.columns.columns.length>0) {
            arr=arr.concat(joinModel.columns.columns)
        }
        if(joinModel.columns.calcColumns && joinModel.columns.calcColumns.length>0) {
            arr=arr.concat(joinModel.columns.calcColumns)
        }
        let str=arr.map((item)=>{
            let val=handleLeftJoinEachColumn(item,joinTable)
            return `${val.exp?"":joinTable}${val.field} _${joinTable}__${val.rename}`
        }).join(",")
        column+=","+str;
    }
    if(joinModel2.columns) {
        let arr=[]
        if(joinModel2.columns.columns && joinModel2.columns.columns.length>0) {
            arr=arr.concat(joinModel2.columns.columns)
        }
        if(joinModel2.columns.calcColumns && joinModel2.columns.calcColumns.length>0) {
            arr=arr.concat(joinModel2.columns.calcColumns)
        }
        let str=arr.map((item)=>{
            let val=handleLeftJoinEachColumn(item,joinTable2)
            return `${val.exp?"":joinTable2}${val.field} _${joinTable2}__${val.rename}`
        }).join(",")
        column+=","+str;
    }
    if(joinModel3.columns) {
        let arr=[]
        if(joinModel3.columns.columns && joinModel3.columns.columns.length>0) {
            arr=arr.concat(joinModel3.columns.columns)
        }
        if(joinModel3.columns.calcColumns && joinModel3.columns.calcColumns.length>0) {
            arr=arr.concat(joinModel3.columns.calcColumns)
        }
        let str=arr.map((item)=>{
            let val=handleLeftJoinEachColumn(item,joinTable3)
            return `${val.exp?"":joinTable3}${val.field} _${joinTable3}__${val.rename}`
        }).join(",")
        column+=","+str;
    }
    column=column.trim()
    if(column[0]==",")
    {
        column=column.substr(1)
    }
    aggregation[table]=mainModel.aggregation??""
    aggregation[joinTable]=joinModel.aggregation??""
    aggregation[joinTable2]=joinModel2.aggregation??""
    aggregation[joinTable3]=joinModel3.aggregation??""
    return {
        value:`select ${column} from ${table} left join ${joinTable} on ${expression} left join ${joinTable2} on ${expression2} left join ${joinTable3} on ${expression3} ${expr?(" where "+expr):""} group by ${groups.join(",")}${having?(" having "+havingExpr):""}${order?` order by ${order.isVitualField?`_${order.model.table}__${order.field}`:(order.model.table+"."+order.field)} ${order.type}`:""}${limit!==undefined?` limit ${limit},${size}`:""}`,
        type:null,
        aggregation:aggregation
    }
}