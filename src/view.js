import i18next from 'i18next';
import resources from './locales/index.js';

i18next.init({
  lng: 'ru',
  debug: false,
  resources,
});

const view = () => {
  const allPosts = [];
  const viewedPosts = [];

  const clearMessage = () => {
    const message = document.getElementById('message');
    if (message) {
      const parent = message.parentNode;
      parent.removeChild(message);
    }
    const input = document.querySelector('input');
    input.classList = 'form-control';
  };

  const renderModal = (node) => {
    const { title, description, id } = node;
    const modal = document.getElementById('modal');

    const modalTitle = modal.querySelector('.modal-title');
    modalTitle.textContent = title;

    const modalBody = modal.querySelector('.modal-body');
    const a = document.createElement('a');
    a.textContent = description;
    modalBody.appendChild(a);

    modal.classList.add('show');
    modal.style = 'display: block;';

    const post = document.getElementById(id);
    const postText = post.querySelector('#postTitle');
    postText.classList = 'fw-normal link-secondary';
    viewedPosts.push(postText.textContent);

    const postButton = post.querySelector('button');
    postButton.classList = 'btn btn-outline-secondary';

    modal.addEventListener('click', () => {
      modal.classList.remove('show');
      modal.style = 'display: none;';

      modalTitle.textContent = '';

      modalBody.innerHTML = '';
    });
  };

  const renderFeeds = (feeds) => {
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
  };

  const renderPosts = (posts) => {
    const postsDiv = document.getElementById('posts');

    const ul = postsDiv.querySelector('ul');
    ul.innerHTML = '';

    const postHeader = postsDiv.querySelector('p');
    postHeader.textContent = i18next.t('ul.posts');

    posts.forEach((post) => {
      const {
        title, link, id,
      } = post;

      allPosts.push(post);

      const a = document.createElement('a');
      a.id = 'postTitle';
      a.href = link;
      a.textContent = title;
      a.classList = 'fw-bold';

      const button = document.createElement('button');
      button.classList = 'btn btn-outline-primary';
      button.textContent = i18next.t('button.read');

      const li = document.createElement('li');
      li.id = id;
      li.classList = 'list-group-item d-flex justify-content-between align-items-center';
      li.appendChild(button);

      const lastLi = ul.firstChild;

      if (viewedPosts.find((viewedPost) => viewedPost === title)) {
        a.classList = 'fw-normal link-secondary';
        button.classList = 'btn btn-outline-secondary';
      }

      li.appendChild(a);
      li.appendChild(button);

      ul.insertBefore(li, lastLi);
    });
  };

  const form = document.getElementById('form');

  const resetButton = () => {
    const button = form.querySelector('button');
    button.classList = 'btn btn-primary mb-3';
  };

  const renderError = (error) => {
    clearMessage();
    const input = document.querySelector('input');
    input.classList.add('is-invalid');

    const divInput = document.getElementById('div-input');
    const div = document.createElement('div');

    div.id = 'message';
    div.classList = 'invalid-feedback';
    div.textContent = i18next.t(error);

    divInput.appendChild(div);
    resetButton();
  };

  const getPostById = (id) => allPosts.find((el) => el.id === id);

  const renderSuccess = () => {
    clearMessage();
    const input = document.querySelector('input');
    input.classList.add('is-valid');

    const divInput = document.getElementById('div-input');
    const div = document.createElement('div');
    div.id = 'message';
    div.classList = 'valid-feedback';
    div.textContent = i18next.t('valid');
    divInput.appendChild(div);
    form.reset();
    resetButton();
  };

  const postsList = document.querySelector('#posts > ul');

  postsList.addEventListener('click', (e) => {
    let value;

    switch (e.target.tagName) {
      case 'BUTTON':
        value = e.target.parentNode;
        break;
      default:
        value = e.target;
    }
    const postId = value.id;
    const currentPost = getPostById(postId);

    renderModal(currentPost);
  });

  const formWatcher = (controller) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const input = document.getElementById('url-input');
      const { value } = input;
      controller(value);
    });
  };

  const disableButton = () => {
    const button = form.querySelector('button');
    button.classList = 'btn btn-secondary disabled mb-3';
  };

  return {
    clearMessage,
    renderFeeds,
    renderPosts,
    renderError,
    renderSuccess,
    resetButton,
    disableButton,
    formWatcher,
  };
};
export default view;
