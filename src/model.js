import axios from 'axios';
import { differenceInMilliseconds } from 'date-fns';
import parser from './parser.js';

function sortByDate(data) {
  const result = data.sort((a, b) => {
    const date1 = new Date(a.pubDate);
    const date2 = new Date(b.pubDate);

    const difference = differenceInMilliseconds(date1, date2);
    if (difference < 0) {
      return 1;
    }
    if (difference > 0) {
      return -1;
    }
    return 0;
  });
  return result.reverse();
}

function getUnique(data) {
  const unique = {};
  const filtered = data.flat()
    .filter((node) => {
      const title = node.title.toLowerCase();
      if (!unique[title]) {
        unique[title] = true;
        return true;
      }
      return false;
    });
  return filtered;
}

function createModel() {
  const allLinks = [];
  const allPosts = [];
  const allFeeds = [];

  function addLink(link) {
    allLinks.push(link);
  }
  function getLinks() {
    return allLinks;
  }
  function getFeeds() {
    return getUnique(allFeeds);
  }
  function getPosts() {
    const uniqPosts = getUnique(allPosts);
    return sortByDate(uniqPosts);
  }
  function downloadRss(link) {
    return axios(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`)
      .then((response) => response.data)
      .then((data) => parser(data.contents))
      .then((data) => {
        const { feed, posts, channel } = data;
        if (!channel) {
          throw new Error('error.notRss');
        }
        allFeeds.push(feed);
        allPosts.push(posts);
      })
      .catch((error) => {
        if (error.message === 'Network Error') {
          throw new Error('error.net');
        }
        throw error;
      });
  }
  return {
    addLink,
    getLinks,
    getFeeds,
    getPosts,
    downloadRss,
  };
}
export default createModel;
