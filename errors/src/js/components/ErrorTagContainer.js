import React from 'react';
import { connect } from 'react-redux';
import { union } from 'lodash';

import ErrorTag from './ErrorTag';
import { getConfiguration, saveConfiguration } from '../data/connectionHelper';
import { updateConfiguration, deleteErrorTag, newErrorTag, setInitialState } from '../data/redux/configuration/configurationActions';
import { addAlert } from '../data/redux/displayComponents/displayComponentsActions';
import store from '../data/redux/store';

class ErrorTagContainer extends React.Component {
    constructor() {
        super();

        this.state = {
            isLoading: false,
        };

        this.loadLatestConfiguration = this.loadLatestConfiguration.bind(this);
        this.onAddTagToConfigurationClick = this.onAddTagToConfigurationClick.bind(this);
        this.saveThisConfiguration = this.saveThisConfiguration.bind(this);
    }

    componentDidMount() {
        this.loadLatestConfiguration();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.state.isLoading !== nextState.isLoading) return true
        if (this.props.configuration !== nextProps.configuration) return true;
        
        if(this.props.configuration && this.props.configuration.taggedErrors && nextProps.configuration && nextProps.configuration.taggedErrors) {
            if(this.props.configuration.taggedErrors.length !== this.props.configuration.taggedErrors.length) return true;
            else {
                for (let i = 0; i < this.props.configuration.taggedErrors.length; i++) {
                    const currentElement = this.props.configuration.taggedErrors[i];
                    const nextElement = nextProps.configuration.taggedErrors[i];
                    const keys = union(Object.keys(currentElement), Object.keys(nextElement));

                    for (let j = 0; j < keys.length; j++) {
                        const key = keys[j];
                        if(currentElement[key] !== nextElement[key]) return true;
                    }
                }
            }
        }



        return false;
    }

    render() {
        if(!this.props.configuration) return null;
        if(!this.props.configuration.taggedErrors) return null;

        return (
            <div id='ErrorTagContainer'>
                <div className='error-tagging-content'>
                    <div className='error-tagging-content-header'>
                            <p id='justify-self-left'>message</p>
                            <p></p>
                            <p>ignored</p>
                            <p>prioritized</p>
                            <p>delete</p>
                    </div>

                    <div className='error-tagging-content-tags'>
                        {this.props.configuration.taggedErrors.length > 0 && this.renderTags()}
                    </div>
                </div>

                <div className='error-tagging-controls'>
                    <div className='error-tagging-controls-left-panel'>
                        <button
                            className='button-transparent button-narrow'
                            onClick={this.onAddTagToConfigurationClick}
                            id='error-add-tag'>
                            +
                        </button>
                    </div>
                    <div className='error-tagging-controls-right-panel'>
                        <button className='button-opaque button-wide' onClick={this.saveThisConfiguration} id='error-save-configuration'>
                            save new configuration
                        </button>
                        <button className='button-transparent button-wide' onClick={this.loadLatestConfiguration} id='error-reset-configuration'>
                            reset
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    renderTags() {
        return this.props.configuration.taggedErrors.map(taggedError => {
            return <ErrorTag
                key={taggedError.uuid}
                errorId={taggedError.uuid}
                onErrorTagDeleteHandler={this.onErrorTagDeleteHandler}
            />
        });
    }

    loadLatestConfiguration() {
        store.dispatch(setInitialState());
        this.setState({
            isLoading:true
        }, 

        () => {
            getConfiguration()
                .then(data => {
                    if(data)
                        store.dispatch(updateConfiguration(data));

                    this.setState({ isLoading: false });
                })
                .catch(err => console.error(err));
        });
    }

    saveThisConfiguration() {
        const taggedErrors = [...this.props.configuration.taggedErrors]

        saveConfiguration(taggedErrors)
            .then(data => {
                if(data && data.data) store.dispatch(addAlert('success', data.data.message));
            })
            .catch(err => console.error(err));        
    }

    onErrorTagDeleteHandler(id) {
        store.dispatch(deleteErrorTag(id));
    }

    onAddTagToConfigurationClick(e) { 
        store.dispatch(newErrorTag());
    }
}

const mapStateToProps = (state) => ({
    configuration: state.configuration
});

export default connect(mapStateToProps)(ErrorTagContainer);