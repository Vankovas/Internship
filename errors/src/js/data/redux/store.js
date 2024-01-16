import { createStore, combineReducers, compose } from 'redux';

import configurationReducer from './configuration/configurationReducer';
import errorReducer from './error/errorReducer';
import displayComponentsReducer from './displayComponents/displayComponentsReducer';

const reducers = combineReducers({
    errors: errorReducer,
    configuration: configurationReducer,
    displayComponents: displayComponentsReducer
});

const devTools = process.env.NODE_ENV === 'development' && typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;

const store = createStore(reducers, devTools());

export default store;
