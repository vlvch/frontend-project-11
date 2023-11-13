import i18next from "i18next";
import resources from './locales/index.js';

function clearErrors() {
    const errors = document.getElementById('error');
    if (errors) {
        const parent = errors.parentNode;
        parent.removeChild(errors);
    }
    const input = document.querySelector('input');
    input.classList.remove('is-invalid');
}

function renderFeeds(feeds) {
    const feedsGroup = document.getElementById('feeds');
    feedsGroup.innerHTML = '';

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

        feedsGroup.appendChild(li);
    })
}

function renderPosts(posts) {
    const postsGroup = document.getElementById('posts');

    postsGroup.innerHTML = '';

    posts.map((post) => {
        const { title, description, link } = post;

        const a = document.createElement('a');
        a.href = link;
        a.textContent = title;

        const button = document.createElement('button');
        button.classList = 'btn btn-outline-secondary'
        button.textContent = i18next.t('button.read');

        const li = document.createElement('li');
        li.classList = 'list-group-item d-flex justify-content-between align-items-center';
        li.appendChild(a);
        li.appendChild(button);

        const lastLi = postsGroup.firstChild;
        postsGroup.insertBefore(li, lastLi);
    })
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