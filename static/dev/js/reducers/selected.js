import {ADD_REFERER, CHANGE_STATE, REQUEST_NEW_SITE, DELETE_REFERER, RECEIVE_SITE, DELETED_SITE, CREATED_SITE, EDITED_SITE, MANAGE_SITE_SUCCESS} from 'appRoot/constants';
import {handleActions, combineActions} from 'redux-actions';

const defaultModel = {name: "", url: "", frequency: 0, deepLinks: 0, maxDeepLevel: 1, target: "", referer: [], timeout: 30, counters: []};

export default handleActions({
    RECEIVE_SITE : {
        next: (state, action) => action.payload
    },
    CHANGE_STATE : {
        next: (state, action) => ({...state, [action.payload.key]: action.payload.value})
    },
    REQUEST_NEW_SITE : {
        next: (state) => ({...defaultModel, referer: [], counters: []})
    },
    EDITED_SITE : {
        next: (state, action) => action.payload.id === state.id? {...state, ...action.payload.data} : state
    },
    DELETED_SITE : {
        next: (state, action) => action.payload === state.id? {} : state
    },
    MANAGE_SITE_SUCCESS : {
        next: (state, action) => action.payload.id === state._id? {...state, isRunning: action.payload.command === "start"} : state
    },
    ADD_REFERER: {
        next: (state, action) => ({...state, referer: state.referer.concat(action.payload)})
    },
    DELETE_REFERER: {
        next: (state, action) => {
            let quantity = 0;
            return {...state, referer: state.referer.filter( (value) => !(value === action.payload && quantity++ === 0))};
        }
    }
}, {...defaultModel, referer: [], counters: []});