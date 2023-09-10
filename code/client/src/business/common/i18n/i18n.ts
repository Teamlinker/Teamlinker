import en from "../../../../../common/i18n/en"
import {createI18n} from "vue-i18n";
import zh from "../../../../../common/i18n/zh";

const messages={
    en,
    zh
}

const language=(navigator.language || "en").toLowerCase()
const i18n=createI18n({
    legacy:false,
    locale:localStorage.getItem("lang") || language.split("-")[0] || "en",
    fallbackLocale:"en",
    messages
})

export default i18n