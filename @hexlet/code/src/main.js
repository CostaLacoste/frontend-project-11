import './style.css';
import * as yup from 'yup';
import i18next from 'i18next';
import ru from './locales/ru.js';

const form = document.querySelector('form');
const urlInput = document.querySelector('#rssUrl');

const feedback = document.createElement('div');
feedback.className = 'invalid-feedback';
urlInput.insertAdjacentElement('afterend', feedback);

const feedsContainer = document.createElement('div');
feedsContainer.className = 'card border-0';
const feedsTitle = document.createElement('h2');
feedsTitle.className = 'card-header';
const feedsList = document.createElement('ul');
feedsList.className = 'list-group border-0 rounded-0';
feedsContainer.append(feedsTitle, feedsList);

const postsContainer = document.createElement('div');
postsContainer.className = 'card border-0 mt-4';
const postsTitle = document.createElement('h2');
postsTitle.className = 'card-header';
const postsList = document.createElement('ul');
postsList.className = 'list-group border-0 rounded-0';
postsContainer.append(postsTitle, postsList);

const app = document.querySelector('#app');
app.append(feedsContainer, postsContainer);

const existingFeeds = new Set();

const normalizeUrl = (value) => {
  const parsedUrl = new URL(value);
  return parsedUrl.href;
};

const setInvalidState = (message) => {
  urlInput.classList.add('is-invalid');
  feedback.textContent = message;
};

const clearValidation = () => {
  urlInput.classList.remove('is-invalid');
  feedback.textContent = '';
};

const getProxyUrl = (url) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app/get');
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', url);
  return proxyUrl.toString();
};

const parseRss = (rssData) => {
  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(rssData, 'application/xml');
  const parserError = xmlDocument.querySelector('parsererror');

  if (parserError) {
    throw new Error('invalidRss');
  }

  const channel = xmlDocument.querySelector('channel');
  const title = channel?.querySelector('title')?.textContent?.trim();
  const description = channel?.querySelector('description')?.textContent?.trim();
  const postElements = channel?.querySelectorAll('item');

  if (!title || !description || !postElements || postElements.length === 0) {
    throw new Error('invalidRss');
  }

  const posts = Array.from(postElements)
    .map((postElement) => ({
      title: postElement.querySelector('title')?.textContent?.trim(),
      link: postElement.querySelector('link')?.textContent?.trim(),
    }))
    .filter((post) => post.title && post.link);

  if (posts.length === 0) {
    throw new Error('invalidRss');
  }

  return {
    feed: { title, description },
    posts,
  };
};

const renderFeed = ({ title, description }) => {
  const feedItem = document.createElement('li');
  feedItem.className = 'list-group-item border-0 border-end-0';

  const feedTitle = document.createElement('h3');
  feedTitle.className = 'h6 m-0';
  feedTitle.textContent = title;

  const feedDescription = document.createElement('p');
  feedDescription.className = 'm-0 small text-black-50';
  feedDescription.textContent = description;

  feedItem.append(feedTitle, feedDescription);
  feedsList.prepend(feedItem);
};

const renderPosts = (posts) => {
  posts.forEach((post) => {
    const postItem = document.createElement('li');
    postItem.className = 'list-group-item border-0 border-end-0';

    const postLink = document.createElement('a');
    postLink.href = post.link;
    postLink.target = '_blank';
    postLink.rel = 'noopener noreferrer';
    postLink.textContent = post.title;

    postItem.append(postLink);
    postsList.prepend(postItem);
  });
};

const i18n = i18next.createInstance();

await i18n.init({
  lng: 'ru',
  debug: false,
  resources: {
    ru,
  },
});

yup.setLocale({
  mixed: {
    required: () => i18n.t('errors.required'),
  },
  string: {
    url: () => i18n.t('errors.invalidUrl'),
  },
});

feedsTitle.textContent = i18n.t('ui.feeds');
postsTitle.textContent = i18n.t('ui.posts');

const schema = yup.string().trim().required().url().test(
  'unique',
  () => i18n.t('errors.duplicate'),
  (value) => {
    if (!value) {
      return true;
    }

    return !existingFeeds.has(normalizeUrl(value));
  },
);

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const rawUrl = urlInput.value.trim();
  try {
    await schema.validate(rawUrl);
    const response = await fetch(getProxyUrl(rawUrl));

    if (!response.ok) {
      throw new Error('network');
    }

    const responseData = await response.json();
    const { feed, posts } = parseRss(responseData.contents);

    const normalizedUrl = normalizeUrl(rawUrl);
    existingFeeds.add(normalizedUrl);
    clearValidation();

    renderFeed(feed);
    renderPosts(posts);

    form.reset();
    urlInput.focus();
  } catch (error) {
    if (error.name === 'ValidationError') {
      setInvalidState(error.message);
      return;
    }

    if (error.message === 'network' || error.message === 'invalidRss') {
      setInvalidState(i18n.t(`errors.${error.message}`));
      return;
    }

    setInvalidState(i18n.t('errors.network'));
  }
});
