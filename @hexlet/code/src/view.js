export default class View {
  constructor(rootElement, i18n) {
    this.root = rootElement;
    this.i18n = i18n;
    this.urlInput = null;
    this.form = null;
    this.feedback = null;
    this.feedsList = null;
    this.postsList = null;
    this.modalElement = null;
    this.modalTitle = null;
    this.modalBody = null;
  }

  mountLayout() {
    this.form = this.root.querySelector('form');
    this.urlInput = this.root.querySelector('#rssUrl');

    this.feedback = document.createElement('div');
    this.feedback.className = 'invalid-feedback';
    this.urlInput.insertAdjacentElement('afterend', this.feedback);

    const feedsContainer = document.createElement('div');
    feedsContainer.className = 'card border-0';
    const feedsTitle = document.createElement('h2');
    feedsTitle.className = 'card-header';
    feedsTitle.textContent = this.i18n.t('ui.feeds');
    this.feedsList = document.createElement('ul');
    this.feedsList.className = 'list-group list-group-flush';
    feedsContainer.append(feedsTitle, this.feedsList);

    const postsContainer = document.createElement('div');
    postsContainer.className = 'card border-0 mt-4';
    const postsTitle = document.createElement('h2');
    postsTitle.className = 'card-header';
    postsTitle.textContent = this.i18n.t('ui.posts');
    this.postsList = document.createElement('ul');
    this.postsList.className = 'list-group list-group-flush';
    postsContainer.append(postsTitle, this.postsList);

    this.root.querySelector('#app').append(feedsContainer, postsContainer);

    this.modalElement = document.createElement('div');
    this.modalElement.className = 'modal fade';
    this.modalElement.tabIndex = -1;
    this.modalElement.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label=""></button>
          </div>
          <div class="modal-body"></div>
          <div class="modal-footer justify-content-between">
            <a class="btn btn-primary" data-role="read-full" href="#" target="_blank" rel="noopener noreferrer"></a>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"></button>
          </div>
        </div>
      </div>
    `;
    document.body.append(this.modalElement);
    this.modalTitle = this.modalElement.querySelector('.modal-title');
    this.modalBody = this.modalElement.querySelector('.modal-body');
    this.modalReadFullLink = this.modalElement.querySelector('[data-role="read-full"]');
    this.modalFooterCloseBtn = this.modalElement.querySelector('.modal-footer .btn-secondary');
    const closeBtn = this.modalElement.querySelector('.modal-header .btn-close');
    closeBtn.setAttribute('aria-label', this.i18n.t('ui.close'));
    this.modalReadFullLink.textContent = this.i18n.t('ui.readFull');
    this.modalFooterCloseBtn.textContent = this.i18n.t('ui.close');
  }

  applyFormTexts() {
    document.title = this.i18n.t('ui.docTitle');
    const heading = this.root.querySelector('[data-role="page-heading"]');
    if (heading) {
      heading.textContent = this.i18n.t('ui.heading');
    }
    const label = this.root.querySelector('label[for="rssUrl"]');
    if (label) {
      label.textContent = this.i18n.t('ui.rssLinkLabel');
    }
    this.urlInput.placeholder = this.i18n.t('ui.rssPlaceholder');
    const submit = this.root.querySelector('button[type="submit"]');
    if (submit) {
      submit.textContent = this.i18n.t('ui.add');
    }
  }

  renderFeed(feed) {
    const feedItem = document.createElement('li');
    feedItem.className = 'list-group-item';

    const feedTitle = document.createElement('h3');
    feedTitle.className = 'h6 mb-1';
    feedTitle.textContent = feed.title;

    const feedDescription = document.createElement('p');
    feedDescription.className = 'mb-0 small text-body-secondary';
    feedDescription.textContent = feed.description;

    feedItem.append(feedTitle, feedDescription);
    this.feedsList.prepend(feedItem);
  }

  renderPosts(postsByLink, viewedPostLinks) {
    this.postsList.innerHTML = '';
    const orderedPosts = Array.from(postsByLink.values()).reverse();

    orderedPosts.forEach((post) => {
      const postItem = document.createElement('li');
      postItem.className = 'list-group-item d-flex justify-content-between align-items-start gap-3';

      const postLink = document.createElement('a');
      postLink.href = post.link;
      postLink.target = '_blank';
      postLink.rel = 'noopener noreferrer';
      postLink.textContent = post.title;
      postLink.className = viewedPostLinks.has(post.link) ? 'fw-normal' : 'fw-bold';

      const previewButton = document.createElement('button');
      previewButton.type = 'button';
      previewButton.className = 'btn btn-outline-primary btn-sm';
      previewButton.dataset.link = post.link;
      previewButton.textContent = this.i18n.t('ui.preview');

      postItem.append(postLink, previewButton);
      this.postsList.append(postItem);
    });
  }

  setInputInvalid(message) {
    this.urlInput.classList.add('is-invalid');
    this.feedback.textContent = message;
  }

  clearInputInvalid() {
    this.urlInput.classList.remove('is-invalid');
    this.feedback.textContent = '';
  }

  focusUrlInput() {
    this.urlInput.focus();
  }

  resetForm() {
    this.form.reset();
  }

  fillModal(post) {
    this.modalTitle.textContent = post.title;
    this.modalBody.textContent = post.description;
    this.modalReadFullLink.href = post.link;
  }

  getModalRoot() {
    return this.modalElement;
  }

  getPostsListElement() {
    return this.postsList;
  }
}
