import {Ref, ref} from "vue";
import {IClient_Calendar_Date, IClient_Calendar_Info} from "./type";
import moment from "moment";
import "moment-timezone"

export class CalendarManage {
    private type=ref<"day"|"month">("day")
    private arrCross=ref<IClient_Calendar_Info[][]>([])
    private arr=ref<IClient_Calendar_Info[][][]>([])
    private eventList=ref<IClient_Calendar_Info[]>([])
    private dateRange:Ref<[moment.Moment,moment.Moment]>=ref()
    private month=ref<moment.Moment>()
    private timeZone:string
    setTimeZone(timeZone:string) {
        this.timeZone=timeZone
    }
    getData() {
        return this.arr
    }
    getCrossData() {
        return this.arrCross
    }
    getDateRange() {
        return this.dateRange
    }
    getWeekDaysInMonth() {
        let arr:moment.Moment[]=[]
        let dayStart=this.month.value.clone().startOf("month").startOf("week")
        let dayEnd=this.month.value.clone().endOf("month").endOf("week")
        while (!dayStart.isAfter(dayEnd)) {
            arr.push(dayStart.clone())
            dayStart.add("1","days")
        }
        return arr;
    }
    getDays():moment.Moment[]{
        let arr:moment.Moment[]=[]
        let startDay=this.dateRange.value[0].clone()
        while (!startDay.isAfter(this.dateRange.value[1],"day")) {
            arr.push(startDay.clone())
            startDay=startDay.add("1","days")
        }
        return arr;
    }
    calculateEventPosition():(IClient_Calendar_Info & {
        left:string,
        top:string,
        bottom:string,
        right:string,
        index:[number,number,number]
    })[][] {
        let arr:(IClient_Calendar_Info & {
            left:string,
            top:string,
            bottom:string,
            right:string,
            index:[number,number,number]
        })[][]=[]
        let startDay=this.dateRange.value[0].clone(),dayIndex=0
        while (!startDay.isAfter(this.dateRange.value[1],"day")) {
            arr.push([])
            let arrPosition=arr[arr.length-1]
            let eventPoints=this.arr.value[dayIndex]
            let eventList=[],startIndex=[]
            for(let i=0;i<eventPoints.length;i++) {
                for(let j=0;j<eventPoints[i].length;j++) {
                    if(eventPoints[i][j] && !eventList.includes(eventPoints[i][j])) {
                        eventList.push(eventPoints[i][j])
                        startIndex.push([dayIndex,i,j])
                    }
                }
            }
            for(let i=0;i<eventList.length;i++) {
                let event=eventList[i]
                let rect=this.getEventPosition(dayIndex,event)
                if(rect) {
                    arrPosition.push({
                        ...event,
                        ...rect,
                        index:startIndex[i]
                    })
                }
            }
            startDay=startDay.add("1","days")
            dayIndex++
        }
        return arr;
    }
    calculateMonthEventPosition():(IClient_Calendar_Info & {
        left:string,
        top:string,
        height:string,
        right:string,
        index:[number,number,number]
    })[][] {
        let weekRowCount=this.arr.value.length
        let arr:(IClient_Calendar_Info & {
            left:string,
            top:string,
            height:string,
            right:string,
            index:[number,number,number]
        })[][]=new Array(weekRowCount)
        for(let i=0;i<arr.length;i++) {
            arr[i]=[]
        }
        for(let weekRow=0;weekRow<weekRowCount;weekRow++) {
            let rowEventList=arr[weekRow]
            let eventList:IClient_Calendar_Info[]=[]
            for(let dayIndex=0;dayIndex<7;dayIndex++) {
                let dayEventList=this.arr.value[weekRow][dayIndex]
                for(let j=0;j<dayEventList.length;j++) {
                    if(dayEventList[j] && !eventList.includes(dayEventList[j])) {
                        eventList.push(dayEventList[j])
                        let event=dayEventList[j]
                        let k=dayIndex+1;
                        while (this.arr.value[weekRow] && this.arr.value[weekRow][k] && this.arr.value[weekRow][k][j]===event && k<7) {
                            k++;
                        }
                        let dayWidth=100/7
                        rowEventList.push({
                            ...event,
                            left:"calc("+(dayIndex%7*dayWidth)+"% + 2px)",
                            top:j*25+30+"px",
                            right:"calc("+((7-k)*dayWidth)+"% + 15px)",
                            height:"20px",
                            index:[weekRow,dayIndex,j]
                        })
                    }
                }
            }
        }
        return arr;
    }
    calculateCrossEventPosition():{
        data:(IClient_Calendar_Info & {
            left:string,
            top:string,
            height:string,
            right:string
        })[],
        height:string
    } {
        let arr:(IClient_Calendar_Info & {
            left:string,
            top:string,
            height:string,
            right:string
        })[]=[]
        let eventList:IClient_Calendar_Info[]=[]
        for(let i=0;i<this.arrCross.value.length;i++) {
            let row=this.arrCross.value[i]
            for(let j=0;j<row.length;j++) {
                if(row[j] && !eventList.includes(row[j])) {
                    eventList.push(row[j])
                    let event=row[j]
                    let k=j;
                    while (row[j]===event) {
                        j++;
                    }
                    j--;
                    arr.push({
                        ...event,
                        left:(k/row.length)*100+"%",
                        top:i*25+"px",
                        right:((row.length-(j+1))/row.length)*100+"%",
                        height:"20px"
                    })
                }
            }
        }
        return {
            data:arr,
            height:this.arrCross.value.length*25+"px"
        };
    }
    private getEventPosition(dayIndex:number,event:IClient_Calendar_Info):{
        left:string,
        top:string,
        right:string,
        bottom:string
    } {
        let objDate=this.generateDateObj(event)
        let startRow=objDate.startDate.hour()*60+objDate.startDate.minute();
        let endRow=objDate.endDate.hour()*60+objDate.endDate.minute();
        let count=0,index;
        let list=this.arr.value[dayIndex]
        for(let i=0;i<list.length;i++) {
            let col=list[i]
            let isFill=false
            for(let i=startRow;i<=endRow;i++) {
                if(col[i]) {
                    isFill=true
                    count++
                    if(col[i]==event) {
                        index=count
                    }
                    break
                }
            }
        }
        return count>0?{
            top:(startRow/1440)*100+"%",
            bottom:((1440-endRow)/1440)*100+"%",
            left:((index-1)/count)*100+"%",
            right:((count-index)/count)*100+"%"
        }:null;
    }
    initByDay(startDate:string|number, endDate:string|number, eventList:IClient_Calendar_Info[]) {
        this.type.value="day"
        this.arr.value=[]
        this.arrCross.value=[]
        this.dateRange.value=[moment.tz(startDate,this.timeZone),moment.tz(endDate,this.timeZone)]
        this.pushCrossRow()
        let startDay=this.dateRange.value[0].clone()
        let i=0;
        while (!startDay.isAfter(this.dateRange.value[1],"day")) {
            this.arr.value.push([])
            this.pushColumn(i++)
            startDay=startDay.add("1","days")
        }
        this.eventList.value=eventList
        this.parseEventListByDay()
    }
    initByMonth(month:string,eventList:IClient_Calendar_Info[]) {
        this.type.value="month"
        this.arr.value=[]
        this.month.value=moment.tz(month,this.timeZone)
        this.eventList.value=eventList
        let days=this.getWeekDaysInMonth()
        for(let i=0;i< days.length/7;i++) {
            this.arr.value.push([])
            for(let i=0;i<7;i++) {
                this.arr.value[this.arr.value.length-1].push([null])
            }
        }
        this.parseEventListByMonth(days)
    }
    private pushAllRowByMonth(weekRow:number) {
        let row=this.arr.value[weekRow]
        for(let i=0;i<row.length;i++) {
            row[i].push(null)
        }
    }
    private unshiftAllRowByMonth(weekRow:number) {
        let row=this.arr.value[weekRow]
        for(let i=0;i<row.length;i++) {
            row[i].unshift(null)
        }
    }
    private parseEventListByMonth(days:moment.Moment[]) {
        let eventListUp:IClient_Calendar_Info[]=[],eventListNormal:IClient_Calendar_Info[]=[]
        for(let event of this.eventList.value) {
            let objDate=this.generateDateObj(event)
            let days=objDate.endDate.diff(objDate.startDate.clone().startOf("days"),"days")
            if(days>0 || event.isAllDay) {
                eventListUp.push(event)
            } else {
                eventListNormal.push(event)
            }
        }
        for(let event of eventListUp) {
            let range=this.findAvailableCrossRow(event,days)
            if(range && range.length>0) {
                this.fillRow(event,range)
            } else {
                let [startIndex,endIndex]=this.calculateStartAndEndIndex(event,days[0],days[days.length-1])
                let weekStartRow=Math.floor(startIndex/7),weekEndRow=Math.floor(endIndex/7)
                startIndex=startIndex%7
                endIndex=endIndex%7
                if(weekStartRow==weekEndRow) {
                    if(this.arr.value[weekStartRow][startIndex][0]===null) {
                        this.unshiftAllRowByMonth(weekStartRow)
                        this.fillRow(event,[{
                            startIndex,
                            endIndex,
                            row:0,
                            weekRow:weekStartRow
                        }])
                    } else {
                        this.pushAllRowByMonth(weekStartRow)
                        this.fillRow(event,[{
                            startIndex,
                            endIndex,
                            row:this.arr.value[weekStartRow][0].length-1,
                            weekRow:weekStartRow
                        }])
                    }
                } else {
                    for(let i=weekStartRow;i<=weekEndRow;i++) {
                        let start,end
                        if(i==weekStartRow) {
                            start=startIndex;
                            end=6
                        } else if(i==weekEndRow) {
                            start=0;
                            end=endIndex
                        } else {
                            start=0;
                            end=6
                        }
                        if(this.arr.value[i][start][0]===null) {
                            this.unshiftAllRowByMonth(i)
                            this.fillRow(event,[{
                                startIndex:start,
                                endIndex:end,
                                row:0,
                                weekRow:i
                            }])
                        } else {
                            this.pushAllRowByMonth(i)
                            this.fillRow(event,[{
                                startIndex:start,
                                endIndex:end,
                                row:this.arr.value[i][0].length-1,
                                weekRow:i
                            }])
                        }
                    }
                }
            }
        }
        let arr=this.sortMonthEvent(eventListNormal,days)
        for(let dayIndex=0;dayIndex<arr.length;dayIndex++) {
            let dayEventList=arr[dayIndex]
            for(let i=0;i<dayEventList.length;i++) {
                let event=dayEventList[i]
                this.findAndFillRow(event,days)
            }
        }
        for(let i=0;i<this.arr.value.length;i++) {
            for(let j=0;j<this.arr.value[i].length;j++) {
                let count=this.arr.value[i][j].length
                while (this.arr.value[i][j][--count]===null);
                if(count+1<this.arr.value[i][j].length) {
                    this.arr.value[i][j].splice(count+1)
                }
            }
        }
    }
    private calculateStartAndEndIndex(event:IClient_Calendar_Info, startDate:moment.Moment, endDate:moment.Moment) {
        let objDate=this.generateDateObj(event)
        let startIndex=objDate.startDate.diff(startDate.clone().startOf("days"),"days")
        if(startIndex<0) {
            startIndex=0
        }
        let endIndex
        if(objDate.endDate.diff(endDate.clone().startOf("days"),"days")>0) {
            endIndex=endDate.diff(startDate.clone().startOf("days"),"days")
        } else {
            endIndex=objDate.endDate.diff(startDate.clone().startOf("days"),"days")
        }
        return [startIndex,endIndex]
    }
    private findAndFillRow(event:IClient_Calendar_Info, days:moment.Moment[]) {
        let [index,_]=this.calculateStartAndEndIndex(event,days[0],days[days.length-1])
        let col=this.arr.value[Math.floor(index/7)][index%7]
        for(let i=0;i<col.length;i++) {
            if(col[i]===null) {
                col[i]=event
                return
            }
        }
        col.push(null)
        col[col.length-1]=event
    }
    private sortMonthEvent(events:IClient_Calendar_Info[], days:moment.Moment[]):IClient_Calendar_Info[][] {
        let eventList:IClient_Calendar_Info[][]=new Array(days.length)
        for(let i=0;i<eventList.length;i++) {
            eventList[i]=[]
        }
        events.forEach(value => {
            let [index,_]=this.calculateStartAndEndIndex(value,days[0],days[days.length-1])
            eventList[index].push(value)
        })
        eventList.forEach(value => {
            value.sort((a, b) => {
                let objDateA=this.generateDateObj(a)
                let objDateB=this.generateDateObj(b)
                if(objDateA.startDate.isAfter(objDateB.startDate)) {
                    return 1
                } else {
                    return -1
                }
            })
        })
        return eventList;
    }
    private findAvailableCrossRow(event:IClient_Calendar_Info, days:moment.Moment[]):{
        startIndex:number,
        endIndex:number,
        row:number,
        weekRow:number
    }[] {
        let arr:{
            startIndex:number,
            endIndex:number,
            row:number,
            weekRow:number
        }[]=[]
        let [startIndex,endIndex]=this.calculateStartAndEndIndex(event,days[0],days[days.length-1])
        let weekStartRow=Math.floor(startIndex/7),weekEndRow=Math.floor(endIndex/7)
        startIndex=startIndex%7
        endIndex=endIndex%7
        if(weekStartRow==weekEndRow) {
            let weekList=this.arr.value[weekStartRow]
            for(let row=0;row<weekList[0].length;row++) {
                let isFill=false;
                for(let j=startIndex;j<=endIndex;j++) {
                    if(weekList[j][row]!==null) {
                        isFill=true
                        break
                    }
                }
                if(!isFill) {
                    arr.push({
                        startIndex,
                        endIndex,
                        weekRow:weekStartRow,
                        row
                    })
                    return arr;
                }
            }
        } else {
            for(let i=weekStartRow;i<=weekEndRow;i++) {
                let weekList=this.arr.value[i]
                let start,end
                if(i==weekStartRow) {
                    start=startIndex;
                    end=6
                } else if(i==weekEndRow) {
                    start=0;
                    end=endIndex
                } else {
                    start=0;
                    end=6
                }
                for(let row=0;row<weekList[0].length;row++) {
                    let isFill=false;
                    for(let j=start;j<=end;j++) {
                        if(weekList[j][row]!==null) {
                            isFill=true
                            break
                        }
                    }
                    if(!isFill) {
                        arr.push({
                            startIndex:start,
                            endIndex:end,
                            weekRow:i,
                            row
                        })
                    } else {
                        return;
                    }
                }

            }
        }

        return arr;
    }
    private fillRow(event:IClient_Calendar_Info, range:{
        startIndex:number,
        endIndex:number,
        row:number,
        weekRow:number
    }[]) {
        for(let obj of range) {
            let weekList=this.arr.value[obj.weekRow]
            for(let i=obj.startIndex;i<=obj.endIndex;i++) {
                weekList[i][obj.row]=event
            }
        }
    }
    private calculateStartDayIndex(date:moment.Moment) {
        let index=date.diff(this.dateRange.value[0].clone().startOf("days"),"days")
        if(index<0) {
            index=0
        }
        return index
    }
    checkCrossEvent(event:IClient_Calendar_Info):boolean {
        let objDate=this.generateDateObj(event)
        let days=objDate.endDate.diff(objDate.startDate.clone().startOf("days"),"days")
        if(days>0 || event.isAllDay) {
            return true;
        }
    }
    private parseEventListByDay() {
        for(let event of this.eventList.value) {
            let objDate=this.generateDateObj(event)
            let days=objDate.endDate.diff(objDate.startDate.clone().startOf("days"),"days")
            if(days>0 || event.isAllDay) {
                let range=this.findAvailableCrossRange(event)
                if(range) {
                    this.fillCrossRange(event,range)
                } else {
                    let startIndex=objDate.startDate.diff(this.dateRange.value[0].clone().startOf("days"),"days")
                    let endIndex=objDate.endDate.diff(this.dateRange.value[0].clone().startOf("days"),"days")
                    this.pushCrossRow()
                    this.fillCrossRange(event,{
                        start:[this.arrCross.value.length-1,startIndex],
                        end:[this.arrCross.value.length-1,endIndex]
                    })
                }
            } else {
                let range=this.findAvailableRange(event)
                if(range) {
                    this.fillRange(event,range)
                } else {
                    let isStartFill=false
                    let index=this.calculateStartDayIndex(objDate.startDate)
                    let startRow=objDate.startDate.hour()*60+objDate.startDate.minute();
                    let endRow=objDate.endDate.hour()*60+objDate.endDate.minute();
                    for(let i=0;i<this.arr.value[index].length;i++) {
                        if(this.arr.value[index][i][startRow]) {
                            isStartFill=true
                        }
                    }
                    if(isStartFill) {
                        this.pushColumn(index)
                        this.fillRange(event,{
                            start:[index,this.arr.value[index].length-1,startRow],
                            end:[index,this.arr.value[index].length-1,endRow]
                        })
                    } else {
                        this.unshiftColumn(index)
                        this.fillRange(event,{
                            start:[index,0,startRow],
                            end:[index,0,endRow]
                        })
                    }
                }
            }
        }
    }
    private fillRange(event:IClient_Calendar_Info, range:{
        start:[number,number,number],
        end:[number,number,number]
    }) {
        let day=this.arr.value[range.start[0]]
        let col=day[range.start[1]]
        for(let i=range.start[2];i<=range.end[2] && i<col.length;i++) {
            col[i]=event
        }
    }
    adjustEventRange(start:[number,number,number],offset:number) {
        if(offset<15) {
            offset=15
        }
        offset=Math.ceil(offset/15)*15
        let col=this.arr.value[start[0]][start[1]]
        let event=col[start[2]]
        let objStart=moment().tz(this.timeZone)
        objStart.set({
            year:event.startDate.year,
            month:event.startDate.month-1,
            date:event.startDate.day,
            hour:event.startDate.hour,
            minute:event.startDate.minute
        })
        let objDate=objStart.clone().add(offset,"minutes")
        if(objDate.diff(objStart.clone().startOf("days"),"days")>0) {
            objDate=objStart.clone().set({
                hour:23,
                minute:59
            })
        }
        event.endDate.day=objDate.date()
        event.endDate.hour=objDate.hour()
        event.endDate.minute=objDate.minute()
    }
    adjustEventMove(event:IClient_Calendar_Info, startDateOrigin:IClient_Calendar_Date, endDateOrigin:IClient_Calendar_Date, newDayIndex:number, offset:number) {
        offset=Math.ceil(offset/15)*15
        let newDay=this.dateRange.value[0].clone().add(newDayIndex,"day").date()
        let startDate=JSON.parse(JSON.stringify(startDateOrigin))
        let endDate=JSON.parse(JSON.stringify(endDateOrigin))
        let objDate=this.generateDateObjByDate(startDate,endDate)
        objDate.startDate.set({
            date:newDay
        })
        objDate.startDate.add(offset,"minutes")
        if(objDate.startDate.date()!=startDateOrigin.day && newDay!=objDate.startDate.date()) {
            objDate.startDate.set({
                date:startDateOrigin.day,
                hour:0,
                minute:0
            })
        }
        event.startDate.day=objDate.startDate.date()
        event.startDate.hour=objDate.startDate.hour()
        event.startDate.minute=objDate.startDate.minute()
        objDate.endDate.set({
            date:newDay
        })
        objDate.endDate.add(offset+1,"minutes")
        if(objDate.endDate.date()!=startDateOrigin.day && (objDate.endDate.minute()!=0 || objDate.endDate.hour()!=0) && newDay!=objDate.endDate.date()) {
            objDate.endDate.set({
                hour:0,
                minute:0
            })
        }
        event.endDate.day=objDate.endDate.date()
        event.endDate.hour=objDate.endDate.hour()
        event.endDate.minute=objDate.endDate.minute()
    }
    adjustEventMoveByMonth(event:IClient_Calendar_Info, indexOriginList:[number,number,number], startDateOrigin:IClient_Calendar_Date, endDateOrigin:IClient_Calendar_Date, newDayIndex:number, weekRow:number) {
        let index=weekRow*7+newDayIndex
        let indexOrigin=indexOriginList[0]*7+indexOriginList[1]
        let offset=index-indexOrigin
        let objDate=this.generateDateObjByDate(startDateOrigin,endDateOrigin)
        objDate.startDate.add(offset,"days")
        objDate.endDate.add(offset,"days")
        event.startDate.year=objDate.startDate.year()
        event.startDate.month=objDate.startDate.month()+1
        event.startDate.day=objDate.startDate.date()
        event.endDate.year=objDate.endDate.year()
        event.endDate.month=objDate.endDate.month()+1
        event.endDate.day=objDate.endDate.date()
    }
    private findAvailableCrossRange(event:IClient_Calendar_Info):{
        start:[number,number],
        end:[number,number]
    } {
        let [startIndex,endIndex]=this.calculateStartAndEndIndex(event,this.dateRange.value[0],this.dateRange.value[1])
        for(let i=0;i<this.arrCross.value.length;i++) {
            let row=this.arrCross.value[i]
            let isFill=false
            for(let i=startIndex;i<=endIndex;i++) {
                if(row[i]) {
                    isFill=true
                    break
                }
            }
            if(!isFill) {
                return {
                    start:[i,startIndex],
                    end:[i,endIndex]
                }
            }
        }
    }
    private fillCrossRange(event:IClient_Calendar_Info, range:{
        start:[number,number],
        end:[number,number]
    }) {
        let row=this.arrCross.value[range.start[0]]
        for(let i=range.start[1];i<=range.end[1] && i<row.length;i++) {
            row[i]=event
        }
    }
    private findAvailableRange(event:IClient_Calendar_Info):{
        start:[number,number,number],
        end:[number,number,number]
    } {
        let objDate=this.generateDateObj(event)
        let index=this.calculateStartDayIndex(objDate.startDate)
        let startRow=objDate.startDate.hour()*60+objDate.startDate.minute()
        let endRow=objDate.endDate.hour()*60+objDate.endDate.minute()
        for(let i=0;i<this.arr.value[index].length;i++) {
            let col=this.arr.value[index][i]
            let isFill=false
            for(let i=startRow;i<=endRow;i++) {
                if(col[i]) {
                    isFill=true
                }
            }
            if(!isFill) {
                return {
                    start:[index,i,startRow],
                    end:[index,i,endRow]
                }
            }
        }
    }
    private generateDateObj(event:IClient_Calendar_Info):{
        startDate:moment.Moment
        endDate:moment.Moment
    } {
        let objStart=moment().tz(this.timeZone)
        objStart.set({
            year:event.startDate.year,
            month:event.startDate.month-1,
            date:event.startDate.day,
            hour:event.startDate.hour,
            minute:event.startDate.minute
        })
        let objEnd=moment().tz(this.timeZone)
        objEnd.set({
            year:event.endDate.year,
            month:event.endDate.month-1,
            date:event.endDate.day,
            hour:event.endDate.hour,
            minute:event.endDate.minute
        })
        objEnd.subtract(1,"minutes")
        return {
            startDate:objStart,
            endDate:objEnd
        }
    }
    private generateDateObjByDate(startDate:IClient_Calendar_Date, endDate:IClient_Calendar_Date):{
        startDate:moment.Moment
        endDate:moment.Moment
    } {
        let objStart=moment().tz(this.timeZone)
        objStart.set({
            year:startDate.year,
            month:startDate.month-1,
            date:startDate.day,
            hour:startDate.hour,
            minute:startDate.minute
        })
        let objEnd=moment().tz(this.timeZone)
        objEnd.set({
            year:endDate.year,
            month:endDate.month-1,
            date:endDate.day,
            hour:endDate.hour,
            minute:endDate.minute
        })
        objEnd.subtract(1,"minutes")
        return {
            startDate:objStart,
            endDate:objEnd
        }
    }
    private pushColumn(indexDay:number) {
        this.arr.value[indexDay].push([])
        for(let i=0;i<60*24;i++) {
            this.arr.value[indexDay][this.arr.value[indexDay].length-1].push(null)
        }
    }
    private pushCrossRow() {
        this.arrCross.value.push([])
        let count=this.dateRange.value[1].diff(this.dateRange.value[0].clone().startOf("days"),"days")
        for(let i=0;i<=count;i++) {
            this.arrCross.value[this.arrCross.value.length-1].push(null)
        }
    }
    private unshiftColumn(indexDay:number) {
        this.arr.value[indexDay].unshift([])
        for(let i=0;i<60*24;i++) {
            this.arr.value[indexDay][0].push(null)
        }
    }
    getEventFromPosition(position:[number,number,number]) {
        return this.arr.value[position[0]][position[1]][position[2]]
    }
    getEventListFromDay(weekRow:number,dayIndex:number) {
        let arr=this.arr.value[weekRow][dayIndex]
        let eventList:IClient_Calendar_Info[]=[]
        arr.forEach(value => {
            if(value) {
                eventList.push(value)
            }
        })
        return eventList;
    }
}