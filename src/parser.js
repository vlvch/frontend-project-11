export default function(rss) {
    const result = {
        feed: [],
        posts: [],
    };
    const parser = new DOMParser();
    const xml = parser.parseFromString(rss, 'text/xml');

    const title = xml.querySelector('channel > title').textContent;
    const description = xml.querySelector('channel > description').textContent;

    result.feed.push({ title: title, description: description});

    const items = xml.querySelectorAll('item');

    items.forEach((item) => {
        const title = item.querySelector('title').textContent;
        const description = item.querySelector('description').textContent;
        const link = item.querySelector('link').textContent;

        result.posts.push({ title: title, description: description, link: link });
    })
    return result;
}