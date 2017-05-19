import 'appRoot/extends/validation';

import React from 'react';
import {render} from 'react-dom';
import Root from 'appRoot/containers/root';
import bootstrapCSS from 'bootstrap/less/bootstrap.less';
import CSS from '../less/app.less';
import createStore from "appRoot/stores";

const store = createStore();

render(<Root store={store}/>, document.getElementById('page'));