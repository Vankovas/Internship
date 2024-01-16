import React from 'react';
import { connect } from 'react-redux';

import Security from '../../../../common/security/Security';
import Header from './Header';
import ErrorContainer from './ErrorContainer';
import ToastAlert from './ToastAlert';

class App extends React.Component {
    constructor() {
        super();

        this.security = new Security();
        this.renderToastAlerts = this.renderToastAlerts.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.toastAlerts.length !== nextProps.toastAlerts.length) return true;

        return false;
    }

    render() {
        return (
            <React.Fragment>
                { this.renderToastAlerts() }
                <div id='main'>
                    <Header />
                    <ErrorContainer/>
                </div>
            </React.Fragment>
        );
    }

    renderToastAlerts() {
        if(this.props.toastAlerts.length <= 0) return null;
        return this.props.toastAlerts.map(alert => <ToastAlert key={alert.uuid} alert={alert}/> );
    }
}

const mapStateToProps = (state) => ({
    toastAlerts: state.displayComponents.toastAlerts
});

export default connect(mapStateToProps)(App);