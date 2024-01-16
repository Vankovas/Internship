export const ADDALERT = 'displayComponents/toastAlerts/add';
export const addAlert = (status, message) => ({
    type: ADDALERT,
    payload: {
        status: status,
        message: message
    }
});

export const DELETEALERT = 'displayComponents/toastAlerts/delete';
export const deleteAlert = (alertId) => ({
    type: DELETEALERT,
    payload: alertId
});