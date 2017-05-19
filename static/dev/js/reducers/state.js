import {REQUEST_SITE, RECEIVE_SITE, REQUEST_SITES, RECEIVE_SITES, DELETE_SITE, DELETED_SITE, CREATE_SITE, CREATED_SITE, EDIT_SITE, EDITED_SITE, MANAGE_SITE, MANAGE_SITE_SUCCESS} from 'appRoot/constants';
import {handleActions, combineActions} from 'redux-actions';

export default handleActions({
    [combineActions(REQUEST_SITES, REQUEST_SITE, CREATE_SITE, EDIT_SITE, DELETE_SITE, MANAGE_SITE)] : {
        next: (state) => true
    },
    [combineActions(RECEIVE_SITES, RECEIVE_SITE, CREATED_SITE, EDITED_SITE, DELETED_SITE, MANAGE_SITE_SUCCESS)] : {
        next: (state) => false
    }
}, false);