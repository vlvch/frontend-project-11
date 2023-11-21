import './scss/styles.scss';
import createView from './view.js';
import createModel from './model.js';
import createController from './contoller.js';

const createdModel = createModel();
const createdView = createView();

createController(createdModel, createdView);