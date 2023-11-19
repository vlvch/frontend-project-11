import { uid } from 'uid';

export default function(rss) {
    const result = {
        feed: [],
        posts: [],
        channel: false,
    };
    const parser = new DOMParser();
    const xml = parser.parseFromString(rss, 'text/xml');

    const channel = xml.querySelector('channel');
    if (!!channel) {
        result.channel = true;
    }

    const title = xml.querySelector('channel > title')? xml.querySelector('channel > title').textContent : '';
    const description = xml.querySelector('channel > description')? xml.querySelector('channel > description').textContent : '';

    result.feed.push({ title: title, description: description });

    const items = xml.querySelectorAll('item');

    items.forEach((item) => {
        const title = item.querySelector('title').textContent;
        const description = item.querySelector('description').textContent;
        const link = item.querySelector('link').textContent;
        const pubDate = xml.querySelector('pubDate').textContent;

        result.posts.push({ title: title, description: description, link: link, pubDate: pubDate, id: uid() });
    })
    return result;
}
