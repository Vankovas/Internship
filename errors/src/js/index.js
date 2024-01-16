import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import App from './components/App';
import Store from './data/redux/store';

if(getAuth()) {
    const element = document.querySelector('#reactContainer');
    ReactDOM.render(
        <Provider store={Store}>
            <App />
        </Provider>,
    element);
}

function getAuth() {
    if(process.env.NODE_ENV === 'development') return true;
    
    const key = sessionStorage.getItem('localkey');
    if(!key) { 
        sessionStorage.setItem('previousURL', window.location.href);
        window.location.assign('/frontend/login');
        return false;
    }

    return true;
}