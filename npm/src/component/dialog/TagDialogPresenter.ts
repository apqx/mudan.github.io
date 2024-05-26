import { TagDialog, PostItemData } from "./TagDialog"
import { consoleDebug, consoleError } from "../../util/log"
import { isDebug } from "../../util/tools"
import { POST_TYPE_OPERA, POST_TYPE_ORIGINAL, POST_TYPE_POETRY, POST_TYPE_REPOST, PostType } from "../../base/constant"

/**
 * 在archives/posts.txt保存着所有文章及对应tag的列表，只请求一次
 */
let postList: PostItem[] = null

interface PostsJson {
    posts: PostItem[]
}

class PostItem {
    title: string
    date: string
    url: string
    author: string
    actor: string
    mention: string
    tag: string
    categories: string

    constructor(title: string,
        date: string,
        url: string,
        author: string,
        actor: string,
        mention: string,
        tag: string,
        categories: string) {
        this.title = title
        this.date = date
        this.url = url
        this.author = author
        this.actor = actor
        this.mention = mention
        this.tag = tag
        this.categories = categories
    }
}

export class TagDialogPresenter {

    component: TagDialog = null
    abortController: AbortController = null

    constructor(component: TagDialog) {
        this.component = component
    }

    findTaggedEssays(tag: string) {
        this.component.setState({
            loading: true,
            // essayList: []
        })
        consoleDebug("FindTaggedEssays " + tag)
        if (postList != null) {
            // 使用本页缓存，避免同一页面下的重复请求
            this.showTagItemList(postList, tag)
            return
        }
        let url: string
        if (isDebug()) {
            url = window.location.origin + "/archives/posts.txt"
        } else {
            url = "https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/archives/posts.txt"
        }
        const request = new Request(url, {
            method: "GET"
        })
        if(this.abortController != null) {
            // 终止之前的任务
            this.abortController.abort()
        }
        this.abortController = new AbortController()
        // 异步请求
        // fetch调用浏览器的网络请求，所以会有和浏览器一样的缓存策略，no-cache会联网检查缓存是否过时，过时则更新缓存，否则使用缓存
        fetch(request, { signal: this.abortController.signal, cache: "no-cache" })
            .then((response: Response) => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    throw new Error("Something went wrong on api server!")
                }
            })
            .then((postsJson: PostsJson) => {
                postList = postsJson.posts
                this.showTagItemList(postList, tag)
            }).catch(error => {
                consoleError(error)
                this.showTagItemList([], tag)
            }
            )
    }

    showTagItemList(postList: PostItem[], tag: string) {
        if(!this.component.mdcDialog.isOpen) {
            consoleDebug("ShowTagItemList, but dialog is closed, no refresh")
            return
        }
        const posts = this.findPost(tag, postList)
        consoleDebug("ShowTagItemList count = " + posts.length)
        const postListForShow: PostItemData[] = []
        for (const post of posts) {
            const postType = this.getPostType(post.categories)
            const blocks = this.getPostBlocks(post.author, post.actor, post.mention, postType)
            const essayForShow = new PostItemData(post.url, post.title, post.date, postType.name,
                blocks[0], blocks[1])
            postListForShow.push(essayForShow)
        }
        this.component.setState({
            loading: false,
            postList: postListForShow
        })
    }

    getPostType(categories: string): PostType {
        if (categories.includes(POST_TYPE_ORIGINAL.identifier)) {
            return POST_TYPE_ORIGINAL
        } else if (categories.includes(POST_TYPE_REPOST.identifier)) {
            return POST_TYPE_REPOST
        } else if (categories.includes(POST_TYPE_POETRY.identifier)) {
            return POST_TYPE_POETRY
        } else if (categories.includes(POST_TYPE_OPERA.identifier)) {
            return POST_TYPE_OPERA
        } else {
            return {
                identifier: "",
                name: "未知"
            }
        }
    }

    /**
     * 获取一个文章要显示的块，包括author作者、actor演员、mention提到
     * 显示，一共就2个block，用不同的颜色区分
     */
    getPostBlocks(author: string, actor: string, mention: string, postType: PostType): [string[], string[]] {
        const actorArray = actor === "" ? [] : actor.split(" ")
        const mentionArray = mention === "" ? [] : mention.split(" ")
        if (postType.identifier === POST_TYPE_ORIGINAL.identifier) {
            // 随笔，不显示author，显示actor和mention
            return [actorArray, mentionArray]
        } else if (postType.identifier === POST_TYPE_OPERA.identifier) {
            // 看剧，显示actor和mention
            return [actorArray, mentionArray]
        } else {
            // 其它类型，显示author和mention
            return [[author], mentionArray]
        }
    }

    findPost(tags: string, postList: PostItem[]): PostItem[] {
        const tagArray = tags.split("&")
        const resultArray = []
        for (const post of postList) {
            const postTags = post.tag.split(",")
            let hasBothTag = true
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
        consoleDebug("Find post with tag " + tagArray + ", result size is " + resultArray.length)
        return resultArray
    }

    abortFetch() {
        if (this.abortController != null)
            this.abortController.abort()
    }
}