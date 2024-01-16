import { UPDATEMEASUREMENTS, SETINITIALSTATE } from './measurementActions';
 
const initialState = [];
 
function measurementReducer(state = initialState, action) {
 
    switch(action.type) {
        
        case UPDATEMEASUREMENTS: 
            return action.payload;
        
        case SETINITIALSTATE: 
            return initialState;
 
        default:
            return state;
    }
 
}
 
export default measurementReducer;
