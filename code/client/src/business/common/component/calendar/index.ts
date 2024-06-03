import TLCalendar from "./src/calendar.vue"
import {App} from "vue";

export { TLCalendar };

const  root= {
    install(app:App,options:any) {
        app.component("TLCalendar", TLCalendar);
    },
};

export default root;