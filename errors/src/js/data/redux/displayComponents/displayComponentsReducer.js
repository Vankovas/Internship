import uuidv4 from 'uuid';

import { ADDALERT, DELETEALERT } from './displayComponentsActions';


const initialState = {
    toastAlerts: []
};

function displayComponentsReducer(state = initialState, action) {

    switch(action.type) {
        case ADDALERT:
            const updatedAlertsADD = [...state.toastAlerts];

            updatedAlertsADD.push({
                uuid: uuidv4(),
                status: action.payload.status,
                message: action.payload.message
            });

            const updatedStateADD = {...state, toastAlerts: updatedAlertsADD};

            return updatedStateADD;

        case DELETEALERT:
            const updatedAlertsDELETE = state.toastAlerts.filter(alert => alert.uuid !== action.payload);

            const updatedStateDELETE = {...state, toastAlerts: updatedAlertsDELETE};

            return updatedStateDELETE;

        default:
            return state;
    }
};

export default displayComponentsReducer;