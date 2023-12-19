const view = (state, i18next) => {
  const { posts, viewedPosts } = state;

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
    const {
      title, description, id, link,
    } = node;
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

    const readButton = modal.querySelector('.read');
    readButton.href = link;

    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('close')) {
        modal.classList.remove('show');
        modal.style = 'display: none;';

        modalTitle.textContent = '';

        modalBody.innerHTML = '';
      }
    });
  };

  const renderHeaders = () => {
    const postHeader = document.querySelector('p');
    postHeader.textContent = i18next.t('ul.posts');

    const feedsDiv = document.getElementById('feeds');
    const feedHeader = document.createElement('p');
    feedHeader.textContent = i18next.t('ul.feeds');
    feedsDiv.appendChild(feedHeader);
  };

  const renderFeeds = (feeds) => {
    const feedsDiv = document.getElementById('feeds');
    feedsDiv.innerHTML = '';

    const ul = document.createElement('ul');
    ul.classList = 'list-group';

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

    renderHeaders();
    feedsDiv.appendChild(ul);
  };

  const renderPosts = (newPosts) => {
    const postsDiv = document.getElementById('posts');

    const ul = postsDiv.querySelector('ul');
    ul.innerHTML = '';

    newPosts.forEach((post) => {
      posts.push(post);
      const {
        title, link, id,
      } = post;

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

  const postsList = document.querySelector('#posts > ul');

  postsList.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const postId = e.target.parentNode.id;

      const currentPost = posts.flat().find((el) => el.id === postId);

      renderModal(currentPost);
    }
  });

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
  };

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
  };

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
