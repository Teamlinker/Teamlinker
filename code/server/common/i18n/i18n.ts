import * as i18next from "i18next"
import en from "../../../common/i18n/en"
import zh from "../../../common/i18n/zh"

i18next.init({
    fallbackLng:"en",
    resources: {
        en: {
            translation: en
        },
        zh:{
            translation:zh
        }
    }
});