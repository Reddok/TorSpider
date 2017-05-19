import {createStore, applyMiddleware} from 'redux';
import createLogger from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import siteReducer from 'appRoot/reducers/index';

const loggerMiddleware = createLogger();

export default function getStore(preloadedState) {
    return createStore(siteReducer, preloadedState, applyMiddleware(thunkMiddleware))
}