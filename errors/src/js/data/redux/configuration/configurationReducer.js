import uuidv4 from 'uuid';

import { UPDATECONFIGURATION, UPDATEERRORTAG, DELETEERRORTAG, NEWERRORTAG , SETINITIALSTATE} from './configurationActions';

const initialState = {
    taggedErrors: []
};
let updatedErrorTags = undefined;
let newState = undefined;

function configurationReducer(state = initialState, action) {

    switch(action.type) {
        case UPDATECONFIGURATION: 
            updatedErrorTags = [...action.payload.taggedErrors].sort((a,b) => a.uuid.localeCompare(b.uuid));
            return { ...action.payload, taggedErrors: updatedErrorTags };

        case DELETEERRORTAG:
            updatedErrorTags = state.taggedErrors.filter(err => err.uuid !== action.payload).sort((a,b) => a.uuid.localeCompare(b.uuid));

            newState = {...state, taggedErrors: updatedErrorTags};

            return newState;

        case UPDATEERRORTAG:
            updatedErrorTags = state.taggedErrors.filter(err => err.uuid !== action.payload.uuid);
            updatedErrorTags.push(action.payload);
            updatedErrorTags.sort((a,b) => a.uuid.localeCompare(b.uuid));

            newState = {...state, taggedErrors: updatedErrorTags};
            
            return newState;

        case NEWERRORTAG:
            updatedErrorTags = [... state.taggedErrors];
            updatedErrorTags.push({
                uuid: uuidv4(),
                message: '',
                isIgnored: false,
                hasPriority: true
            });   
            updatedErrorTags.sort((a,b) => a.uuid.localeCompare(b.uuid));

            newState = {...state, taggedErrors: updatedErrorTags};

            return newState;

        case SETINITIALSTATE:
            return initialState;

        default:
            return state;
    }

}

export default configurationReducer;