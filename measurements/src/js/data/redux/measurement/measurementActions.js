export const UPDATEMEASUREMENTS = 'measurement/measurements/update';
export const updateMeasurements = (measurements) => ({
    type: UPDATEMEASUREMENTS,
    payload: measurements
});

export const SETINITIALSTATE = 'measurement/measurements/initial'
export const setInitialState = () => ({
    type: SETINITIALSTATE
});
