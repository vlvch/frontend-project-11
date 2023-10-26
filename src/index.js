import './scss/styles.scss';
import * as yup from 'yup';
import View from './view.js';

class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    validate(value) {
        yup.setLocale({
            string: {
              url: 'error.address',
              required: 'error.empty',
              notOneOf: 'error.oneOf',
            },
        });

        const schema = yup.string()
            .url()
            .required()
            .notOneOf(this.model.getRss());
        
        schema.validate(value)
            .then(() => {
                this.model.addRss(value);
                const newState = { valid: true, rss: this.model.getRss() };
                this.view.renewState(newState);
            })
            .catch((error) => {
                const errorMessage = error.message;
                const newState = { valid: false, error: errorMessage };
                this.view.renewState(newState);
            });
    }

    init() {
        const form = document.querySelector('form');

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const inputValue = document.getElementById('add-rss');
            const newValue = inputValue.value;

            this.validate(newValue);
        })
    }
}

class Model {
    constructor() {
        this.allRss = [];
    }
    addRss(newRss) {
        this.allRss.push(newRss);
    }
    getRss() {
        return this.allRss;
    }
}

const model = new Model();
const view = new View();
const controller = new Controller(model, view);
controller.init();
view.init();