import { UniqueID } from 'nodejs-snowflake';
import { BaseModel } from '../../../common/model/base';

const uid = new UniqueID({
    returnNumber: false
}); 

type EXPR={
    [key:string]:EXPRVALUE
}
type EXPRVALUE=string|number|boolean|string|Date|{
    value?:string|number|boolean|string[]|[number,number]|string|Date,
    exp?:"="|">="|"<="|">"|"<"|"<>"|"is null"|"in"|"is not null"|"between"|"%like"|"like%"|"%like%"
}

export async function generateSnowId() {
    let id =await uid.asyncGetUniqueID()
    return id as string
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
            } else {
                if (value.exp == "=" || value.exp=="<=" || value.exp==">" || value.exp=="<" || value.exp=="<>" || !value.exp) {
                    if(!value.exp) {
                        value.exp="="
                    }
                    let val = typeof (value.value) == "number" ? value.value : typeof (value.value) == "boolean" ? (value.value ? 1 : 0) : ("'" + value.value + "'")
                    arrExpr.push(`${key}${value.exp}${val}`)
                } else if(value.exp=="is null") {
                    arrExpr.push(`${key} is null`)
                } else if(value.exp=="in") {
                    arrExpr.push(`${key} in (${(<string[] | number[]>value.value).map((item)=>{
                        return typeof(item)=="number"?item:("'"+item+"'")
                    }).join(",")})`)
                } else if(value.exp=="is not null") {
                    arrExpr.push(`${key} is not null`)
                } else if(value.exp=="between") {
                    let val=value.value as [number,number];
                    arrExpr.push(`${key} between ${val[0]} and ${val[1]}`)
                } else if(value.exp=="%like") {
                    arrExpr.push(`${key} like '%${value.value}'`)
                } else if(value.exp=="like%") {
                    arrExpr.push(`${key} like '${value.value}%'`)
                } else if(value.exp=="%like%") {
                    arrExpr.push(`${key} like '%${value.value}%'`)
                }
            }
        }
        expr=arrExpr.join(` ${exprMode?exprMode:"and"} `)
    }
    return expr;
}

function generateLeftJoinExp(objExpr?:{
    [param :string]:{
        value:EXPRVALUE,
        model:{
            table:string
        }
    }
},exprMode?:"and"|"or"):string{
    let expr="",arrExpr=[]
    if(objExpr) {
        for(let key in objExpr) {
            let value=objExpr[key]
            if(typeof(value.value)!="object") {
                let val=typeof(value.value)=="number"?value.value:typeof(value.value)=="boolean"?(value.value?1:0):("'"+value.value+"'")
                arrExpr.push(`${value.model.table}.${key}=${val}`)
            } else if (typeof(value.value)=="object" && (value.value instanceof Date)){
                arrExpr.push(`${value.model.table}.${key}=${value.value.getTime()}`)
            } else {
                if (value.value.exp == "=" || value.value.exp=="<=" || value.value.exp==">" || value.value.exp=="<" || value.value.exp=="<>" || !value.value.exp) {
                    if(!value.value.exp) {
                        value.value.exp="="
                    }
                    let val = typeof (value.value) == "number" ? value.value : typeof (value.value) == "boolean" ? (value.value ? 1 : 0) : ("'" + value.value + "'")
                    arrExpr.push(`${value.model.table}.${key}${value.value.exp}${val}`)
                } else if(value.value.exp=="is null") {
                    arrExpr.push(`${value.model.table}.${key} is null`)
                } else if(value.value.exp=="in") {
                    arrExpr.push(`${value.model.table}.${key} in (${(<string[] | number[]>value.value.value).map((item)=>{
                        return typeof(item)=="number"?item:("'"+item+"'")
                    }).join(",")})`)
                } else if(value.value.exp=="is not null") {
                    arrExpr.push(`${value.model.table}.${key} is not null`)
                } else if(value.value.exp=="between") {
                    let val=value.value.value as [number,number];
                    arrExpr.push(`${value.model.table}.${key} between ${val[0]} and ${val[1]}`)
                } else if(value.value.exp=="%like") {
                    arrExpr.push(`${value.model.table}.${key} like '%${value.value.value}'`)
                } else if(value.value.exp=="like%") {
                    arrExpr.push(`${value.model.table}.${key} like '${value.value.value}%'`)
                } else if(value.value.exp=="%like%") {
                    arrExpr.push(`${value.model.table}.${key} like '%${value.value.value}%'`)
                }
            }
        }
        expr=arrExpr.join(` ${exprMode?exprMode:"and"} `)
    }
    return expr;
}
export function generateCreateSql<T extends BaseModel>(model:T,obj:{
    [param in keyof T["model"]]?:EXPRVALUE
}):{
    value:string,
    type:T["model"]
} {
    let keys="",values=""
    for(let key in obj) {
        let value=obj[key]
        keys+=(value!==null && value!==undefined)?(key+","):""
        values+=(value!==null && value!==undefined)?("'"+value+"'"+","):""
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

export function generateQuerySql<T extends BaseModel,K1 extends keyof T["model"]>(model:T,columns:K1[],objExpr?:{
    [param in keyof T["model"]]?:EXPRVALUE
},exprMode?:"and"|"or",limit?:number,size?:number):{
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
        value:`select ${column} from ${model.table}${expr?(" where "+expr):""}${limit!==undefined?` limit ${limit},${size}`:""}`,
        type:model.model
    }
}

export function generateUpdateSql<T extends BaseModel>(model:T,obj:{
    [param in keyof T["model"]]?:string|number|Date
},objExpr:{
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
        } else {
            val="'"+value+"'"
        }
        arrVal.push(`key=${val}`)
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
            filed:keyof T1["model"]
        }
    }
},objExpr?:{
    [param in keyof (T1 & T2)["model"]]?:{
        value:EXPRVALUE,
        model:T1|T2
    }
},exprMode?:"and"|"or"):{
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
    let expression=`${joinTable}.${key}=${value.model.table}.${value.filed}`
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
        value:`select ${column} from ${table} left join ${joinTable} on ${expression} ${expr?(" where "+expr):""}`,
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
            filed:keyof (T1 & T3)["model"]
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
            filed:keyof (T1 & T2)["model"]
        }
    }
},objExpr?:{
    [param in keyof (T1 & T2 & T3)["model"]]?:{
        value:EXPRVALUE,
        model:T1|T2|T3
    }
},exprMode?:"and"|"or"):{
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
    let expression=`${joinTable}.${key}=${value.model.table}.${value.filed}`
    let expression2=`${joinTable2}.${key2}=${value2.model.table}.${value2.filed}`
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
        value:`select ${column} from ${table} left join ${joinTable} on ${expression} left join ${joinTable2} on ${expression2} ${expr?(" where "+expr):""}`,
        type:null,
        aggregation:aggregation
    }
}