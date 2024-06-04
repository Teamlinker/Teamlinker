import { App } from 'vue';
import { ComponentOptionsMixin } from 'vue';
import { default as default_2 } from 'moment';
import { DefineComponent } from 'vue';
import { ExtractPropTypes } from 'vue';
import { PropType } from 'vue';
import { PublicProps } from 'vue';

declare type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;

declare type __VLS_TypePropsToRuntimeProps<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? {
        type: PropType<__VLS_NonUndefinedable<T[K]>>;
    } : {
        type: PropType<T[K]>;
        required: true;
    };
};

declare type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};

declare interface IClient_Calendar_Date {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
}

declare interface IClient_Calendar_Info {
    id: string;
    name: string;
    startDate: IClient_Calendar_Date;
    endDate: IClient_Calendar_Date;
    isAllDay: boolean;
    color: string;
    resource: {
        id: string;
        name: string;
    };
    reminder?: number;
    created_by: any;
    fixed: boolean;
    extra?: any;
}

declare const root: {
    install(app: App, options: any): void;
};
export default root;

export declare const TLCalendar: __VLS_WithTemplateSlots<DefineComponent<__VLS_TypePropsToRuntimeProps<{
eventList: IClient_Calendar_Info[];
startDate?: string;
endDate?: string;
mode: "day" | "month";
month?: string;
utcOffset?: number;
timeZone: string;
}>, {}, unknown, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {
changeEventDate: (event: IClient_Calendar_Info, originalDateRange: {
start: IClient_Calendar_Date;
end: IClient_Calendar_Date;
}, type: "resize" | "move") => void;
blankClick: (date: default_2.Moment, point: {
x: number;
y: number;
}) => void;
}, string, PublicProps, Readonly<ExtractPropTypes<__VLS_TypePropsToRuntimeProps<{
eventList: IClient_Calendar_Info[];
startDate?: string;
endDate?: string;
mode: "day" | "month";
month?: string;
utcOffset?: number;
timeZone: string;
}>>> & {
onChangeEventDate?: (event: IClient_Calendar_Info, originalDateRange: {
start: IClient_Calendar_Date;
end: IClient_Calendar_Date;
}, type: "resize" | "move") => any;
onBlankClick?: (date: default_2.Moment, point: {
x: number;
y: number;
}) => any;
}, {}, {}>, {
    shortView?(_: {
        timeZone: string;
        selectedEvent: IClient_Calendar_Info;
        maskInfoTop: string;
        maskInfoLeft: string;
        onClose: () => void;
    }): any;
}>;

export { }
