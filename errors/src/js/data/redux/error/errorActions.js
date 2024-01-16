export const UPDATEERRORS = 'error/errors/update';
export const updateErrors = (errors) => ({
    type: UPDATEERRORS,
    payload: errors
});

export const SETINITIALSTATE = 'error/errors/initial';
export const setInitialState = () => ({
    type: SETINITIALSTATE
});