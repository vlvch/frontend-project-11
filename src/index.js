import './scss/styles.scss';
import * as yup from 'yup';
import View from './view.js';

class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    validate(value) {
        const schema = yup.string()
            .url('Неправильный адрес')
            .required('Поле обязательно для заполнения')
            .notOneOf(this.model.getRss(), 'Rss уже был добавлен');

        schema.validate(value)
            .then(() => {
                this.model.addRss(value);
                const newState = { valid: true, rss: this.model.getRss() };
                this.view.renewState(newState);
            })
            .catch((error) => {
                const newState = { valid: false, error: error };
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