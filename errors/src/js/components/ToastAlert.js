import React from 'react';

import { makeOnlyFirstCharCapital } from '../../../../common/util/stringManipulation'

import { deleteAlert } from '../data/redux/displayComponents/displayComponentsActions';
import store from '../data/redux/store';

class ToastAlert extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            closeTimeout: null,
            animationTimeout: null
        }

        this.getFormattedStatus = this.getFormattedStatus.bind(this);
        this.startClosingTimeout = this.startClosingTimeout.bind(this);
        this.removeToastAlert = this.removeToastAlert.bind(this);
    }

    componentDidMount() {
        this.startClosingTimeout();
    }

    componentWillUnmount() {
        clearTimeout(this.state.closeTimeout);
        clearTimeout(this.state.animationTimeout);
    }

    render() {
        return (
            <div id="ToastAlert" className={'toast-alert-' + this.props.alert.status + ' toast-alert-' + this.props.alert.uuid}>
                <div className='toast-alert-content'>
                    <p className="toast-alert-content-status">{this.getFormattedStatus()}</p>
                    <p className="toast-alert-content-message">{this.props.alert.message}</p>
                    <span className="toast-alert-content-closebtn" onClick={this.removeToastAlert}>&times;</span>
                </div>
            </div>
        );
    }

    getFormattedStatus() {
        return makeOnlyFirstCharCapital(this.props.alert.status);
    }

    startClosingTimeout() {
        const timer =  setTimeout(() => { this.removeToastAlert(); }, 10 * 1000);
        this.setState({ closeTimeout: timer });
    }

    removeToastAlert() {
        //Clear auto close timer to prevent it trying to fire when the user has closed the alert before the auto-closing function.
        clearTimeout(this.state.closeTimeout);

        //Remove after the animation has finished. (600 ms)
        document.querySelector(`.toast-alert-${this.props.alert.uuid}`).classList.toggle('zero-opacity');

        const timer = setTimeout(() => { store.dispatch(deleteAlert(this.props.alert.uuid)); }, 0.6 * 1000);
        this.setState({ animationTimeout : timer });
    }
}

export default ToastAlert;