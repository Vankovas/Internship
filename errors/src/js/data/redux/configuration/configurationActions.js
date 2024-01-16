export const UPDATECONFIGURATION = 'configuration/configuration/update';
export const updateConfiguration = (configuration) => ({
    type: UPDATECONFIGURATION,
    payload: configuration
});

export const SETINITIALSTATE = 'configuration/configuration/initial';
export const setInitialState = () => ({
    type: SETINITIALSTATE
});

export const UPDATEERRORTAG = 'configuration/errortag/update';
export const updateErrorTag = (errorTag) => ({
    type: UPDATEERRORTAG,
    payload: errorTag
});

export const DELETEERRORTAG = 'configuration/errortag/delete';
export const deleteErrorTag = (errorTagId) => ({
    type: DELETEERRORTAG,
    payload: errorTagId
});

export const NEWERRORTAG = 'configuration/errortag/new';
export const newErrorTag = () => ({
    type: NEWERRORTAG
});