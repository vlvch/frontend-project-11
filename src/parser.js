const rssParser = (rss, url) => {
  const { contents } = rss;
  const result = { posts: [] };

  const parser = new DOMParser();

  const xml = parser.parseFromString(contents, 'text/xml');

  const errorNode = xml.querySelector('parsererror');

  if (errorNode) {
    const error = new Error(errorNode);
    error.code = 'ERR_PARSER';
    throw error;
  }

  const channelTitle = xml.querySelector('channel > title') ? xml.querySelector('channel > title').textContent : '';
  const channelDescription = xml.querySelector('channel > description') ? xml.querySelector('channel > description').textContent : '';

  result.feed = { title: channelTitle, description: channelDescription, link: url };

  const items = xml.querySelectorAll('item');

  items.forEach((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    const pubDate = item.querySelector('pubDate').textContent;

    result.posts.push({
      title, description, link, pubDate,
    });
  });
  return result;
};
export default rssParser;
