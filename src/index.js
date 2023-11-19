import './scss/styles.scss';
import * as yup from 'yup';
import View from './view.js';
import parser from './parser.js';
import { differenceInMilliseconds } from 'date-fns';

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
        })
    return filtered;
}

class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.form = document.getElementById('form');

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();

            const input = document.getElementById('add-rss');
            const value = input.value;

            this.validate(value)
                .then(() => this.model.downloadRss(value))
                .then(() => {
                    this.sendSuccess(value);
                    this.form.reset();
                })
                .catch((error) => this.sendError(error));
        })
    }

    refreshPosts() {
        return new Promise(() => {
            this.model.allLinks.map((link) => {
                this.model.downloadRss(link)
                    .then(() => {
                        const feeds = this.model.getFeeds();
                        const posts = this.model.getPosts();

                        const newState = { feeds: feeds, posts: posts };
                        this.view.renewState(newState);
                        setTimeout(() => this.refreshPosts(), 5000);
                    })
                    .catch((error) => {
                        throw error
                    })
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
            .notOneOf(this.model.getLinks())

        return schema.validate(value)
            .then()
            .catch((error) => {
                throw error;
            })
    }


    sendError(error) {
        const errorMessage = error.message;
        const newState = { valid: false, error: errorMessage };
        this.view.renewState(newState);
    }

    sendSuccess(value) {
        this.model.addLink(value);
        const feeds = this.model.getFeeds();
        const posts = this.model.getPosts();

        const newState = { valid: true, feeds: feeds, posts: posts }
        this.view.renewState(newState);
        this.refreshPosts();
    }
}

class Model {
    constructor() {
        this.allLinks = [];
        this.allPosts = [];
        this.allFeeds = [];
    }
    addLink(link) {
        this.allLinks.push(link);
    }
    removeLink() {
        this.allLinks.pop();
    }
    getLinks() {
        return this.allLinks;
    }
    getFeeds() {
        const result = getUnique(this.allFeeds);
        return result;
    }
    getPosts() {
        const uniqPosts = getUnique(this.allPosts);
        const sortedPosts = sortByDate(uniqPosts);
        return sortedPosts;
    }
    downloadRss(link) {
        return fetch(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`)
            .then((response) => {
                if (response.ok) return response.json();
                throw new Error('error.net');
            })
            .then((data) => parser(data.contents))
            .then((data) => {
                const { feed, posts, channel } = data;
                if (!channel) {
                    throw new Error('error.notRss');
                };
                this.allFeeds.push(feed);
                this.allPosts.push(posts);
            })
            .catch((error) => {
                throw error
            });
    }
}

const model = new Model();
const view = new View();
const controller = new Controller(model, view);