import { Modal } from 'bootstrap'
import { loadRss, normalizeUrl } from './rss.js'

export default class Controller {
  constructor(model, view, i18n) {
    this.model = model
    this.view = view
    this.i18n = i18n
    this.schema = model.buildSchema(i18n)
    this.modal = null
  }

  start() {
    this.modal = new Modal(this.view.getModalRoot())
    this.view.form.addEventListener('submit', (event) => {
      this.handleSubmit(event)
    })
    this.view.getPostsListElement().addEventListener('click', (event) => {
      this.handlePostListClick(event)
    })
    this.schedulePolling()
  }

  schedulePolling() {
    const tick = async () => {
      await this.pollAllFeeds()
      setTimeout(tick, 5000)
    }
    setTimeout(tick, 5000)
  }

  async pollAllFeeds() {
    const urls = this.model.getTrackedFeedUrls()
    const tasks = urls.map(async (url) => {
      try {
        const { posts } = await loadRss(url)
        const changed = this.model.mergePostsFromPoll(url, posts)
        if (changed) {
          const snapshot = this.model.getPostsSnapshot()
          this.view.renderPosts(snapshot.postsByLink, snapshot.viewedPostLinks)
        }
      }
      catch {
        // ignore polling errors
      }
    })
    await Promise.allSettled(tasks)
  }

  async handleSubmit(event) {
    event.preventDefault()
    const rawUrl = this.view.urlInput.value.trim()
    try {
      await this.schema.validate(rawUrl)
      const normalizedUrl = normalizeUrl(rawUrl)
      const { feed, posts } = await loadRss(rawUrl)
      this.model.addFeed(normalizedUrl, posts)
      this.view.setSuccessFeedback(this.i18n.t('ui.success'))
      this.view.renderFeed(feed)
      const snapshot = this.model.getPostsSnapshot()
      this.view.renderPosts(snapshot.postsByLink, snapshot.viewedPostLinks)
      this.view.resetForm()
      this.view.focusUrlInput()
    }
    catch (error) {
      if (error.name === 'ValidationError') {
        this.view.setInputInvalid(error.message)
        return
      }
      if (error.message === 'network' || error.message === 'invalidRss') {
        this.view.setInputInvalid(this.i18n.t(`errors.${error.message}`))
        return
      }
      this.view.setInputInvalid(this.i18n.t('errors.network'))
    }
  }

  handlePostListClick(event) {
    const previewButton = event.target.closest('button[data-link]')
    if (!previewButton) {
      return
    }
    const link = previewButton.dataset.link
    const post = this.model.getPostByLink(link)
    if (!post) {
      return
    }
    this.model.markPostViewed(link)
    const snapshot = this.model.getPostsSnapshot()
    this.view.renderPosts(snapshot.postsByLink, snapshot.viewedPostLinks)
    this.view.fillModal(post)
    this.modal.show()
  }
}
