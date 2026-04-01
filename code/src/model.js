import * as yup from 'yup'
import { normalizeUrl } from './rss.js'
export default class Model {
  constructor() {
    this.feedUrls = new Set()
    this.trackedFeeds = []
    this.viewedPostLinks = new Set()
    this.postsByLink = new Map()
  }

  buildSchema(i18n) {
    return yup.string().trim().required().url().test(
      'unique',
      () => i18n.t('errors.duplicate'),
      (value) => {
        if (!value) {
          return true
        }
        return !this.feedUrls.has(normalizeUrl(value))
      },
    )
  }

  addFeed(normalizedUrl, posts) {
    this.feedUrls.add(normalizedUrl)
    this.trackedFeeds.push({
      url: normalizedUrl,
      postLinks: new Set(posts.map(post => post.link)),
    })
    posts.forEach((post) => {
      this.postsByLink.set(post.link, post)
    })
  }

  mergePostsFromPoll(url, postsFromFeed) {
    const tracked = this.trackedFeeds.find(item => item.url === url)
    if (!tracked) {
      return false
    }
    let changed = false
    postsFromFeed.forEach((post) => {
      if (!tracked.postLinks.has(post.link)) {
        tracked.postLinks.add(post.link)
        this.postsByLink.set(post.link, post)
        changed = true
      }
    })
    return changed
  }

  getTrackedFeedUrls() {
    return this.trackedFeeds.map(item => item.url)
  }

  markPostViewed(link) {
    this.viewedPostLinks.add(link)
  }

  getPostByLink(link) {
    return this.postsByLink.get(link)
  }

  getPostsSnapshot() {
    return {
      postsByLink: this.postsByLink,
      viewedPostLinks: this.viewedPostLinks,
    }
  }
}
