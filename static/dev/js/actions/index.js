import request from 'appRoot/helpers/request';
import {ADD_REFERER, DELETE_REFERER, CHANGE_STATE, REQUEST_SITES, RECEIVE_SITES, REQUEST_SITE, RECEIVE_SITE, REQUEST_NEW_SITE, CREATE_SITE, CREATED_SITE, EDIT_SITE, EDITED_SITE, DELETE_SITE, DELETED_SITE, MANAGE_SITE, MANAGE_SITE_SUCCESS} from 'appRoot/constants';
import { createActions } from 'redux-actions';


const sitesUrl = `/sites`;

export const {
    addReferer,
    deleteReferer,
    changeState,
    requestSites,
    receiveSites,
    requestSite,
    receiveSite,
    requestNewSite,
    createSite,
    createdSite,
    editSite,
    editedSite,
    deleteSite,
    deletedSite,
    manageSite,
    manageSiteSuccess
    } = createActions(
                        ADD_REFERER,
                        DELETE_REFERER,
                        CHANGE_STATE,
                        REQUEST_SITES,
                        RECEIVE_SITES,
                        REQUEST_SITE,
                        RECEIVE_SITE,
                        REQUEST_NEW_SITE,
                        CREATE_SITE,
                        CREATED_SITE,
                        EDIT_SITE,
                        EDITED_SITE,
                        DELETE_SITE,
                        DELETED_SITE,
                        MANAGE_SITE,
                        MANAGE_SITE_SUCCESS);





export function loadDeleteSite(id) {

    return (dispatch) => {
        dispatch(deleteSite(id));
        return request(sitesUrl + `/${id}`, {method: "DELETE"}).then(() => dispatch(deletedSite(id)));
    }

}

export function loadCreateSite() {

    return (dispatch, getState) => {
        let data = getState().selectedSite;
        dispatch(createSite(data));
        return request(sitesUrl, {method:  'POST', body: data}).then(res => dispatch(createdSite(res)));
    };

}

export function loadEditSite(id) {

    return (dispatch, getState) => {
        let data = getState().selectedSite;
        dispatch(editSite({id, data}));
        return request(sitesUrl + `/${id}`, {method: 'PUT', body: data}).then((data) => dispatch(editedSite({id, data})));
    }

}


export function loadManageSite(id, command = "start") {

    return (dispatch) => {
        dispatch(manageSite(id));
        return request(sitesUrl + `/${id}/${command}`).then(site => dispatch(manageSiteSuccess({id, command})));
    };

}

export function loadRequestSites() {
    return (dispatch) => {
        dispatch(requestSites());
        return request(sitesUrl).then(sites => dispatch(receiveSites(sites)));
    }
}

export function loadRequestSite(id) {
    return (dispatch) => {
        dispatch(requestSite(id));
        return request(sitesUrl + `/${id}`).then(site =>  dispatch(receiveSite(site)));
    }
}

export function loadCheckUniq(key, value) {
        let url = new URL(sitesUrl + '/check', 'http:localhost:8080');
        url.searchParams.append(key, value);
        return request(url);
}

/*function createAsyncAction(url, params, beforeAction, afterAction) {

    return function() {
        let args = Array.prototype.slice.call(arguments);
        return (dispatch) => {
            dispatch(beforeAction.apply(null, args));
            request(url, params).then(function() { dispatch(deletedSite.apply(null, args.concat(arguments))) });
        }

    }

}*/
