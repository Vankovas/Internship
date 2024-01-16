import { createStore, combineReducers, compose } from 'redux';

import measurementReducer from './measurement/measurementReducer';

const reducers = combineReducers({
    measurements: measurementReducer
});

const devTools = process.env.NODE_ENV === 'development' && typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;

const store = createStore(reducers, devTools());
export default store; 
