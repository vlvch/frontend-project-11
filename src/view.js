import onChange from "on-change";

function clearErrors() {
  const errors = document.getElementById('errors');
  if (errors) {
    errors.remove();
  }
  const input = document.querySelector('input');
  input.classList.remove('is-invalid');
}

function render(allRss) {
    clearErrors();
    const listGroup = document.querySelector('.list-group');
    listGroup.innerHTML = '';

    allRss.map((rss) => {
        const li = document.createElement('li');
        li.classList = 'list-group-item';
        li.textContent = rss;
        listGroup.appendChild(li);
    })
}

function renderError(error) {
    clearErrors();

    const input = document.querySelector('input');
    input.classList.add('is-invalid');

    const divInput = document.getElementById('div-input');
    const div = document.createElement('div');
    div.id = 'errors'
    div.classList = 'invalid-feedback';
    div.textContent = `${error}`;
    divInput.appendChild(div);
}

export default class View {
    constructor() {
        this.state = {
            valid: '',
            error: '',
            rss: '',
        }
    }
    renewState(newState) {
        this.state = { ...this.state, ...newState};
        this.onChange();
    }
    onChange = () => {
        if (this.state.valid === true) {
            render(this.state.rss);
        } else if (this.state.valid === false) {
            renderError(this.state.error);
        }
    }
}