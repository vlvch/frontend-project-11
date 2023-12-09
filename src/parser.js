const rssParser = (rss) => {
  const { contents, status } = rss;
  const result = {
    feed: '',
    posts: [],
  };

  const parser = new DOMParser();

  const xml = parser.parseFromString(contents, 'text/xml');

  const channel = xml.querySelector('channel');

  if (!channel) {
    throw new Error('Link has no channel');
  }
  const channelTitle = xml.querySelector('channel > title') ? xml.querySelector('channel > title').textContent : '';
  const channelDescription = xml.querySelector('channel > description') ? xml.querySelector('channel > description').textContent : '';

  result.feed = { title: channelTitle, description: channelDescription, link: status.url };

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
