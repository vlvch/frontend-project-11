import i18next from "i18next";
import resources from './locales/index.js';

const viewedPosts = [];

function clearErrors() {
    const errors = document.getElementById('error');
    if (errors) {
        const parent = errors.parentNode;
        parent.removeChild(errors);
    }
    const input = document.querySelector('input');
    input.classList.remove('is-invalid');
}

function renderModal(node) {
    console.log(node);
    const modal = document.getElementById('modal');
    const description = node.querySelector('#postDescription');
    const title = node.querySelector('#postTitle');

    const modalTitle = modal.querySelector('.modal-title');
    modalTitle.textContent = title.textContent;

    const modalBody = modal.querySelector('.modal-body');
    const a = document.createElement('a');
    a.textContent = description.textContent;
    modalBody.appendChild(a);

    modal.classList.add('show');
    modal.style = 'display: block;';

    const viewedPost = document.getElementById(node.id);
    viewedPost.classList.remove('fw-bold');
    viewedPost.classList.add('fw-normal');

    viewedPosts.push(title.textContent);

    modal.addEventListener('click', () => closeModal());
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

function renderFeeds(feeds) {
    const feedsDiv = document.getElementById('feeds');
    feedsDiv.innerHTML = '';

    const ul = document.createElement('ul');
    ul.classList = 'list-group';

    const p = document.createElement('p');
    p.textContent = i18next.t('ul.feeds');

    feeds.map((feed) => {
        const { title, description } = feed;

        const h6 = document.createElement('h6');
        h6.textContent = title;

        const p = document.createElement('p');
        p.textContent = description;

        const li = document.createElement('li');
        li.classList = 'list-group-item justify-content-between align-items-center';
        li.appendChild(h6);
        li.appendChild(p);

        ul.appendChild(li);
    })

    feedsDiv.appendChild(p);
    feedsDiv.appendChild(ul);
}

function renderPosts(posts) {
    const postsDiv = document.getElementById('posts');
    postsDiv.innerHTML = '';

    const ul = document.createElement('ul');
    ul.classList = 'list-group';

    const p = document.createElement('p');
    p.textContent = i18next.t('ul.posts');

    posts.map((post) => {
        const { title, description, link, id} = post;

        const a = document.createElement('a');
        a.id = 'postTitle';
        a.href = link;
        a.textContent = title;

        const hidden = document.createElement('a');
        hidden.id = 'postDescription';
        hidden.textContent = description;
        hidden.classList = 'd-none';

        const button = document.createElement('button');
        button.classList = 'btn btn-outline-secondary'
        button.textContent = i18next.t('button.read');

        const li = document.createElement('li');
        li.id = id;
        li.classList = 'list-group-item d-flex justify-content-between align-items-center fw-bold';
        li.appendChild(a);
        li.appendChild(hidden);
        li.appendChild(button);

        const lastLi = ul.firstChild;

        viewedPosts.map((post) => {
            if (post === title) {
                li.classList = 'list-group-item d-flex justify-content-between align-items-center fw-normal';
            }
        })
        ul.insertBefore(li, lastLi);
    })
    postsDiv.appendChild(p);
    postsDiv.appendChild(ul);
}

function renderError(error) {
    const input = document.querySelector('input');
    input.classList.add('is-invalid');

    const divInput = document.getElementById('div-input');
    const div = document.createElement('div');
    div.id = 'error'
    div.classList = 'invalid-feedback';
    div.textContent = i18next.t(error);
    divInput.appendChild(div);
}

export default class View {
    constructor() {
        this.state = {
            valid: true,
            error: '',
            feeds: '',
            posts: '',
        }
        this.i18 = i18next.init({
            lng: 'ru',
            debug: false,
            resources,
        });
        this.posts = document.getElementById('posts');
        this.posts.addEventListener('click', (e) => {
            e.target.tagName === 'BUTTON'? renderModal(e.target.parentNode) : renderModal(e.target);
        });
    }
    renewState(newState) {
        this.state = { ...this.state, ...newState };
        this.onChange();
    }
    onChange = () => {
        if (this.state.valid === true) {
            renderFeeds(this.state.feeds);
            renderPosts(this.state.posts);
            clearErrors();
        } else if (this.state.valid === false) {
            clearErrors()
            renderError(this.state.error);
        }
    }
}