// 处理文章的tag标记
import { MDCList } from '@material/list'
import { MDCDialog } from '@material/dialog'
import { MDCLinearProgress } from '@material/linear-progress'

import { MDCRipple } from '@material/ripple'

const POST_TYPE_ORIGINAL = ["original", "随笔"]
const POST_TYPE_REPOST = ["repost", "转载"]
const POST_TYPE_POETRY = ["poetry", "诗文"]
const POST_TYPE_OPERA = ["opera", "看剧"]

/**
 * 在archive/tag/index.html保存着所有tag和每一个tag对应文章的列表，只请求一次
 */
var postJson = null

var tagDialog = null
var tagDialogProgressbar = null
var tagEssayList = null

if (document.readyState !== 'loading') {
    runOnStart()
} else {
    // HTML元素加载完成，但是CSS等资源还未加载
    document.addEventListener('DOMContentLoaded', (event) => {
        runOnStart()
    })
}

function runOnStart() {
    initTagTriggers()
}

/**
 * 初始化tag的点击事件
 */
function initTagTriggers() {
    // tag对应的Dialog
    // 获取每一个标记了tag-dialog-trigger的element，查找这个trigger对应的dialog，监听点击事件，弹出dialog
    // 所有tag共用一个dialog
    var dialogsTriggers = document.querySelectorAll('.tag-dialog-trigger')

    // 为每一个tag添加点击监听
    for (var triger of dialogsTriggers) {
        // 获取每一个triger的id，找到它对应的dialogId，和dialog里的listId
        console.log(triger.id)
        // 监听trigger的点击事件
        triger.addEventListener("click", clickTag)
    }
}

function clickTag() {
    // TODO: 为什么使用event.target.id不可以？？
    var chipId = this.id
    // chip_tag_随笔 dialog_tag_随笔 dialog_tag_list_随笔
    // chip_tag_碎碎念&看剧 可以指定多个tag，用 & 分隔
    console.log("click tag " + chipId)
    var dialogId = "chip_tag_dialog"
    var listId = "chip_tag_essay_list"
    var progressId = "chip_tag_dialog_progress"
    var btnId = "chip_tag_dialog_btn"
    // 这里的tag可能是由&连接的多个tag
    var tag = chipId.replace("chip_tag_", "")
    var postType = getPostType()

    var dialogE = document.getElementById(dialogId)
    if (dialogE == null) {
        console.log("create tag dialog")
        dialogE = generateTagDialog(tag, dialogId, listId, btnId, progressId, postType)
        // 把生成的Dialog插入到指定位置
        document.getElementById("tag_dialog_container").appendChild(dialogE)
        // Button动画
        new MDCRipple(document.getElementById(btnId))
        tagDialog = new MDCDialog(dialogE)
        tagDialogProgressbar = new MDCLinearProgress(document.getElementById(progressId))
        tagDialogProgressbar.determinate = false
        tagDialogProgressbar.close()
        var listEl = document.getElementById(listId)
        tagEssayList = new MDCList(listEl)
        // 监听dialog的弹出事件
        tagDialog.listen('MDCDialog:opened', () => {
            console.log("tag dialog opened")
            // list.layout()
            // Dialog弹出时似乎List获取了焦点，应该取消
            // 先让Button获取焦点再取消，以转移焦点
            document.getElementById(btnId).focus()
            document.getElementById(btnId).blur()
        })
        // 点击列表中的item后，关闭Dialog
        tagEssayList.listen('MDCList:action', () => {
            console.log("click tagList item")
            // dialog.close()
        })
    }
    tagDialog.open()
    // 修改dialog标题tag
    document.getElementById("tag-dialog-tag-name").innerHTML = "#" + tag

    // 只在无数据时请求
    if (postJson != null) {
        showTagItemList(postJson, tag, listId, postType)
    } else {
        queryTagItemList(tag, listId, postType, tagDialogProgressbar)
    }
}

function getPostType() {
    if (window.location.href.includes("/" + POST_TYPE_ORIGINAL[0] + "/")) {
        return POST_TYPE_ORIGINAL
    } else if (window.location.href.includes("/" + POST_TYPE_REPOST[0] + "/")) {
        return POST_TYPE_REPOST
    } else if (window.location.href.includes("/" + POST_TYPE_POETRY[0] + "/")) {
        return POST_TYPE_POETRY
    } else if (window.location.href.includes("/" + POST_TYPE_OPERA[0] + "/")) {
        return POST_TYPE_OPERA
    } else {
        return ["", ""]
    }
}

// 生成Dialog
function generateTagDialog(tag, dialogId, listId, btnId, progressId, postType) {
    /*
    <div class="mdc-dialog" id="dialog_tag_昆曲">
        <div class="mdc-dialog__container">
            <!-- 加上width500px后满足要求 -->
            <div class="mdc-dialog__surface common-dialog-container" role="alertdialog" aria-modal="true"
                aria-labelledby="tag-dialog-title" aria-describedby="tag-dialog-content">
            
                <div class="mdc-dialog__content" id="tag-dialog-content">
                    <p class="mdc-theme--on-surface">标记TAG <code id="tag-dialog-tag-name" class="language-plaintext highlighter-rouge">#AirPlay</code>的<span>博文</span></p>

                    <!-- 进度条 -->
                    <div role="progressbar" class="mdc-linear-progress" aria-label="Example Progress Bar" aria-valuemin="0"
                        aria-valuemax="1" aria-valuenow="0" id="dialog_tag_progress_AirPlay">
                        <div class="mdc-linear-progress__buffer">
                            <div class="mdc-linear-progress__buffer-bar"></div>
                            <div class="mdc-linear-progress__buffer-dots"></div>
                        </div>
                        <div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
                            <span class="mdc-linear-progress__bar-inner"></span>
                        </div>
                        <div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
                            <span class="mdc-linear-progress__bar-inner"></span>
                        </div>
                    </div>

                    <ul class="mdc-deprecated-list mdc-deprecated-list--two-line dialog-link-list"
                      id="dialog_tag_list_AirPlay">
                      <a class="mdc-deprecated-list-item" href="/post/original/2021/08/15/%E6%A0%91%E8%8E%93%E6%B4%BE%E7%9A%84%E5%88%9D%E5%A7%8B%E5%8C%96%E4%B8%8EAirPlay.html">
                        <span class="mdc-deprecated-list-item__ripple"></span>
                        <span class="mdc-deprecated-list-item__text">
                          <span class="mdc-deprecated-list-item__primary-text">树莓派的初始化与AirPlay</span>
                          <span class="mdc-deprecated-list-item__secondary-text">2021.08.15
                          </span>
                        </span>
                      </a>
                    </ul>
                </div>

                <div class="mdc-dialog__actions">
                  <button type="button" class="mdc-button btn-common mdc-button--unelevated center-horizontal"
                    style="width: 94%; margin-bottom: 1rem;" data-mdc-dialog-action="cancel"
                    id="btn_tag_dialog_close_刺虎">
                    <div class="mdc-button__ripple"></div>
                    <span class="mdc-button__label">CLOSE</span>
                  </button>
                </div>

            </div>
        </div>
        <div class="mdc-dialog__scrim"></div>
    </div>
    */
    var divDialog = document.createElement("div")
    divDialog.setAttribute("class", "mdc-dialog")
    divDialog.setAttribute("id", dialogId)
    var divDialogContainer = document.createElement("div")
    divDialogContainer.setAttribute("class", "mdc-dialog__container")
    divDialog.appendChild(divDialogContainer)


    var divDialogSurface = document.createElement("div")
    divDialogSurface.setAttribute("class", "mdc-dialog__surface common-dialog-container")
    divDialogSurface.setAttribute("role", "alertdialog")
    divDialogSurface.setAttribute("aria-modal", "true")
    divDialogSurface.setAttribute("aria-labelledby", "tag-dialog-title")
    divDialogSurface.setAttribute("aria-describedby", "tag-dialog-content")
    divDialogContainer.appendChild(divDialogSurface)

    var divDialogContent = document.createElement("div")
    divDialogContent.setAttribute("class", "mdc-dialog__content")
    divDialogContent.setAttribute("id", "tag-dialog-content")
    var pTitle = document.createElement("p")
    pTitle.setAttribute("class", "mdc-theme--on-surface")
    pTitle.innerHTML = "标记TAG <code id=\"tag-dialog-tag-name\" class=\"language-plaintext highlighter-rouge\">#" + tag + "</code> 的<span>文章</span>"
    divDialogContent.appendChild(pTitle)

    var divProgressbar = generateProgressbar(progressId)
    divDialogContent.appendChild(divProgressbar)

    var ulList = document.createElement("ul")
    ulList.setAttribute("class", "mdc-deprecated-list dialog-link-list")
    ulList.setAttribute("id", listId)
    divDialogContent.appendChild(ulList)
    divDialogSurface.appendChild(divDialogContent)

    var divActions = document.createElement("div")
    divActions.setAttribute("class", "mdc-dialog__actions")
    var btnClose = document.createElement("button")
    btnClose.setAttribute("type", "button")
    btnClose.setAttribute("class", "mdc-button btn-common mdc-button--unelevated center-horizontal")
    btnClose.setAttribute("style", "width: 94%; margin-bottom: 1rem;")
    btnClose.setAttribute("data-mdc-dialog-action", "cancel")
    btnClose.setAttribute("id", btnId)
    var divBtnCloseRipple = document.createElement("div")
    divBtnCloseRipple.setAttribute("class", "mdc-button__ripple")
    btnClose.appendChild(divBtnCloseRipple)
    var spanBtnClose = document.createElement("span")
    spanBtnClose.setAttribute("class", "mdc-button__label")
    spanBtnClose.innerHTML = "CLOSE"
    btnClose.appendChild(spanBtnClose)

    divActions.appendChild(btnClose)
    divDialogSurface.appendChild(divActions)

    var divScrim = document.createElement("div")
    divScrim.setAttribute("class", "mdc-dialog__scrim")
    divDialog.appendChild(divScrim)

    return divDialog
}

function generateProgressbar(progressId) {
    var divProgressbar = document.createElement("div")
    divProgressbar.setAttribute("role", "progressbar")
    divProgressbar.setAttribute("class", "mdc-linear-progress")
    divProgressbar.setAttribute("aria-label", "Example Progress Bar")
    divProgressbar.setAttribute("aria-valuemin", "0")
    divProgressbar.setAttribute("aria-valuemax", "1")
    divProgressbar.setAttribute("aria-valuenow", "0")
    divProgressbar.setAttribute("id", progressId)
    var divProgressbarBuffer = document.createElement("div")
    divProgressbarBuffer.setAttribute("class", "mdc-linear-progress__buffer")
    var divProgressbarBufferBar = document.createElement("div")
    divProgressbarBufferBar.setAttribute("class", "mdc-linear-progress__buffer-bar")
    divProgressbarBuffer.appendChild(divProgressbarBufferBar)
    var divProgressbarBufferDots = document.createElement("div")
    divProgressbarBufferDots.setAttribute("class", "mdc-linear-progress__buffer-dots")
    divProgressbarBuffer.appendChild(divProgressbarBufferDots)
    divProgressbar.appendChild(divProgressbarBuffer)

    var divProgressbarPrimary = document.createElement("div")
    divProgressbarPrimary.setAttribute("class", "mdc-linear-progress__bar mdc-linear-progress__primary-bar")
    var spanProgressbarPrimary = document.createElement("span")
    spanProgressbarPrimary.setAttribute("class", "mdc-linear-progress__bar-inner")
    divProgressbarPrimary.appendChild(spanProgressbarPrimary)
    divProgressbar.appendChild(divProgressbarPrimary)

    var divProgressbarSecondary = document.createElement("div")
    divProgressbarSecondary.setAttribute("class", "mdc-linear-progress__bar mdc-linear-progress__secondary-bar")
    var spanProgressbarSecondary = document.createElement("span")
    spanProgressbarSecondary.setAttribute("class", "mdc-linear-progress__bar-inner")
    divProgressbarSecondary.appendChild(spanProgressbarSecondary)
    divProgressbar.appendChild(divProgressbarSecondary)
    return divProgressbar
}

/**
 * 
 * @param {*} tag 未处理的标签，url种的tag需要进行一些处理：小写，部分字符用 - 代替
 * @param {*} listId 要填充的列表id
 * @param {*} postType 文章类型：original, repost, poetry, opera
 */
function queryTagItemList(tag, listId, postType, progressbar) {
    var host = window.location.host
    if (!host.includes("apqx.me")) {
        host = "http://" + host
    } else {
        host = "https://" + host
    }
    var url = host + "/archive/posts/index.html"
    console.log("queryTagItemList " + url)
    const request = new Request(url, {
        method: 'GET'
    })
    progressbar.open()
    fetch(request)
        .then(response => {
            if (response.status === 200) {
                return response.text()
            } else {
                throw new Error('Something went wrong on api server!')
            }
        })
        .then(response => {
            console.debug(response)
            progressbar.close()
            postJson = JSON.parse(response)
            showTagItemList(postJson, tag, listId, postType)
        }).catch(error => {
            console.error(error)
            progressbar.close()
        })
}

function showTagItemList(postJson, tag, listId, postType) {
    var ulList = document.getElementById(listId)
    // 删除所有子item，重新填充
    while (ulList.firstChild) {
        ulList.removeChild(ulList.lastChild)
    }
    var firstItem = true
    var posts = findPost(tag, postJson)
    for (var post of posts) {
        var itemPostType
        if (post.type == POST_TYPE_ORIGINAL[0]) {
            itemPostType = POST_TYPE_ORIGINAL
        } else if (post.type == POST_TYPE_REPOST[0]) {
            itemPostType = POST_TYPE_REPOST
        } else if (post.type == POST_TYPE_POETRY[0]) {
            itemPostType = POST_TYPE_POETRY
        } else if (post.type == POST_TYPE_OPERA[0]) {
            itemPostType = POST_TYPE_OPERA
        } else {
            itemPostType = ["", "未知"]
        }

        var author = post.author
        var mention = post.mention.split(" ")

        // 除第一个外，每一个item之前都要添加divider分割线
        if (firstItem) {
            firstItem = false
            // 列表滚动到顶部，执行一次即可
            document.getElementById("tag-dialog-content").scrollIntoView()
        } else {
            ulList.appendChild(generateDivider())
        }
        ulList.appendChild(generateItem(post, itemPostType, author, mention))
    }
    // List的点击动画
    tagEssayList.listElements.map((listItemEl) => new MDCRipple(listItemEl))

}

/**
 * 
 * @param {string} tags 
 * @param {string} postJson 
 * @returns tagItem数组
 */
function findPost(tags, postJson) {
    var tagArray = tags.split("&")
    var resultArray = []
    for (const post of postJson.posts) {
        var postTags = post.tag.split(",")
        var hasBothTag = true
        for (const tag of tagArray) {
            if (!postTags.includes(tag)) {
                hasBothTag = false
                break
            }
        }
        if (hasBothTag) {
            resultArray.push(post)
        }
    }
    console.log("find post with tag " + tagArray + ", result size is " + resultArray.length)
    return resultArray
}

function generateDivider() {
    // <hr class="mdc-deprecated-list-divider"></hr>
    var hr = document.createElement("hr")
    hr.setAttribute("class", "mdc-deprecated-list-divider")
    return hr
}

/**
 * 
 * @param {string} item 
 * @param {Array} itemPostType 
 * @param {string} author 文章作者
 * @param {Array} mentions 文章提及的其他内容
 * @returns 
 */
function generateItem(item, itemPostType, author, mentions) {
    var a = document.createElement("a")
    a.setAttribute("class", "mdc-deprecated-list-item tag-list-item")
    a.setAttribute("href", item.url)
    var spanRipple = document.createElement("span")
    spanRipple.setAttribute("class", "mdc-deprecated-list-item__ripple")
    a.appendChild(spanRipple)

    var spanText = document.createElement("span")
    spanText.setAttribute("class", "mdc-deprecated-list-item__text")
    var spanTextPrimary = document.createElement("span")
    spanTextPrimary.setAttribute("class", "my-list-item__primary-text")
    spanTextPrimary.innerHTML = item.title
    spanText.appendChild(spanTextPrimary)
    var spanTextSecondary = document.createElement("div")
    spanTextSecondary.setAttribute("class", "my-list-item__secondary-text")

    var spanTextDate = document.createElement("span")
    spanTextDate.innerHTML = item.date + " "
    spanTextSecondary.appendChild(spanTextDate)

    var divTags = document.createElement("span")
    divTags.setAttribute("class", "tag-essay-item-tags-container")



    var spanTextPostType = document.createElement("span")
    spanTextPostType.setAttribute("class", "tag-essay-item-post-type")
    spanTextPostType.innerHTML = itemPostType[1]
    divTags.appendChild(spanTextPostType)

    if (itemPostType != POST_TYPE_ORIGINAL && itemPostType != POST_TYPE_OPERA) {
        // 非随笔、看剧，显示作者，因为这两个板块的作者就是我，没必要显示
        var spanTextPostAuthor = document.createElement("span")
        spanTextPostAuthor.setAttribute("class", "tag-essay-item-post-author")
        spanTextPostAuthor.innerHTML = author
        divTags.appendChild(spanTextPostAuthor)
    }
    if (mentions.length > 0) {
        // 如果有提及的mention，显示mention
        for (var mention of mentions) {
            if (mention == "") continue
            var spanTextPostActor = document.createElement("span")
            spanTextPostActor.setAttribute("class", "tag-essay-item-post-mention")
            spanTextPostActor.innerHTML = mention
            divTags.appendChild(spanTextPostActor)
        }
    }

    spanTextSecondary.appendChild(divTags)

    spanText.appendChild(spanTextSecondary)

    a.appendChild(spanText)

    return a
}

