import { UPDATEERRORS, SETINITIALSTATE } from './errorActions';

const initialState = [];

function errorReducer(state = initialState, action) {
    
    switch(action.type) {
        case UPDATEERRORS:
            return [...action.payload];

        case SETINITIALSTATE:
            return initialState;

        default:
            return state;
    }
}

export default errorReducer;