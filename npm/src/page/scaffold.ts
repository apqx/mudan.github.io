// import "./scaffold.scss"
import {runOnHtmlDone, runOnPageBackFromCache, runOnPageDone} from "../util/tools"
import {initTopbar} from "../component/topbar"
import {initDrawer} from "../component/drawer"
import {checkUserTheme, initTheme} from "../component/theme"
import {initLocalRepository} from "../repository/LocalRepository"
import {initHandwritingFont} from "../component/font/font"
import {initFab} from "../component/fab"
import {initTag, initTagTriggers} from "../component/tag"
import {initButton} from "../component/button"
import {initTable} from "../component/table";
import {initList} from "../component/list";
import {initText} from "../component/text";
import {consoleDebug} from "../util/log";
import {loadGoogleAnalytics} from "../util/gtag";

runOnHtmlDone(() => {
    initLocalRepository()
    initHandwritingFont()
    initTopbar()
    initTheme()
    initDrawer()
    initFab()
    // TODO:可选项，懒加载
    initTag()
    initButton()
    initTable()
    initList()
    initText()
    initTagTriggers()
})

runOnPageDone(() => {
        loadGoogleAnalytics()
})

runOnPageBackFromCache(() => {
    checkUserTheme()
})