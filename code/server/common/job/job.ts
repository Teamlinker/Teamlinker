import * as schedule from "node-schedule";
var g_job:InstanceType<typeof Job>
class Job {
    map:Map<string,schedule.Job>=new Map
    constructor(){

    } 
    create(name:string,rule:{
        second?:number,
        minute?:number,
        hour?:number
    },func:{(fireDate:Date):void}){
        if(!this.map.has(name)) {
            let r=new schedule.RecurrenceRule
            if(rule.minute) {
                r.minute=rule.minute
            } else if(rule.second) {
                r.second=rule.second
            } else if(rule.hour) {
                r.hour=rule.hour
            }
            let job=schedule.scheduleJob(r,func);
            this.map.set(name,job)
        }
    }
    remove(name) {
        if(this.map.has(name)){
            this.map.get(name).cancel()
            this.map.delete(name)
        }
    }
}
export default function getJobInstance() {
    if(!g_job) {
        g_job=new Job
    }
    return g_job
}