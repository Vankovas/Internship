import React from 'react';

import { getSimilarErrors } from '../data/connectionHelper';
import CheckableError from './CheckableError';

import { addAlert } from '../data/redux/displayComponents/displayComponentsActions';
import store from '../data/redux/store';


class SimilarErrorsModal extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            similarErrors: []
        }

        this.loadErrorsToState = this.loadErrorsToState.bind(this);
        this.isEverythingChecked = this.isEverythingChecked.bind(this);
        this.onBoxAllChange = this.onBoxAllChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onElementCheckChange = this.onElementCheckChange.bind(this);
    }

    componentDidMount() {
        this.loadErrorsToState();
    }

    shouldComponentUpdate(nextProps, nextState){
        if(this.state.similarErrors.length !== nextState.similarErrors.length) return true;

        for (let i = 0; i < this.state.similarErrors.length; i++) {
            if(this.state.similarErrors[i].checked !== nextState.similarErrors[i].checked) return true;       
        }

        return false;
    }

    render() { 
        if(!this.props.error) return <p>No similar errors found!</p>
        if(this.state.similarErrors.length <= 0) return <p>Loading...</p>

        return (
            <div id='SimilarErrorsModal'>
                <div className='modal'>

                    <div className='modal-header'>
                        <h1 className='modal-header-title'>{this.getTitle()}</h1>
                        <a className='modal-header-close' onClick={this.props.close}/>
                    </div>

                    <div className='modal-contents'>
                        <table className='modal-contents-table'>
                            <thead>
                                <tr>
                                    <th id='modal-contents-table__checkbox'>
                                        <input
                                            type='checkbox'
                                            onChange={this.onBoxAllChange}
                                            checked={this.isEverythingChecked()}
                                        />
                                    </th>
                                    <th>Message</th>
                                    <th>Username</th>
                                    <th>Game Version</th>
                                </tr>
                            </thead>

                            <tbody>
                                {this.state.similarErrors.map(err => (
                                    <CheckableError
                                        key={err._id}
                                        error={err}
                                        onElementCheckChange={this.onElementCheckChange}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button className='button-opaque'onClick={this.onSubmit}>Save</button>
                </div>
            </div>
        );
    }

    loadErrorsToState() {
        if(!this.props.error || this.props.error.message.length <= 0) return;

        const encodedMessage = encodeURIComponent(this.props.error.message);
        getSimilarErrors(this.props.error._id, encodedMessage)
            .then(data => {
                if(data && data.length > 0) {
                    const formattedErrors = data.map(error => { return {...error, checked: false} });
                    this.setState({ similarErrors: formattedErrors });
                }
                else 
                    this.setState({ similarErrors: [] });
            })
            
            .catch(err => console.error(err));
    };

    onBoxAllChange(e) {
        const isEverythingCheckedResult = this.isEverythingChecked();

        const updatedSimilarErrors = this.state.similarErrors.map(error => {
            return {
                ...error,
                checked: !isEverythingCheckedResult
            }
        });

        this.setState({ similarErrors: updatedSimilarErrors });
    }

    isEverythingChecked() {
        for (let i = 0; i < this.state.similarErrors.length; i++) {
            const error = this.state.similarErrors[i];
            if(!error.checked) return false;
        }

        return true;
    }

    onSubmit(e) {
        e.preventDefault();

        const checkedIds = [];

        this.state.similarErrors.forEach(err => {
            if(err.checked) checkedIds.push(err._id);
        });

        this.getDedicatedQuery(checkedIds)
            .then(result => {

                if(result) {
                    store.dispatch(addAlert('success', `Checked errors ${this.getComponentAction() + 'd'} successfully!`));

                    this.props.onSuccessfulSubmit();
                }
                
                else store.dispatch(addAlert('error', ` Error encountered while trying to  ${this.getComponentAction()} the errors.`));
            })
            .catch(err => {
                store.dispatch(addAlert('error', ` Error encountered while trying to  ${this.getComponentAction()} the errors.`));
                console.error(err);
            });

        this.props.close();
    }

    getDedicatedQuery(checkedIds) {
        //Child implementation
        throw new Error('Missing child submit implementation');
    }

    getComponentAction() {
        //Child implementation
        throw new Error('Missing child submit implementation');
    }

    getTitle() {
        //Child implementation
        throw new Error('Missing child submit implementation');
    }

    onElementCheckChange(errorId) {
        const updatedSimilarErrors = [...this.state.similarErrors];
        const updatedError = {...updatedSimilarErrors.find(error => error._id === errorId)};
        const filteredSimilarErrors = updatedSimilarErrors.filter(e => e._id !== errorId);
        
        updatedError.checked = !updatedError.checked;
        filteredSimilarErrors.push(updatedError);

        this.setState({ similarErrors: filteredSimilarErrors });
    }
}

export default SimilarErrorsModal;