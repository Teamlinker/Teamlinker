
export enum ECommon_Field_Type {
    SWITCH,
    MULTILABEL,
    LABEL,
    TEXT,
    MULTITEXT,
    SELECT,
    MULTISELECT,
    TIME,
    DATE,
}
export interface ICommon_Field_Type {
    name :string,
    icon :string,
    description :string,
    multi :boolean,
    type:ECommon_Field_Type
}

export const Field_Types:{
    [type in ECommon_Field_Type]:ICommon_Field_Type
}={
    [ECommon_Field_Type.SWITCH]:{
        name :"switch",
        icon :"",
        description :"switch",
        multi :false,
        type:ECommon_Field_Type.SWITCH
    },
    [ECommon_Field_Type.MULTILABEL]:{
        name :"multi label",
        icon :"",
        description :"multi label",
        multi :true,
        type:ECommon_Field_Type.MULTILABEL
    },
    [ECommon_Field_Type.LABEL]:{
        name :"label",
        icon :"",
        description :"label",
        multi :false,
        type:ECommon_Field_Type.LABEL
    },
    [ECommon_Field_Type.TEXT]:{
        name :"text",
        icon :"",
        description :"text",
        multi :false,
        type:ECommon_Field_Type.TEXT
    },
    [ECommon_Field_Type.MULTITEXT]:{
        name :"multi text",
        icon :"",
        description :"multi text",
        multi :false,
        type:ECommon_Field_Type.MULTITEXT
    },
    [ECommon_Field_Type.SELECT]:{
        name :"select",
        icon :"",
        description :"selct",
        multi :false,
        type:ECommon_Field_Type.SELECT
    },
    [ECommon_Field_Type.MULTISELECT]:{
        name :"multi select",
        icon :"",
        description :"multi select",
        multi :true,
        type:ECommon_Field_Type.MULTISELECT
    },
    [ECommon_Field_Type.TIME]:{
        name :"time",
        icon :"",
        description :"time",
        multi :false,
        type:ECommon_Field_Type.TIME
    },
    [ECommon_Field_Type.DATE]:{
        name :"date",
        icon :"",
        description :"date",
        multi :false,
        type:ECommon_Field_Type.DATE
    }
}
