import {combineReducers} from 'redux';
import selectedSite from 'appRoot/reducers/selected';
import items from 'appRoot/reducers/list';
import isFetching from 'appRoot/reducers/state';


export default combineReducers({items, selectedSite, isFetching});