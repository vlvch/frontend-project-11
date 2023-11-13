import './scss/styles.scss';
import * as yup from 'yup';
import View from './view.js';
import parser from './parser.js';

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
        })
        .sort((a, b) => {
            const A = a.title.toLowerCase();
            const B = b.title.toLowerCase();
            if (A < B) {
                return -1;
            }
            if (A > B) {
                return 1;
            }
            return 0;
        });
    return filtered;
}

class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.form = document.getElementById('form');

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();

            const inputValue = document.getElementById('add-rss');
            const newValue = inputValue.value;

            this.validate(newValue);
        })
    }

    refreshPosts() {
        return new Promise((resolve, reject) => {
            this.model.downloadRss()
            .then(() => {
                const feeds = this.model.getFeeds();
                const posts = this.model.getPosts();

                const newState = { valid: true, feeds: feeds, posts: posts };
                this.view.renewState(newState);
                setTimeout(() => this.refreshPosts(), 5000);
                resolve();
            })
            .catch((e) => {
                reject(e);
            })
        })
    }

    validate(value) {
        yup.setLocale({
            string: {
                url: 'error.address',
            },
            mixed: {
                required: 'error.empty',
                notOneOf: 'error.oneOf',
            }
        });

        const schema = yup.string()
            .url()
            .required()
            .notOneOf(this.model.getLinks());

        schema.validate(value)
            .then(() => this.model.addRss(value))
            .then(() => this.model.downloadRss())
            .then(() => {
                const feeds = this.model.getFeeds();
                const posts = this.model.getPosts();

                const newState = { valid: true, feeds: feeds, posts: posts };
                this.view.renewState(newState);
                this.refreshPosts();
            })
            .catch((error) => {
                const errorMessage = error.message;
                const newState = { valid: false, error: errorMessage };
                this.view.renewState(newState);
            });
    }
}

class Model {
    constructor() {
        this.allLinks = [];
        this.allPosts = [];
        this.allFeeds = [];
    }
    addRss(link) {
        this.allLinks.push(link);
    }
    getLinks() {
        return this.allLinks;
    }
    getFeeds() {
        const result = getUnique(this.allFeeds);
        return result;
    }
    getPosts() {
        const result = getUnique(this.allPosts);
        return result;
    }
    downloadRss() {
        return new Promise((resolve, reject) => {
            this.allLinks.map((link) => {
                fetch(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`)
                    .then((response) => {
                        if (response.ok) return response.json();
                        throw new Error('Network response was not ok.')
                    })
                    .then((data) => {
                        const { feed, posts } = parser(data.contents);
                        this.allFeeds.push(feed);
                        this.allPosts.push(posts);
                        resolve();
                    })
                    .catch((e) => {
                        reject(e);
                    })
            })
        })
    }
}

const model = new Model();
const view = new View();
const controller = new Controller(model, view);