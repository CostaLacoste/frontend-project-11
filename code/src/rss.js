const normalizeUrl = (value) => {
  const parsedUrl = new URL(value);
  return parsedUrl.href;
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
      description: postElement.querySelector('description')?.textContent?.trim() ?? '',
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

export const loadRss = async (url) => {
  try {
    const response = await fetch(getProxyUrl(url));
    if (!response.ok) {
      throw new Error('network');
    }

    let rssContent;
    try {
      const responseData = await response.clone().json();
      if (responseData && typeof responseData.contents === 'string') {
        rssContent = responseData.contents;
      } else {
        throw new Error('invalidRss');
      }
    } catch {
      rssContent = await response.text();
    }

    return parseRss(rssContent);
  } catch (error) {
    if (error instanceof Error && (error.message === 'invalidRss' || error.message === 'network')) {
      throw error;
    }
    throw new Error('network');
  }
};

export { normalizeUrl };
