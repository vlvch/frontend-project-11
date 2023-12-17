import './scss/styles.scss';
import axios from 'axios';
import * as yup from 'yup';
import { differenceInMilliseconds } from 'date-fns';
import _ from 'lodash';
import { uid } from 'uid';
import onChange from 'on-change';
import parser from './parser.js';
import view from './view.js';

const sortByDate = (data) => {
  const result = data.sort((a, b) => {
    const date1 = new Date(a.pubDate);
    const date2 = new Date(b.pubDate);

    return differenceInMilliseconds(date1, date2);
  });
  return result;
};

const state = {
  inputForm: {
    status: 'waiting',
    error: '',
  },
  displayField: {
    feeds: [],
    posts: [],
    viewedPosts: [],
  },
};

const {
  renderFeeds,
  renderPosts,
  renderError,
  renderSuccess,
  disableButton,
  resetButton,
  formWatcher,
} = view(state.displayField);

const getSortedPosts = () => {
  const uniqPosts = _.uniqBy(state.displayField.posts.flat(), 'title');
  return sortByDate(uniqPosts);
};

const getLinks = () => state.displayField.feeds.map((node) => node.link);

const getProxyLink = (link) => axios(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`);

const downloadRss = (link) => getProxyLink(link)
  .then((response) => response.data)
  .then((data) => parser(data, link))
  .then((data) => {
    const { feed, posts } = data;

    const identifiedPosts = posts.map((node) => ({ ...node, id: uid() }));

    if (_.findIndex(state.displayField.feeds, { link }) < 0) {
      state.displayField.feeds.push(feed);
    }
    state.displayField.posts.push(identifiedPosts);
  })
  .catch((error) => {
    throw error;
  });

const watchedState = onChange(state, (path, value) => {
  if (path === 'inputForm.status') {
    switch (value) {
      case 'waiting':
        resetButton();
        break;
      case 'processing':
        disableButton();
        break;
      case 'processed':
        renderFeeds(state.displayField.feeds);
        renderPosts(state.displayField.posts);
        renderSuccess();
        break;
      case 'failed':
        renderError(state.inputForm.error);
        if (state.displayField.posts.length > 0) {
          renderPosts(state.displayField.posts);
        }
        break;
      default:
        throw new Error('status fail');
    }
  }
  if (path === 'displayField.posts') {
    renderPosts(state.displayField.posts);
  }
});

const updatePosts = () => {
  const updateDelay = 5000;

  const promises = getLinks().map((link) => downloadRss(link));
  Promise.all(promises)
    .then(() => {
      const sortedPosts = getSortedPosts();
      watchedState.displayField.posts = sortedPosts;
    })
    .catch((error) => {
      throw error;
    })
    .finally(() => {
      setTimeout(() => updatePosts(), updateDelay);
    });
};

const makeControl = (value) => {
  yup.setLocale({
    string: {
      url: 'error.address',
    },
    mixed: {
      required: 'error.empty',
      notOneOf: 'error.oneOf',
    },
  });

  const validate = (string) => {
    const schema = yup.string()
      .url()
      .required()
      .notOneOf(getLinks());

    return schema.validate(string);
  };

  validate(value)
    .then((data) => {
      watchedState.inputForm.status = 'processing';
      return downloadRss(data);
    })
    .then(() => {
      const sortedPosts = getSortedPosts();
      state.displayField.posts = sortedPosts;

      watchedState.inputForm.status = 'processed';
      watchedState.inputForm.status = 'waiting';
    })
    .catch((error) => {
      watchedState.inputForm.status = 'processing';

      let errorMessage;

      switch (error.code) {
        case 'ERR_NETWORK':
          errorMessage = 'error.net';
          break;
        case 'ERR_PARSER':
          errorMessage = 'error.notRss';
          break;
        default:
          errorMessage = error.message;
          break;
      }
      state.inputForm.error = errorMessage;

      watchedState.inputForm.status = 'failed';
      watchedState.inputForm.status = 'waiting';
    });
};

updatePosts();

formWatcher(makeControl);
