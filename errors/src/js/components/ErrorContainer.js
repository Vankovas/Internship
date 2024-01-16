import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import Error from './Error';
import ErrorDetail from './ErrorDetail';
import ErrorTagContainer from './ErrorTagContainer';

import ResolveSimilarErrorsModal from './ResolveSimilarErrorsModal';
import DeleteSimilarErrorsModal from './DeleteSimilarErrorsModal';

import { getErrorDetails, getNewAndUniqueErrors, getErrors, getSimilarErrors, postResolveErrors, postDeleteErrors, getGames, getQuerySummary } from '../data/connectionHelper';

import { updateErrors, setInitialState } from '../data/redux/error/errorActions';
import { addAlert } from '../data/redux/displayComponents/displayComponentsActions';
import store from '../data/redux/store';


class ErrorContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            //Variables
            detailedError: undefined,
            similarErrorsModalError: null,
            similarErrorsModalAction: null,
            startDate: moment(),
            endDate: moment().add(1, 'days'),
            username: '',
            gameId: 0,
            resolved: 'any',
            ignored: 'any',
            priority: 'any',
            uniqueFields: {
                message: false,
                gameVersion: false
            },
            games: [],
            querySummary: {
                totalDocuments: 0,
                queryDocuments: 0,
                uniqueUsers: 0,
                solvedErrors: 0,
                ignoredErrors: 0,
                prioritizedErrors: 0,
            },

            //Views
            isDetailedView: false,
            isErrorTaggingView: false,
            isLoading: false,
            isSimilarErrorsModalView: false,

        };

        this.onGetErrorsClick = this.onGetErrorsClick.bind(this);
        this.onErrorOpenClick = this.onErrorOpenClick.bind(this);
        this.retrieveErrors = this.retrieveErrors.bind(this);
        this.getStartDate = this.getStartDate.bind(this);
        this.getStartTime = this.getStartTime.bind(this);
        this.getEndDate = this.getEndDate.bind(this);
        this.getEndTime = this.getEndTime.bind(this);
        this.validateQueryFields = this.validateQueryFields.bind(this);
        this.renderSimilarErrorsModal = this.renderSimilarErrorsModal.bind(this);
        this.onErrorResolveClick = this.onErrorResolveClick.bind(this);
        this.onErrorDeleteClick = this.onErrorDeleteClick.bind(this);
        this.retrieveNewAndUniqueErrors = this.retrieveNewAndUniqueErrors.bind(this);
        this.retrieveGames = this.retrieveGames.bind(this);
        this.resetUserInputFields = this.resetUserInputFields.bind(this);
        this.onChangeStartDate = this.onChangeStartDate.bind(this);
        this.onChangeStartTime = this.onChangeStartTime.bind(this);
        this.onChangeEndDate = this.onChangeEndDate.bind(this);
        this.onChangeEndTime = this.onChangeEndTime.bind(this);
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangeGameId = this.onChangeGameId.bind(this);
        this.onChangeResolved = this.onChangeResolved.bind(this);
        this.onChangeIgnored = this.onChangeIgnored.bind(this);
        this.onChangePriority = this.onChangePriority.bind(this);
        this.onClickUniqueMessage = this.onClickUniqueMessage.bind(this);
        this.onClickUniqueGameVersion = this.onClickUniqueGameVersion.bind(this);
        this.resetUserInputFields = this.resetUserInputFields.bind(this);
        this.onGetNewAndUniqueErrorsClick = this.onGetNewAndUniqueErrorsClick.bind(this);
        this.onToggleErrorTaggingClick = this.onToggleErrorTaggingClick.bind(this);
        this.onGoBackFromErrorDetailedViewClick = this.onGoBackFromErrorDetailedViewClick.bind(this);
        this.onToggleSimilarErrorsModalClick = this.onToggleSimilarErrorsModalClick.bind(this);
    }

    componentDidMount() {
        this.retrieveNewAndUniqueErrors();
        this.retrieveGames();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.state.isLoading !== nextState.isLoading) return true;
        if(this.state.isSimilarErrorsModalView !== nextState.isSimilarErrorsModalView) return true;
        if(this.state.isErrorTaggingView !== nextState.isErrorTaggingView) return true;
        if(this.state.isDetailedView !== nextState.isDetailedView) return true;

        if(!this.state.startDate.isSame(nextState.startDate)) return true;
        if(!this.state.endDate.isSame(nextState.endDate)) return true;
        if(this.state.username !== nextState.username) return true;
        if(this.state.gameId !== nextState.gameId) return true;
        if(this.state.resolved !== nextState.resolved) return true;
        if(this.state.ignored !== nextState.ignored) return true;
        if(this.state.priority !== nextState.priority) return true;
        if(this.state.uniqueFields.message !== nextState.uniqueFields.message) return true;
        if(this.state.uniqueFields.gameVersion !== nextState.uniqueFields.gameVersion) return true;
        if(this.state.modalErrors !== nextState.modalErrors) return true;
        if(this.state.games.length !== nextState.games.length) return true;

        if(this.props.errors.length !== nextProps.errors.length) return true;
        for (let i = 0; i < this.props.errors.length; i++) {
            if(this.props.errors[i]._id !== nextProps.errors[i]._id) return true;
            if(this.props.errors[i].isIgnored !== nextProps.errors[i].isIgnored) return true;
            if(this.props.errors[i].hasPriority !== nextProps.errors[i].hasPriority) return true;
        }

        const querySummaryKeys = Object.keys(this.state.querySummary);
        for (let j = 0; j < querySummaryKeys.length ; j++) {
            const key = querySummaryKeys[j];
            const currentElement = this.state.querySummary[key];
            const nextElement = nextState.querySummary[key];
            if(currentElement !== nextElement) return true;
        }

        return false;
    }

    render() {
        if(!this.props.errors) return null;

        return (
            <div id='ErrorContainer'>
                {this.state.isSimilarErrorsModalView && this.state.similarErrorsModalError !== null && this.renderSimilarErrorsModal()}

                <div className='left-panel'>
                    <div className='left-panel__group'>
                        <p className='primary-color font-thin'>search filter</p>
                    </div>

                    <div className='left-panel__group time-grid-group'>
                        <label htmlFor='startDate' className='secondary-color'>Start</label>
                        <input type='date' id='startDate' value={this.getStartDate()} onChange={this.onChangeStartDate} />
                        <input type='time' id='startTime' value={this.getStartTime()} onChange={this.onChangeStartTime} />
                    </div>

                    <div className='left-panel__group time-grid-group'>
                        <label htmlFor='endDate' className='secondary-color'>End</label>
                        <input type='date' id='endDate' value={this.getEndDate()} onChange={this.onChangeEndDate} />
                        <input type='time' id='endtTime' value={this.getEndTime()} onChange={this.onChangeEndTime} />
                    </div>

                    <div className='left-panel__group'>
                        <label htmlFor='username' className='secondary-color'>Username</label>
                        <input type='text' id='username' value={this.state.username} onChange={this.onChangeUsername} />
                    </div>

                    <div className='left-panel__group'>
                        <label htmlFor='gameId' className='secondary-color'>Game</label>
                        <select id='gameId' value={this.state.gameId} onChange={this.onChangeGameId}>
                            <option className='select-option-field' key={`game${0}`} value={0}>any</option>
                            {this.renderGameOptions()}
                        </select>
                    </div>

                    <div className='left-panel__group'>
                        <label htmlFor='resolved' className='secondary-color'>Resolved Errors</label>
                        <select value={this.state.resolved} onChange={this.onChangeResolved}>
                            <option key='any-resolved' className='select-option-field' value='any'>any</option>
                            <option key='only-resolved' className='select-option-field' value='only resolved'>only resolved</option>
                            <option key='only-nonresolved' className='select-option-field' value='only non-resolved'>only non-resolved</option>
                        </select>
                    </div>

                    <div className='left-panel__group'>
                        <label htmlFor='ignored' className='secondary-color'>Ignored Errors</label>
                        <select value={this.state.ignored} onChange={this.onChangeIgnored}>
                            <option key='any-ignored' className='select-option-field' value='any'>any</option>
                            <option key='only-ignored' className='select-option-field' value='only ignored'>only ignored</option>
                            <option key='any-nonignored' className='select-option-field' value='only non-ignored'>only non-ignored</option>
                        </select>
                    </div>

                    <div className='left-panel__group'>
                        <label htmlFor='priority' className='secondary-color'>
                            Priority Errors
                        </label>
                        <select value={this.state.priority} onChange={this.onChangePriority}>
                            <option key='any-priority' className='select-option-field' value='any'>any</option>
                            <option key='only-priority' className='select-option-field' value='only priority'>only priority</option>
                            <option key='only-nonpriority' className='select-option-field' value='only non-priority'>only non-priority</option>
                        </select>
                    </div>

                    <div className='left-panel__group'>
                        <label htmlFor='unique-message' className='secondary-color'>Unique by</label>
                        <button
                            className={'button-transparent' + (this.state.uniqueFields.message ? '-selected' : '') + ' button-narrow'}
                            onClick={this.onClickUniqueMessage}
                        >
                            message
                        </button>
                        <button
                            className={'button-transparent' + (this.state.uniqueFields.gameVersion ? '-selected' : '') + ' button-narrow'}
                            onClick={this.onClickUniqueGameVersion}
                        >
                            game version
                        </button>
                    </div>

                    <div className='left-panel__group'>
                        <button onClick={this.onGetErrorsClick} className='button-opaque button-wide'>search</button>
                        <button onClick={this.resetUserInputFields} className='button-transparent button-wide'>clear</button>
                    </div>

                    <div className='left-panel__group'>
                        <button className='button-opaque button-wide margin-side-auto' onClick={this.onGetNewAndUniqueErrorsClick}>load new and unique errors</button>
                    </div>

                    <div id='summary' className='left-panel__group'>{ this.renderQuerySummary() }</div>
                </div>

                <div className='right-panel'>

                    <div className='right-panel__group manage-tags-group'>
                        <div className='manage-tags-group__header'>
                            <p className='primary-color font-thin'>manage tags</p>
                            <button
                                className={(this.state.isErrorTaggingView ? 'button-opaque' : 'button-transparent') + ' button-wide'}
                                onClick={this.onToggleErrorTaggingClick}>
                                {this.state.isErrorTaggingView ? 'collapse' : 'expand'}
                            </button>
                        </div>

                        { this.state.isErrorTaggingView && 
                            <div className='manage-tags-group__content'>
                                <ErrorTagContainer />
                            </div>
                        }
                    </div>

                    <div className='right-panel__group'>
                        <p className='primary-color font-thin'>search results</p>
                    </div>

                    <div id='error-wrapper' className='right-panel__group display-block'>
                        {this.state.isDetailedView && <div id='btn-go-back'><button className='button-opaque button-wide' onClick={this.onGoBackFromErrorDetailedViewClick}>go back</button></div>}

                        {this.state.isLoading && <p id='p-loading'>loading...</p>}

                        {this.state.isDetailedView && !this.state.isLoading && this.renderErrorDetails()}

                        {!this.state.isDetailedView && !this.state.isLoading && this.renderErrorSummary()}
                </div>

                </div>
            </div>
        );
    }

    renderSimilarErrorsModal() {
        
        if (this.state.similarErrorsModalAction === 'resolve') {
            return(
                <ResolveSimilarErrorsModal
                    error={this.state.similarErrorsModalError}
                    close={this.onToggleSimilarErrorsModalClick}
                    onSuccessfulSubmit={this.retrieveNewAndUniqueErrors}
                />
            );
        }

        else if (this.state.similarErrorsModalAction === 'delete') {
            return(
                <DeleteSimilarErrorsModal
                    error={this.state.similarErrorsModalError}
                    close={this.onToggleSimilarErrorsModalClick}
                    onSuccessfulSubmit={this.retrieveNewAndUniqueErrors}
                />
            );
        }

        else return null;

    }

    retrieveNewAndUniqueErrors() {
        this.setState({ 
            isLoading: true,
            isDetailedView: false 
        }, 
        
        () => {
            getNewAndUniqueErrors()
                .then(errors => {
                    if(errors) {
                        const distinctErrorList = errors.distinctErrorList;
                        store.dispatch(updateErrors(distinctErrorList));
                        this.retrieveQuerySummary(true);
                    }
                    else {
                        store.dispatch(setInitialState());
                    }

                    this.setState({ isLoading: false });
                    
                })

                .catch(err => console.error(err));
        });
    }

    retrieveErrors() {
        this.setState({ 
            isLoading: true,
            isDetailedView: false 
        }, 
        
        () => {
            const queryFields = this.validateQueryFields();
            if(queryFields) {
                getErrors(queryFields)
                .then(errors => {

                    if(errors && errors.length > 0) {
                        store.dispatch(updateErrors(errors));
                        this.retrieveQuerySummary(false, queryFields);
                    }
                    else {
                        store.dispatch(setInitialState());
                    }

                    this.setState({ isLoading: false });
                    
                })

                .catch(err => console.error(err));
            }
        });
    }

    renderQuerySummary() {
        const summaryModel = {
            totalDocuments: 'total errors',
            queryDocuments: 'errors found',
            uniqueUsers: 'unique users found',
            solvedErrors: 'resolved errors found',
            ignoredErrors: 'ignored errors found',
            prioritizedErrors: 'priority errors found',
        };

        return Object.keys(this.state.querySummary).map(key =>  (
            <div key={key} className='summary-field'>
                <p className='summary-field__content'>{this.state.querySummary[key]}</p>
                <p className='summary-field__title'>{summaryModel[key]}</p>
            </div>
        ));
    }

    retrieveQuerySummary(newAndUnique, queryFields) {
        let method = undefined;
        if(newAndUnique === true) method = getQuerySummary(true);
        else if(newAndUnique === false && queryFields !== undefined) method = getQuerySummary(false, queryFields );
        else return this.resetQuerySummary();

        method.then(result => {
            if(!result) return this.resetQuerySummary();
            let data = result;
            data = newAndUnique === true ? result['distinctErrorListSummary'] : result;

            const querySummary = {
                totalDocuments: data.totalDocuments,
                queryDocuments: data.queryDocuments,
                uniqueUsers: data.uniqueUsers,
                solvedErrors: data.solvedErrors,
                ignoredErrors: data.ignoredErrors,
                prioritizedErrors: data.prioritizedErrors,
            };
            this.setState({ querySummary: querySummary });
        })
        .catch(err => console.error(err));
    }

    resetQuerySummary() {
        const querySummary = {
            totalDocuments: 0,
            queryDocuments: 0,
            uniqueUsers: 0,
            solvedErrors: 0,
            ignoredErrors: 0,
            prioritizedErrors: 0,
        };
        this.setState({ querySummary });
    }

    validateQueryFields() {
        if(!this.state.startDate.isValid()) store.dispatch(addAlert('Error', 'Start Date is invalid!'));
        if(!this.state.endDate.isValid()) store.dispatch(addAlert('Error', 'End Date is invalid!'));
            
        const queryFields = {};

        if(!this.state.ignoreDate) {
            queryFields.startDate = this.state.startDate.toLocaleString();
            queryFields.endDate = this.state.endDate.toLocaleString();
        }

        if(this.state.username.length > 0)
            queryFields.username = this.state.username;

        if(this.state.gameId > 0)
            queryFields.gameId = parseInt(this.state.gameId);

        if(this.state.resolved === 'only resolved')
            queryFields.resolved = true
        else if(this.state.resolved === 'only non-resolved')
            queryFields.resolved = false;

        if(this.state.ignored === 'only ignored')
            queryFields.ignored = true
        else if(this.state.ignored === 'only non-ignored')
            queryFields.ignored = false;

        if(this.state.priority === 'only priority')
            queryFields.priority = true
        else if(this.state.priority === 'only non-priority')
            queryFields.priority = false;

        if(this.state.uniqueFields && this.state.uniqueFields.message === true || this.state.uniqueFields.gameVersion === true) {
            queryFields.uniqueFields = [];

            for (const key in this.state.uniqueFields) {
                    const element = this.state.uniqueFields[key];
                    if(element === true) queryFields.uniqueFields.push(key);
            }
        }
        
        return queryFields;
    }

    renderErrorSummary() {
        if(!this.props) return null;
        if(!this.props.errors || !this.props.errors.length) return <p id='p-no-errors-found'>no errors found for the specified criteria.</p>;

        const testArray = [];
        const testSet = new Set();

        for (let i = 0; i < this.props.errors.length; i++) {
            const element = this.props.errors[i];
            testArray.push(element._id);
            testSet.add(element._id);
        }

        return this.props.errors.map(error => {
            return (
                <Error
                    key={error._id}
                    error={error}
                    open={this.onErrorOpenClick}
                    resolve={this.onErrorResolveClick}
                    delete={this.onErrorDeleteClick}
                />
            );
        });
    }

    renderErrorDetails() {
        if(!this.props) return null;
        if(!this.state.detailedError) return <p>A problem occured while trying to fetch the error details</p>

        return (<ErrorDetail detailedError={this.state.detailedError} />);
    }

    retrieveGames() {
        getGames()
            .then(games => {
                if (games && games.data) this.setState({ games: games.data });
                else store.dispatch(addAlert('Error', 'Games could not be retrieved from the server!'));
            })
            .catch(err => {
                console.error(err);
            })
    }

    renderGameOptions() {
        if(!this.state.games && this.state.games <= 0) return null;
        return this.state.games.map(game => <option className='select-option-field' key={`game${game.id}`} value={game.id}>{game.name}</option>)
    }

    retrieveErrorDetails(errorId) {
        this.setState({ 
            isLoading: true,
        }, 
        
        () => {
            getErrorDetails(errorId)

                .then(data => {
                    let detailedError = undefined;

                    if(data) detailedError = data;

                    this.setState({ 
                        detailedError: detailedError,
                        isDetailedView: true,
                        isLoading: false
                    });
                })

                .catch(err => console.error(err));
        });
    }

    resetUserInputFields() {
        const newState = {
            startDate: moment(),
            endDate: moment().add(1, 'days'),
            username: '',
            gameId: 0,
            resolved: 'any',
            ignored: 'any',
            priority: 'any',
            uniqueFields: {
                message: false,
                gameVersion: false
            }
        };
        this.setState({ ...newState });
    }

    onGetErrorsClick() {
        this.retrieveErrors();
    }

    onGetNewAndUniqueErrorsClick() {
        this.retrieveNewAndUniqueErrors();
    }

    onErrorOpenClick(id) {
        this.retrieveErrorDetails(id);
    }

    onToggleTaggedViewClick() {
        this.setState({ isErrorTaggingView: !this.state.isErrorTaggingView });
    }

    getStartDate() {
        return moment(this.state.startDate).format('YYYY-MM-DD');
    }

    onChangeStartDate(e) {
        //Set the date
        const date = moment(e.target.value);
        //Keep previous hours:minutes
        date.hour(this.state.startDate.hours())    
        date.minutes(this.state.startDate.minutes());

        this.setState({ startDate: date });
    }

    getStartTime() {
        return moment(this.state.startDate).format('HH:mm');
    }

    onChangeStartTime(e) {
        const date = moment(this.state.startDate);
        const time = e.target.value;
        date.hours(time.split(':')[0]);
        date.minutes(time.split(':')[1]);
        this.setState({ startDate: date });
    }

    getEndDate() {
        return moment(this.state.endDate).format('YYYY-MM-DD');
    }

    onChangeEndDate(e) {
         //Set the date
        const date = moment(e.target.value);
        //Keep previous hours:minutes
        date.hour( this.state.endDate.hours())    
        date.minutes(this.state.endDate.minutes());

        this.setState({ endDate: date });
    }

    getEndTime() {
        return moment(this.state.endDate).format('HH:mm');
    }

    onChangeEndTime(e) {
        const date = moment(this.state.endDate);
        const time = e.target.value;
        date.hours(time.split(':')[0]);
        date.minutes(time.split(':')[1]);
        this.setState({ endDate: date });
    }

    onChangeUsername(e) {
        this.setState({ username: e.target.value });
    }

    onChangeGameId(e) {
        this.setState({ gameId: e.target.value});
    }

    onChangeResolved(e) {
        this.setState({ resolved: e.target.value});
    }

    onChangeIgnored(e) {
        this.setState({ ignored: e.target.value});
    }

    onChangePriority(e) {
        this.setState({ priority: e.target.value});
    }

    onClickUniqueMessage(e) {
        const uniqueFields = {...this.state.uniqueFields, message: !this.state.uniqueFields.message };
        this.setState({ uniqueFields: uniqueFields });
    }

    onClickUniqueGameVersion(e) {
        const uniqueFields = {...this.state.uniqueFields, gameVersion: !this.state.uniqueFields.gameVersion };
        this.setState({ uniqueFields: uniqueFields });
    }

    onErrorResolveClick(error) {
        postResolveErrors([error._id])
        .then(result => {
            if(result) {
                store.dispatch(addAlert('success', 'Error resolved successfuly!'));
                return true;
            }
            else return false;
        })
        .then(result => {
            if(result === true) {
                //Check for similar errors which are not resolved
                const encodedMessage = encodeURIComponent(error.message);
                return getSimilarErrors(error._id, encodedMessage);
            }
            else return [];
        })
        .then(similarErrors => {
            //If we find similar errors similar errors popup modal view and populate the info.
            if (similarErrors.length > 0)  {
                this.setState({ 
                    similarErrorsModalAction: 'resolve',
                    similarErrorsModalError: error,
                    isSimilarErrorsModalView: true
                });
            }
            //Reset state
            else {
                this.setState({ 
                    similarErrorsModalAction: null,
                    similarErrorsModalError: null,
                    isSimilarErrorsModalView: false
                });
            }
        })
        .catch(err => {
            store.dispatch(addAlert('error', 'Error encountered while trying to resolve the chosen error, check the console!'));
            console.error(err);
        });
    }

    onErrorDeleteClick(error) {
        postDeleteErrors([error._id])
        .then(result => {
            if(result) {
                store.dispatch(addAlert('success', 'Error deleted successfuly!'));
                return true;
            }
            else return false;
        })
        .then(result => {
            if(result === true) {
                //Check for similar errors
                const encodedMessage = encodeURIComponent(error.message);
                return getSimilarErrors(error._id, encodedMessage);
            }
            else return [];
        })
        .then(similarErrors => {
            //If we find similar errors similar errors popup modal view and populate the info.
            if (similarErrors.length > 0)  {
                this.setState({ 
                    similarErrorsModalAction: 'delete',
                    similarErrorsModalError: error,
                    isSimilarErrorsModalView: true
                });
            }
            //Reset state
            else {
                this.setState({ 
                    similarErrorsModalAction: null,
                    similarErrorsModalError: null,
                    isSimilarErrorsModalView: false
                });
            }
        })
        .catch(err => console.error(err));
    }

    onToggleErrorTaggingClick() {
        this.setState({ isErrorTaggingView: !this.state.isErrorTaggingView });
    }

    onGoBackFromErrorDetailedViewClick() {
        this.setState({ isDetailedView : false });
    }

    onToggleSimilarErrorsModalClick() {
        this.setState({ isSimilarErrorsModalView: !this.state.isSimilarErrorsModalView });
    }
}

const mapStateToProps = (state) => ({
    errors: state.errors
});

export default connect(mapStateToProps)(ErrorContainer);
