import { uid } from 'uid';

const rssParser = (rss) => {
  const result = {
    feed: '',
    posts: [],
  };
  const parser = new DOMParser();
  const xml = parser.parseFromString(rss, 'text/xml');

  const channel = xml.querySelector('channel');
  if (!channel) {
    throw new Error('error.notRss');
  }

  const channelTitle = xml.querySelector('channel > title') ? xml.querySelector('channel > title').textContent : '';
  const channelDescription = xml.querySelector('channel > description') ? xml.querySelector('channel > description').textContent : '';

  result.feed = { title: channelTitle, description: channelDescription };

  const items = xml.querySelectorAll('item');

  items.forEach((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    const pubDate = item.querySelector('pubDate').textContent;

    result.posts.push({
      title, description, link, pubDate, id: uid(),
    });
  });
  return result;
};
export default rssParser;
