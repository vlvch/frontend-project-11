import { uid } from 'uid';

function rssParser(rss) {
  const result = {
    feed: [],
    posts: [],
    channel: false,
  };
  const parser = new DOMParser();
  const xml = parser.parseFromString(rss, 'text/xml');

  const channel = xml.querySelector('channel');
  if (channel) {
    result.channel = true;
  }

  const channelTitle = xml.querySelector('channel > title') ? xml.querySelector('channel > title').textContent : '';
  const channelDescription = xml.querySelector('channel > description') ? xml.querySelector('channel > description').textContent : '';

  result.feed.push({ title: channelTitle, description: channelDescription });

  const items = xml.querySelectorAll('item');

  items.forEach((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    const pubDate = xml.querySelector('pubDate').textContent;

    result.posts.push({
      title, description, link, pubDate, id: uid(),
    });
  });
  return result;
}
export default rssParser;
