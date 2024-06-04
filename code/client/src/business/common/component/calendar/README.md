<h1 align="center">
TLCalendar
</h1>
<p align="center">
A simple calendar component based on <b>vue3</b> and <b>typescript</b>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/tlcalendar">
    <img src="https://flat.badgen.net/npm/v/tlcalendar?icon=npm" alt="npm"/>
  </a>
  <a href="https://www.npmjs.com/package/tlcalendar">
    <img src="https://flat.badgen.net/bundlephobia/minzip/tlcalendar?color=green" alt="Minzipped size"/>
  </a>
</p>

## About
It is an open-source calendar of [Teamlinker](https://team-linker.com). It provides a variety of features to help users to build their own calendar components like these below:

![](https://team-linker.com/assets/exampleCalendar2-92024062.png)
![](https://team-linker.com/assets/exampleCalendar1-c0bf9528.png)

## Features
1. Customize the calendar event show dialog
2. Switch between day,week and month
3. Support timezone switch
4. Calendar event freely drag and move
5. Support cross-day event and all-day event
6. Support multiply calendars


## Demo
[Teamlinker](https://team-linker.com)

Teamlinker provides a full experience of this package.Have a try!

## Installation
```shell
npm i tlcalendar
```
## Usage

### Global
main.ts
```typescript
import Calendar from "tlcalendar"
import "tlcalendar/style.css"

app.use(Calendar)
```
.vue
```vue
<script setup lang="ts">
import {computed, ref} from "vue";
import moment from "moment";
import "moment-timezone"
const startDay=ref(moment().startOf("weeks").format("YYYY-MM-DD"))
const endDay=ref(moment().endOf("weeks").format("YYYY-MM-DD"))
const month=ref(moment().format("YYYY-MM"))
const timezone=moment.tz.guess(true)
const content=ref([])
</script>

<template>
	<div style="width: 600px;height: 800px">
			<TLCalendar mode="day" :start-date="startDay" :end-date="endDay" :month="month" :event-list="[]" :utc-offset="8" :time-zone="timezone"></TLCalendar>
	</div>
</template>
```

### Sfc
.vue
```vue
<script setup lang="ts">

	import {computed, ref} from "vue";
	import moment from "moment";
	import "moment-timezone"
	import {TLCalendar} from "tlcalendar";
	import "tlcalendar/style.css"
	const startDay=ref(moment().startOf("weeks").format("YYYY-MM-DD"))
	const endDay=ref(moment().endOf("weeks").format("YYYY-MM-DD"))
	const month=ref(moment().format("YYYY-MM"))
	const timezone=moment.tz.guess(true)
</script>

<template>
	<div style="width: 600px;height: 800px">
		<TLCalendar mode="day" :start-date="startDay" :end-date="endDay" :month="month" :event-list="[]" :utc-offset="8" :time-zone="timezone"></TLCalendar>
	</div>
</template>
```

## Customization
### Props
```typescript
eventList: {
    type: PropType<IClient_Calendar_Info[]>;
    required: true;
};
startDate: {
    type: PropType<string>;
};
endDate: {
    type: PropType<string>;
};
mode: {
    type: PropType<"day" | "month">;
    required: true;
};
month: {
    type: PropType<string>;
};
utcOffset: {
    type: PropType<number>;
};
timeZone: {
    type: PropType<string>;
    required: true;
};
```

### emits
```typescript
changeEventDate: (event: IClient_Calendar_Info, originalDateRange: {
        start: IClient_Calendar_Date;
        end: IClient_Calendar_Date;
    }, type: "resize" | "move") => void;
//when user drag event or adjust event ,this event will be triggered
blankClick: (date: moment_2.Moment, point: {
        x: number;
        y: number;
    }) => void;
//when user click blank area of calendar,this event will be triggered
```

### Slots
```vue
<template #shortView="{timeZone,selectedEvent,maskInfoTop,maskInfoLeft,onClose}">
</template>
```

## About Teamlinker
Teamlinker is a cooperation platform that integrates different kind of modules.You can contact your teammates,assign your tasks,start a meeting,schedule your events,manage your files and so on with Teamlinker.
