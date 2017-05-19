import {RECEIVE_SITES, DELETED_SITE, CREATED_SITE, EDITED_SITE} from 'appRoot/constants';
import {handleActions} from 'redux-actions';

export default handleActions({
    RECEIVE_SITES : {
        next: (state, action) => action.payload
    },
    CREATED_SITE : {
        next: (state, action) => state.concat(action.payload)
    },
    EDITED_SITE : {
        next: (state, action) => state.map(item => item.id === action.payload.id? action.payload.data : item)
    },
    DELETED_SITE : {
        next: (state, action) => state.filter( item => !(action.payload === item.id))
    }
}, []);