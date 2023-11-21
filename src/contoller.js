import * as yup from 'yup';

function createController(createdModel, createdView) {
  const {
    addLink,
    getLinks,
    getFeeds,
    getPosts,
    downloadRss,
  } = createdModel;

  const {
    renewState,
  } = createdView;

  function validate(value) {
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

    return schema.validate(value)
      .then()
      .catch((error) => {
        throw error;
      });
  }

  function refreshPosts() {
    return new Promise(() => {
      getLinks().forEach((link) => {
        downloadRss(link)
          .then(() => {
            const feeds = getFeeds();
            const posts = getPosts();

            const newState = { feeds, posts };
            renewState(newState);
            setTimeout(() => refreshPosts(), 5000);
          })
          .catch((error) => {
            throw error;
          });
      });
    });
  }

  function sendError(error) {
    const errorMessage = error.message;
    const newState = { valid: false, error: errorMessage };
    renewState(newState);
  }

  function sendSuccess(value) {
    addLink(value);
    const feeds = getFeeds();
    const posts = getPosts();

    const newState = { valid: true, feeds, posts };
    renewState(newState);
    refreshPosts();
  }

  const form = document.getElementById('form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const input = document.getElementById('url-input');
    const { value } = input;

    validate(value)
      .then(() => downloadRss(value))
      .then(() => {
        sendSuccess(value);
        form.reset();
      })
      .catch((error) => sendError(error));
  });
}

export default createController;
