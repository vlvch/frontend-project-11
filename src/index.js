import './scss/styles.scss';
import axios from 'axios';
import * as yup from 'yup';
import { differenceInMilliseconds } from 'date-fns';
import parser from './parser.js';
import view from './view.js';

const {
  clearMessage,
  renderFeeds,
  renderPosts,
  renderError,
  renderSuccess,
  resetButton,
} = view();

const getUnique = (data) => {
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
};

const sortByDate = (data) => {
  const result = data.sort((a, b) => {
    const date1 = new Date(a.pubDate);
    const date2 = new Date(b.pubDate);

    const difference = differenceInMilliseconds(date1, date2);
    if (difference < 0) {
      return -1;
    }
    if (difference > 0) {
      return 1;
    }
    return 0;
  });
  return result;
};

let state = {
  links: [],
  feeds: [],
  posts: [],
  valid: '',
  error: '',
  refresh: false,
};

const change = () => {
  clearMessage();
  resetButton();
  if (state.valid === true) {
    renderFeeds(state.feeds);
    renderPosts(state.posts);
    renderSuccess();
  }
  renderError(state.error);
  return state.posts.length > 0 ? renderPosts(state.posts) : '';
};

const addLink = (link) => {
  state.links.push(link);
};

const addPosts = (newPosts) => {
  state.posts.push(newPosts);
};

const addFeed = (newFeed) => {
  state.feeds.push(newFeed);
};

const getSortedPosts = () => {
  const uniqPosts = getUnique(state.posts);
  return sortByDate(uniqPosts);
};

const getLinks = () => state.links;

const getRefresh = () => state.refresh;

const renewState = (newState) => {
  const sortedPosts = getSortedPosts();
  state = { ...state, ...newState, posts: sortedPosts };

  change();
};

const downloadRss = (link) => axios(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`)
  .then((response) => response.data)
  .then((data) => parser(data.contents))
  .then((data) => {
    const { feed, posts } = data;
    if (!state.links.includes(link)) {
      addLink(link);
      addFeed(feed);
    }
    addPosts(posts);
  })
  .catch((error) => {
    if (error.message === 'Network Error') {
      throw new Error('error.net');
    }
    throw error;
  });

const refreshPosts = () => {
  const promises = state.links.map((link) => downloadRss(link));
  Promise.all(promises)
    .then(() => renewState(state))
    .finally(() => {
      setTimeout(() => refreshPosts(), 5000);
    });
};

const controller = (value) => {
  const validate = (string) => {
    yup.setLocale({
      string: {
        url: 'error.address',
      },
      mixed: {
        required: 'error.empty',
        notOneOf: 'error.oneOf',
      },
    });

    const schema = yup.string()
      .url()
      .required()
      .notOneOf(getLinks());

    return schema.validate(string);
  };

  validate(value)
    .then(() => downloadRss(value))
    .then(() => {
      renewState({ valid: true });
      if (!getRefresh()) {
        renewState({ refresh: true });
        refreshPosts();
      }
    })
    .catch((error) => {
      renewState({ valid: false, error: error.message });
    });
};

export default controller;
