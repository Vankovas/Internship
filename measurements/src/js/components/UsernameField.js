import React, { Component } from 'react';
import { debounce } from 'lodash';

import { retrieveUsernameExistentialStatus } from '../data/connectionHelper';
import not_correct_svg from '../../img/cancel.svg';
import loading_svg from '../../img/sync.svg';
import correct_svg from '../../img/check_circle.svg';

class UsernameField extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: '',
			status: 'loading',
        };
        
        this.getUsernameDebounced = debounce(this.getUsernameExistentialStatus, 1000, {
            leading: false,
            trailing: true,
        });

        this.onChangeUsernameInput = this.onChangeUsernameInput.bind(this);
    }

	render() {
		return (
			<div id='UsernameField' >
				<label htmlFor='username'>Username</label>
				<input type='text' onChange={ this.onChangeUsernameInput }/>
                { this.state.value !== '' &&
                    <img className='username-field__status' src={this.getImageSourceBasedOnCurrentStatus()}/>
                }
			</div>
		);
    }

    getUsernameExistentialStatus() {
        retrieveUsernameExistentialStatus(this.state.value)
            .then(result => {
                const newState = {};
                if(result === true) newState.status = 'correct';
                else newState.status = 'not correct';

                this.setState(newState);
            });
    }
    
    onChangeUsernameInput(e) {
        const newState = { value: e.target.value };
        if(status !== 'loading') newState.status = 'loading';
        this.setState(newState, this.getUsernameDebounced);
    }

    getImageSourceBasedOnCurrentStatus() {
        if(this.state.status === 'correct') return correct_svg;
        else if(this.state.status === 'not correct') return not_correct_svg;
        else return loading_svg; 
    }
}

export default UsernameField;