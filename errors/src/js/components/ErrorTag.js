import React from 'react';
import { connect } from 'react-redux';

import store from '../data/redux/store';
import { updateErrorTag } from '../data/redux/configuration/configurationActions';

import check_box from '../../img/check_box.svg';
import check_box_outline from '../../img/check_box_outline_blank.svg';
import cancel from '../../img/cancel.svg';


class ErrorTag extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            message: '',
            isIgnored: false,
            hasPriority: false,
        }

        this.saveToState = this.saveToState;
        this.onMessageChange = this.onMessageChange.bind(this);
        this.onMessageBlur = this.onMessageBlur.bind(this);
        this.onIgnoreChange = this.onIgnoreChange.bind(this);
        this.onPriorityChange = this.onPriorityChange.bind(this);
        this.onDeleteClick = this.onDeleteClick.bind(this);
    }

    componentDidMount() {
        this.setState({
            message: this.props.errortag.message,
            isIgnored: this.props.errortag.isIgnored,
            hasPriority: this.props.errortag.hasPriority,
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.errortag !== nextProps.errortag) return true;

        if (this.state.message !== nextState.message) return true;
        if (this.state.isIgnored !== nextState.isIgnored) return true;
        if (this.state.hasPriority !== nextState.hasPriority) return true;

        return false;
    }

    render() {
        return (
            <div id='ErrorTag'>
                <input
                    className='error-tag-message'
                    type='text'
                    value={this.state.message}
                    onChange={this.onMessageChange}
                    onBlur={this.onMessageBlur}
                />

                <img className='error-tag__checkbox' onClick={this.onIgnoreChange} src={this.state.isIgnored === true ? check_box : check_box_outline}/>
            
                <img className='error-tag__checkbox' onClick={this.onPriorityChange} src={this.state.hasPriority === true ? check_box : check_box_outline}/>

                <img onClick={this.onDeleteClick} src={cancel}/>

            </div>
        )
    }

    onMessageBlur(e) {
        this.setState({ 
            message: e.target.value 
        }, this.saveToState);
    }

    onMessageChange(e) {
        this.setState({
            message: e.target.value
        });
    }


    onIgnoreChange(e) {
        this.setState({
            isIgnored: !this.state.isIgnored
        }, this.saveToState);
    }

    onPriorityChange(e) {

        this.setState({ 
            hasPriority: !this.state.hasPriority
        }, this.saveToState);
    }

    saveToState() {
        store.dispatch(updateErrorTag({
            ...this.state,
            uuid: this.props.errortag.uuid
        }));
    }

    onDeleteClick() {
        this.props.onErrorTagDeleteHandler(this.props.errortag.uuid);
    }
}

const mapStateToProps = (state, ownprops) => {
    return {
        errortag: state.configuration.taggedErrors.filter(e => e.uuid === ownprops.errorId)[0]
    };
}

export default connect(mapStateToProps)(ErrorTag);