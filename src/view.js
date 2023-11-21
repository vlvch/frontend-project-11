import i18next from 'i18next';
import resources from './locales/index.js';

i18next.init({
  lng: 'ru',
  debug: false,
  resources,
});

function createView() {
  let state = {
    valid: '',
    error: '',
    feeds: '',
    posts: '',
    descriptions: [],
  };

  const viewedPosts = [];

  function clearMessage() {
    const message = document.getElementById('message');
    if (message) {
      const parent = message.parentNode;
      parent.removeChild(message);
    }
    const input = document.querySelector('input');
    input.classList = 'form-control';
  }

  function getDescription(id) {
    let result;
    state.descriptions.forEach((description) => {
      if (id === description.id) {
        result = description.text;
      }
    });
    return result;
  }

  function closeModal() {
    const modal = document.getElementById('modal');

    modal.classList.remove('show');
    modal.style = 'display: none;';

    const modalTitle = modal.querySelector('.modal-title');
    modalTitle.textContent = '';

    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = '';
  }

  function renderModal(node) {
    const modal = document.getElementById('modal');
    const description = getDescription(node.id);

    const title = node.querySelector('#postTitle');

    const modalTitle = modal.querySelector('.modal-title');
    modalTitle.textContent = title.textContent;

    const modalBody = modal.querySelector('.modal-body');
    const a = document.createElement('a');
    a.textContent = description;
    modalBody.appendChild(a);

    modal.classList.add('show');
    modal.style = 'display: block;';

    const viewedPost = document.getElementById(node.id);
    const viewedPostText = viewedPost.querySelector('#postTitle');
    viewedPostText.classList = 'fw-normal';
    viewedPosts.push(viewedPostText.textContent);

    modal.addEventListener('click', () => closeModal());
  }

  function renderFeeds(feeds) {
    const feedsDiv = document.getElementById('feeds');
    feedsDiv.innerHTML = '';

    const ul = document.createElement('ul');
    ul.classList = 'list-group';

    const feedHeader = document.createElement('p');
    feedHeader.textContent = i18next.t('ul.feeds');

    feeds.forEach((feed) => {
      const { title, description } = feed;

      const h6 = document.createElement('h6');
      h6.textContent = title;

      const feedDescription = document.createElement('p');
      feedDescription.textContent = description;

      const li = document.createElement('li');
      li.classList = 'list-group-item justify-content-between align-items-center';
      li.appendChild(h6);
      li.appendChild(feedDescription);

      ul.appendChild(li);
    });

    feedsDiv.appendChild(feedHeader);
    feedsDiv.appendChild(ul);
  }

  function addDescription(text, id) {
    state.descriptions.push({ text, id });
  }

  function renderPosts(posts) {
    const postsDiv = document.getElementById('posts');

    const ul = postsDiv.querySelector('ul');
    ul.innerHTML = '';

    const postHeader = postsDiv.querySelector('p');
    postHeader.textContent = i18next.t('ul.posts');

    posts.forEach((post) => {
      const {
        title, description, link, id,
      } = post;

      addDescription(description, id);

      const a = document.createElement('a');
      a.id = 'postTitle';
      a.href = link;
      a.textContent = title;
      a.classList = 'fw-bold';

      const button = document.createElement('button');
      button.classList = 'btn btn-outline-secondary';
      button.textContent = i18next.t('button.read');

      const li = document.createElement('li');
      li.id = id;
      li.classList = 'list-group-item d-flex justify-content-between align-items-center';
      li.appendChild(button);

      const lastLi = ul.firstChild;

      viewedPosts.forEach((viewedPost) => {
        if (viewedPost === title) {
          a.classList = 'fw-normal';
        }
      });
      li.appendChild(a);
      li.appendChild(button);
      ul.insertBefore(li, lastLi);
    });
  }

  function renderError(error) {
    const input = document.querySelector('input');
    input.classList.add('is-invalid');

    const divInput = document.getElementById('div-input');
    const div = document.createElement('div');
    div.id = 'message';
    div.classList = 'invalid-feedback';
    div.textContent = i18next.t(error);
    divInput.appendChild(div);
  }

  function renderSuccess() {
    const input = document.querySelector('input');
    input.classList.add('is-valid');

    const divInput = document.getElementById('div-input');
    const div = document.createElement('div');
    div.id = 'message';
    div.classList = 'valid-feedback';
    div.textContent = i18next.t('valid');
    divInput.appendChild(div);
  }

  const posts = document.querySelector('#posts > ul');

  posts.addEventListener('click', (e) => {
    return e.target.tagName === 'BUTTON' ? renderModal(e.target.parentNode) : renderModal(e.target);
  });

  function onChange() {
    if (state.valid === true) {
      renderFeeds(state.feeds);
      renderPosts(state.posts);
      clearMessage();
      renderSuccess();
    } else if (state.valid === false) {
      clearMessage();
      renderError(state.error);
      return posts.length > 0 ? renderPosts(state.posts) : '';
    }
    return renderPosts(state.posts);
  }

  function renewState(newState) {
    state = { ...state, ...newState };
    onChange();
  }
  return {
    renewState,
  };
}
export default createView;
