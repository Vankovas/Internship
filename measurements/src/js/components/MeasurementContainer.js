import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import Select from 'react-select';

import ChartContainer from './ChartContainer';
import RangedInput from './RangedInput';
import UsernameField from './UsernameField';
import TableBuilder from './TableBuilder';
import { retrieveMeasurementsWithParameters, retrieveMeasurementDetails, retrieveDistinctBrowserNameFields, retrieveDistinctOriginFields, retrieveReportFieldKeys, retrieveGames } from '../data/connectionHelper';
import { convertArrayOfObjectsToCSV, saveCSVToPC } from '../../../../common/util/csvExporter';
import { formatDateToCommonDateString } from '../../../../common/util/timestampFormatter';

import store from '../data/redux/store';
import { updateMeasurements, setInitialState } from '../data/redux/measurement/measurementActions';

import arrow_back from '../../img/arrow_back.svg';
import arrow_forward from '../../img/arrow_forward.svg';
import checkbox_checked from '../../img/check_box-checked.svg';
import checkbox_unchecked from '../../img/check_box_unchecked.svg';
import ziango_logo from '../../img/ziango_logo_small.png';

class MeasurementContainer extends React.Component {
    constructor() {
        super();

        this.state = {
            //Views
            isDetailedView: false,
            isLoading: false,

            //Data
            games: [],
            origins: [],
            browserNames: [],
            reportFieldKeys: [],
            detailedMeasurement: undefined,
            measurementFormat: undefined,
            measurementSource: undefined,
            measurementTarget: undefined,

            //User Input Fields
            queryType: 'table',
            queryPieReports: false,
            queryReports: false,
            startDate: moment().hours(0).minutes(0).seconds(0).milliseconds(0),
            endDate: moment().add(1, 'days').hours(0).minutes(0).seconds(0).milliseconds(0),
            selectedBrowsers: null,
            selectedOrigins: null,
            selectedGames: null,
            averageFps: [],
            numberOfFriends: [],
            numberOfFriendsOnline: [],
            numberOfPrivateChats: [],
            numberOfPlayersInRoom: [],
            groupTimeField: '',
            numberCalculationFields: [],
            graphType: '',
            graphSubType: '',
        };
 
        this.retrieveFieldData = this.retrieveFieldData.bind(this);
        this.getGroupTimeFields = this.getGroupTimeFields.bind(this);
        this.updateAverageFpsInputValues = this.updateAverageFpsInputValues.bind(this);
        this.updateNumberOfFriendsInputValues = this.updateNumberOfFriendsInputValues.bind(this);
        this.updateNumberOfFriendsOnlineInputValues = this.updateNumberOfFriendsOnlineInputValues.bind(this);
        this.updateNumberOfPrivateChatsInputValues = this.updateNumberOfPrivateChatsInputValues.bind(this);
        this.updateNumberOfPlayersInRoomInputValues = this.updateNumberOfPlayersInRoomInputValues.bind(this);

        this.onClickAddNumberCalculationField = this.onClickAddNumberCalculationField.bind(this);
        this.onClickNumberCalculationFieldDelete = this.onClickNumberCalculationFieldDelete.bind(this);
        this.onClickRunQuery = this.onClickRunQuery.bind(this);
        this.onClickBackFromDetailedView = this.onClickBackFromDetailedView.bind(this);
        this.onClickMeasurementOpen = this.onClickMeasurementOpen.bind(this);
        this.onClickExportToCSV = this.onClickExportToCSV.bind(this);

        this.onChangeGroupTimeField = this.onChangeGroupTimeField.bind(this);
        this.onChangeNumberCalculationFieldName = this.onChangeNumberCalculationFieldName.bind(this);
        this.onChangeNumberCalculationFieldFunction = this.onChangeNumberCalculationFieldFunction.bind(this);
        this.onChangeQueryType = this.onChangeQueryType.bind(this);
        this.onChangeSelectedGames = this.onChangeSelectedGames.bind(this);
        this.onChangeSelectedOrigins = this.onChangeSelectedOrigins.bind(this);
        this.onChangeSelectedBrowsers = this.onChangeSelectedBrowsers.bind(this);
        this.onChangeQueryReports = this.onChangeQueryReports.bind(this);
        this.onChangeGraphType = this.onChangeGraphType.bind(this);
        this.onChangeGraphSubType = this.onChangeGraphSubType.bind(this);
        this.onChangeStartDate = this.onChangeStartDate.bind(this);
        this.onChangeStartTime = this.onChangeStartTime.bind(this);
        this.onChangeEndDate = this.onChangeEndDate.bind(this);
        this.onChangeEndTime = this.onChangeEndTime.bind(this);
    }

    componentDidMount() {
        this.retrieveFieldData();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.isCollapsed !== nextProps.isCollapsed) return true;

        if(this.state.isLoading !== nextState.isLoading) return true;
        if(this.state.isDetailedView !== nextState.isDetailedView) return true;

        if(this.state.graphType !== nextState.graphType) return true;
        if(this.state.graphSubType !== nextState.graphSubType) return true;
        if(this.state.startDate !== nextState.startDate) return true;
        if(this.state.endDate !== nextState.endDate) return true;

        const multiSelectFields = ['selectedBrowsers', 'selectedOrigins', 'selectedGames'];
        for (let i = 0; i < multiSelectFields.length; i++) {
            const fieldKey = multiSelectFields[i];
            const currentElement = this.state[fieldKey];
            const nextElement = nextState[fieldKey];

            if(currentElement === null && nextElement !== null) return true;
            if(currentElement !== null && nextElement === null) return true;

            if(currentElement !== null && nextElement !== null) {
                const currentElementKeys = Object.keys(currentElement);
                const nextElementKeys = Object.keys(nextElement);
    
                if(currentElementKeys.length !== nextElementKeys.length) return true;
    
                for (let j = 0; j < currentElementKeys.length; j++) {
                    const objectKey = currentElementKeys[j];
                    if(currentElement[objectKey] !== nextElement[objectKey]) return true;
                }
            }
        }

        const comparatorFields = ['averageFps', 'numberOfFriends', 'numberOfFriendsOnline', 'numberOfPrivateChats', 'numberOfPlayersInRoom'];
        for (let i = 0; i < comparatorFields.length; i++) {
            const comparatorField = comparatorFields[i];
            const fieldArrayA = this.state[comparatorField];
            const fieldArrayB = nextState[comparatorField];

            if(fieldArrayA.length !== fieldArrayB.length) return true;

            for (let j = 0; j < fieldArrayA.length; j++) {
                const elementA = fieldArrayA[j];
                const elementB = fieldArrayB[j];

                const keysA = Object.keys(elementA);
                const keysB = Object.keys(elementB);

                if(keysA.length !== keysB.length) return true;

                for (let k = 0; k < keysA.length; k++) {
                    const key = keysA[k];
                    if(elementA[key] !== elementB[key]) return true;
                }
            }
        }

        if(this.state.groupTimeField !== nextState.groupTimeField) return true;
        if(this.state.queryType !== nextState.queryType) return true;
        if(this.state.queryReports !== nextState.queryReports) return true;

        if(this.state.games !== nextState.games) return true;
        if(this.state.origins !== nextState.origins) return true;
        if(this.state.browserNames !== nextState.browserNames) return true;
        if(this.state.reportFieldKeys !== nextState.reportFieldKeys) return true;
        if(this.state.measurementFormat !== nextState.measurementFormat) return true;
        if(this.state.measurementSource !== nextState.measurementSource) return true;
        if(this.state.measurementTarget !== nextState.measurementTarget) return true;

        if(this.props.measurements.length !== nextProps.measurements.length) return true;

        this.props.measurements.forEach((obj, index) => {
            if (obj !== nextProps.measurements[index]) return true;
        });

        if(this.state.numberCalculationFields.length !== nextState.numberCalculationFields.length) return true;

        for (let i = 0; i < this.state.numberCalculationFields.length; i++) {
            const currentArray = this.state.numberCalculationFields;
            const newArray = nextState.numberCalculationFields;

            if(currentArray.length !== newArray.length) return true;
            for (const key of Object.keys(currentArray[i])) {
                if(currentArray[i][key] !== newArray[i][key]) return true;
            }
        }

        return false;
    }

    render() {
        return (
            <React.Fragment>
                <div className={`left-panel left-panel${this.props.isCollapsed ? '-collapsed' : '-expanded'}`}>
                    <div id='MeasurementContainer'>
                        
                        <div className={`measurementcontainer-controls measurementcontainer-controls${this.props.isCollapsed ? '-collapsed' : '-expanded'}`}>

                            <div className='measurementcontainer-controls-header'>
                                <div className='measurementcontainer-controls-header-text'>gamepoint<span className='measurementcontainer-controls-header-text-bold'>dashboard</span></div>
                            </div>

                            { this.props.measurements.length > 0 &&
                                <div className='measurementcontainer-controls-group display-flex-evenly'>
                                    <button className='button-transparent button-wide align-self-center' onClick={this.onClickExportToCSV}>Export data to CSV</button>
                                </div>
                            }

                            <div className='measurementcontainer-controls-group display-flex-evenly'>
                                <div className='two-button-div'>
                                    <button className={`button-narrow ${this.state.queryType === 'graph' ? 'button-transparent-selected' : 'button-transparent'}`} value='graph' onClick={this.onChangeQueryType}>Graph Builder</button>
                                    <button className={`button-narrow ${this.state.queryType === 'table' ? 'button-transparent-selected' : 'button-transparent'}`} value='table' onClick={this.onChangeQueryType}>Table Builder</button>
                                </div>
                            </div>

                            {this.state.graphType === 'line' &&
                                <div className='measurementcontainer-controls-group'>
                                    <label className='measurementcontainer-controls-group-query-reports-label' htmlFor='queryReports'>Query Reports (faster)</label>
                                    <img className='measurementcontainer-controls-group-query-reports-checkbox' src={this.state.queryReports ? checkbox_checked : checkbox_unchecked} onClick={this.onChangeQueryReports}/>
                                </div>
                            }

                            {this.renderControls()}

                            {(this.state.numberCalculationFields.length !== 0 || this.state.graphType === 'pie' || this.state.queryType === 'table') && 
                                    <button className='run-query-button button-transparent button-wide' onClick={this.onClickRunQuery}>Run Query</button>
                            }

                            {this.state.isDetailedView === true && 
                                <button onClick={this.onClickBackFromDetailedView}>Go Back</button>
                            }

                        </div>
                        <div onClick={this.props.toggleLeftPanel} className={`measurementcontainer-slider-button measurementcontainer-slider-button${this.props.isCollapsed ? '-collapsed' : '-expanded'}`}>
                            <img src={this.props.isCollapsed ? arrow_forward : arrow_back }/>
                        </div>
                    </div>
                </div>

                <div className='measurementcontainer-contentwrapper'>
                            <div className='measurementcontainer-header'>
                                manage measurements
                            </div>

                            <div className='measurementcontainer-content'>
                            {/* TODO: Detailed View */}
                            {/* {this.state.isDetailedView && <MeasurementDetail detailedMeasurement={this.state.detailedMeasurement} />} */}

                            {this.state.isLoading && <p className='measurementcontainer-measurements__loading'>Loading...</p>}

                            {!this.props.measurements || this.props.measurements.length <= 0 && this.state.isLoading === false && 
                                    <h1 className='measurementcontainer-content__nocontent'>Please customize the filters and run the query for results!</h1>
                            }

                            {this.props.measurements && this.props.measurements.length > 0 && this.state.measurementTarget === 'table' &&
                                <TableBuilder measurements={this.props.measurements} measurementFormat={this.state.measurementFormat} />
                            }

                            {this.props.measurements && this.props.measurements.length > 0 && 
                                (this.state.measurementFormat === 'pie' || this.state.measurementFormat === 'time/number') &&
                                    <ChartContainer measurements={this.props.measurements} measurementFormat={this.state.measurementFormat} measurementSource={this.state.measurementSource}/>
                            }

                            </div>

                            <div className='measurementcontainer-footer'>
                                <img src={ziango_logo}/>
                            </div>
                </div>
                
            </React.Fragment>
        );
    }

    retrieveMeasurements() {
        let measurementFormat;
        if(this.state.graphType === 'pie') measurementFormat = 'pie';
        if(this.state.graphSubType === 'time/number') measurementFormat = 'time/number';

        let measurementSource = 'measurement';
        if(this.state.queryReports === true) measurementSource = 'report';
        if(this.state.queryPieReports === true) measurementSource = 'pie';

        const queryFields = this.validateQueryFields();
        if(!queryFields) return;

        this.setState(
            {
                isLoading: true,
                isDetailedView: false,
            },

            () => {
                retrieveMeasurementsWithParameters(queryFields)
                    .then(data => {
                        const state = {
                            isLoading: false
                        };

                        if(data) {
                            state.measurementFormat = measurementFormat;
                            state.measurementSource = measurementSource;
                            state.measurementTarget = this.state.queryType;
                            this.setState(state, store.dispatch.bind(this, updateMeasurements(data)));
                        }
                        else  {
                            state.measurementFormat = undefined;
                            state.measurementSource = undefined;
                            state.measurementTarget = undefined;
                            this.setState(state);
                        }
                    })
                    .catch(err => console.error(err));
            }
        );
    }

    validateQueryFields() {
        if(!this.state.startDate.isValid()) alert('Error', 'Start Date is invalid!');
        if(!this.state.endDate.isValid()) alert('Error', 'End Date is invalid!');

        const queryFields = {
            queryReports: this.state.queryReports,
        };

        queryFields.startDate = this.state.startDate.toLocaleString();
        queryFields.endDate = this.state.endDate.toLocaleString();

        if(this.state.graphType === 'pie') queryFields.queryPieReports = true;

        if(this.state.selectedGames !== null) 
            queryFields.gameId = this.state.selectedGames.map(({value}) => value);
        
        if(this.state.selectedOrigins !== null)
            queryFields.origin = this.state.selectedOrigins.map(({value}) => value);

        if(this.state.selectedBrowsers !== null)
            queryFields.browserName = this.state.selectedBrowsers.map(({value}) => value);

        if(this.state.groupFields && this.state.groupFields.length > 0) 
            queryFields.groupFields = this.state.groupFields;

        const comparatorFields = ['averageFps', 'numberOfFriends', 'numberOfFriendsOnline', 'numberOfPrivateChats', 'numberOfPlayersInRoom'];
        for (const el of comparatorFields) {
            if(this.state[el].length > 0) queryFields[el] = this.state[el];
        }
        
        if(this.state.groupTimeField !== '')
            queryFields.groupFields = this.getGroupTimeFields();
        else if(this.state.queryReports === true && this.state.queryType === 'graph')
            queryFields.groupFields = this.getGroupTimeFields('day');

        
        if(this.state.numberCalculationFields.length > 0) {
            const groupCalculationFieldObject = {};
            this.state.numberCalculationFields.forEach(obj => groupCalculationFieldObject[obj.name] = obj.function);
            if(this.state.queryReports === true) {
                Object.keys(groupCalculationFieldObject).forEach(key => {
                    if(!key.includes('averageFps')) return;
                    let newKey;
                    //Process the keys for the count of grouped measurements of the reports
                    if(key === 'averageFps') newKey = 'measurementsConsolidated';
                    else newKey = key.replace('averageFps', 'amountOfMeasurements');
                    //Add the fields to the query
                    groupCalculationFieldObject[newKey] = 'sum';
                })
            }
            queryFields.groupCalculationFieldObject = JSON.stringify(groupCalculationFieldObject);
        }

        return Object.keys(queryFields).length > 0 ? queryFields : null;
    }

    getGroupTimeFields(field) {
        const groupTimeFieldArray = [];
        const groupTimeFieldNames = ['year', 'month', 'week', 'day', 'hour'];
        const groupTimeFieldIndex = groupTimeFieldNames.indexOf(field || this.state.groupTimeField);

        for (let i = 0; i <= groupTimeFieldIndex; i++) {
            const element = groupTimeFieldNames[i];
            groupTimeFieldArray.push(element);
        }
        
        return groupTimeFieldArray;
    }

    renderControls() {
        if(this.state.queryType !== 'graph' && this.state.queryType !== 'table' && this.state.queryReports !== true) return this.renderSharedMeasurementControls();
        if(this.state.queryType === 'graph') return this.renderGraphQueryControls();
        if(this.state.queryType === 'table') return this.renderTableQueryControls();
    }

    renderGraphQueryControls() {
        return (
            <React.Fragment>
                <div className='measurementcontainer-controls-group display-flex-evenly'>
                    <select className='max-width' value={this.state.graphType} onChange={this.onChangeGraphType}>
                        <option value='' disabled>Chart Type</option>
                        {/* <option value='bar' disabled>Bar Chart</option> */}
                        <option value='pie'>Pie Chart</option>
                        <option value='line'>Line Chart</option>
                    </select>
                </div>

                {this.state.graphType === 'pie' && 
                    this.renderTimeframeControls()
                }

                {(this.state.graphType === 'bar' || this.state.graphType === 'line') &&
                    <div className='measurementcontainer-controls-group display-flex-evenly'>
                        <select className='max-width' value={this.state.graphSubType} onChange={this.onChangeGraphSubType}>
                            <option value='' disabled>Chart Sub Type</option>
                            <option value='time/number'>X:Time Y:Number</option>
                            <option value='number/number' disabled>X:Number Y:Number</option>
                        </select>
                    </div>
                }
                
                {(this.state.graphType === 'bar' || this.state.graphType === 'line') &&
                    this.state.graphSubType === 'time/number' &&
                    this.renderTimeGroupControls()
                }

                {(this.state.graphType === 'bar' || this.state.graphType === 'line') && 
                    this.state.graphSubType === 'time/number' && 
                    this.state.queryReports === true &&
                    this.renderTimeframeControls()
                }

                {(this.state.graphType === 'bar' || this.state.graphType === 'line') && 
                    this.state.graphSubType === 'time/number' && 
                    (this.state.groupTimeField !== '' || this.state.queryReports === true) &&
                    this.renderNumberCalculationControls()
                }
            </React.Fragment>
        );
    } 

    renderTimeGroupControls() {
        return  <React.Fragment>
                {this.state.queryReports === false && 
                    <div className='measurementcontainer-controls-group'>
                        <div className='measurementcontainer-controls-group-group-time__header'>
                            <div className='measurementcontainer-controls-group-group-time__header-content'>
                                <label htmlFor='groupTime'>Group time by:</label>
                                <select value={this.state.groupTimeField} onChange={this.onChangeGroupTimeField}>
                                    <option value='' disabled>Select Field</option>
                                    <option value='year'>Year</option>
                                    <option value='month'>Month</option>
                                    <option value='week'>Week</option>
                                    <option value='day'>Day</option>
                                    <option value='hour'>Hour</option>
                                </select>
                            </div>
                            
                            <p className='bold' >Using this feature will cause the server to slow down drastically. Use it sparingly!</p>
                        </div>
                    </div>
                }
                {this.state.queryReports === false && this.state.groupTimeField !== '' && this.renderSharedMeasurementControls()}
                </React.Fragment>
    }

    renderNumberCalculationControls() {
        return (
            <div className='measurementcontainer-controls-group'>
                <div className='measurementcontainer-controls-group__calculation-header'>
                    <label htmlFor='calculationField'>Calculation Fields:</label>
                    <button className='button-narrow button-opaque' onClick={this.onClickAddNumberCalculationField}>Add calculation field</button>
                </div>

                {this.state.numberCalculationFields.map(element => (
                    <div key={`${element.id}`} className='measurementcontainer-controls-group-calculation-field'>

                        <select
                            key={`${element.id}[name]`}
                            id={`numberCalculationFieldName-${element.id}`}
                            value={element.name}
                            onChange={this.onChangeNumberCalculationFieldName}
                            className='measurementcontainer-controls-group-calculation-field__name'
                        >
                            {this.renderNumberCalculationControlsNameFieldOptions()}
                        </select>

                        <select
                            key={`${element.id}[function]`}
                            id={`numberCalculationFieldFunction-${element.id}`}
                            value={element.function}
                            onChange={this.onChangeNumberCalculationFieldFunction}
                            className='measurementcontainer-controls-group-calculation-field__function'
                        >
                            <option key='NumberCalculationFieldFunction[avg]' value='avg'>Average</option>
                            <option key='NumberCalculationFieldFunction[sum]' value='sum'>Sum</option>
                            <option key='NumberCalculationFieldFunction[min]' value='min'>Min</option>
                            <option key='NumberCalculationFieldFunction[max]' value='max'>Max</option>
                        </select>

                        <button
                            className='button-narrow button-transparent'
                            key={`${element.id}[delete]`}
                            id={`numberCalculationFieldDelete-${element.id}`}
                            value='Delete'
                            onClick={this.onClickNumberCalculationFieldDelete}
                        >&#10006;</button>
                    </div>
                ))}
            </div>
        );
    }

    renderNumberCalculationControlsNameFieldOptions() {
        let data;
        if (this.state.queryReports === false)
          data = [
            'averageFps',
            'numberOfFriends',
            'numberOfFriendsOnline',
            'numberOfPrivateChats',
            'numberOfPlayersInRoom'
          ];
        else data = this.state.reportFieldKeys;
        return data.map(el => <option key={`NumberCalculationControlsFieldNameOption[${el}]`} value={el}>{el}</option>);
    }

    renderTableQueryControls() {
        return (
            <React.Fragment>
                { this.renderSharedMeasurementControls() }
            </React.Fragment>
        );
    }

    renderSharedMeasurementControls() {
        return (
            <React.Fragment>
                {this.renderTimeframeControls()}

                <div className='measurementcontainer-controls-group'>
                    <UsernameField />
                </div>

                <div className='measurementcontainer-controls-group measurementcontainer-controls-group-multiselects'>
                    <Select className='react-select-container' classNamePrefix='react-select' value={this.state.selectedGames} onChange={this.onChangeSelectedGames} placeholder='select games' isMulti options={this.getGameOptions()}/>
                    <Select className='react-select-container margin-top-one-rem' classNamePrefix='react-select' value={this.state.selectedOrigins} onChange={this.onChangeSelectedOrigins} placeholder='select origins' isMulti options={this.getOriginOptions()}/>
                    <Select className='react-select-container margin-top-one-rem' classNamePrefix='react-select' value={this.state.selectedBrowsers} onChange={this.onChangeSelectedBrowsers} placeholder='select browsers' isMulti options={this.getBrowserOptions()}/>
                </div>

                <div className='measurementcontainer-controls-group'>
                    <RangedInput title='Average FPS' updateValues={this.updateAverageFpsInputValues}/>
                </div>

                <div className='measurementcontainer-controls-group'>
                    <RangedInput title='Friends' updateValues={this.updateNumberOfFriendsInputValues}/>
                </div>

                <div className='measurementcontainer-controls-group'>
                    <RangedInput title='Friends Online' updateValues={this.updateNumberOfFriendsOnlineInputValues}/>
                </div>

                <div className='measurementcontainer-controls-group'>
                    <RangedInput title='Private Chats' updateValues={this.updateNumberOfPrivateChatsInputValues}/>
                </div>

                <div className='measurementcontainer-controls-group'>
                    <RangedInput title='Players in Room' updateValues={this.updateNumberOfPlayersInRoomInputValues}/>
                </div>
            </React.Fragment>
        );
    }

    renderTimeframeControls() {
        return (
                <div className='measurementcontainer-controls-group'>
                    <div className='measurementcontainer-controls-group-dategroup'>
                            <label htmlFor='startDate'>From</label>
                            <input type='date' id='startDate' value={this.getStartDate()} onChange={this.onChangeStartDate} />
                            <input type='time' id='startTime' value={this.getStartTime()} onChange={this.onChangeStartTime} />
                    </div>

                    <div className='measurementcontainer-controls-group-dategroup'>
                            <label htmlFor='endDate'>Until</label>
                            <input type='date' id='endDate' value={this.getEndDate()} onChange={this.onChangeEndDate} />
                            <input type='time' id='endTime' value={this.getEndTime()} onChange={this.onChangeEndTime} />
                        </div>
                </div>
        );
    }

    retrieveMeasurementDetails(measurementId) {
        this.setState(
            {
                isLoading: true
            },

            () => {
                retrieveMeasurementDetails(measurementId)
                    .then(data => {
                        if (data) {
                            this.setState({
                                detailedMeasurement: data,
                                isDetailedView: true,
                                isLoading: false
                            });
                        }
                    })

                    .catch(err => console.error(err));
            }
        );
    }
    retrieveFieldData() {
        const gamesPromise = retrieveGames();
        const originsPromise = retrieveDistinctOriginFields();
        const browserNamesPromise = retrieveDistinctBrowserNameFields();
        const reportFieldKeys = retrieveReportFieldKeys();
        Promise.all([gamesPromise, originsPromise, browserNamesPromise, reportFieldKeys])
            .then(data => {
                const games = data[0];
                const origins = data[1];
                const browserNames = data[2];
                const reportFieldKeys = data[3].filter(obj => obj.includes('averageFps')).sort();

                this.setState({
                    games,
                    origins,
                    browserNames,
                    reportFieldKeys,
                });
            })
            .catch(err => console.error(err));
    }

    updateAverageFpsInputValues(values) {
        this.setState({ averageFps: values });
    }

    updateNumberOfFriendsInputValues(values) {
        this.setState({ numberOfFriends: values });
    }
    updateNumberOfFriendsOnlineInputValues(values) {
        this.setState({ numberOfFriendsOnline: values });
    }
    updateNumberOfPrivateChatsInputValues(values) {
        this.setState({ numberOfPrivateChats: values });
    }
    updateNumberOfPlayersInRoomInputValues(values) {
        this.setState({ numberOfPlayersInRoom: values });
    }

    getGameOptions() {
        return this.state.games.map(game => ({ value: game.id, label:game.name }));
    }

    getOriginOptions() {
        return this.state.origins.map(origin => ({ value: origin, label:origin }));
    }

    getBrowserOptions() {
        return this.state.browserNames.map(browser => ({ value: browser, label:browser }));
    }

    getStartDate() {
        return moment(this.state.startDate).format('YYYY-MM-DD');
    }

    onChangeStartDate(e) {
        const date = moment(e.target.value);
        date.hour(this.state.startDate.hours());
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
        const date = moment(e.target.value);
        date.hour(this.state.endDate.hours());
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

    onChangeSelectedGames(values, action) {
        this.setState({ selectedGames: values });
    }

    onChangeSelectedOrigins(values, action) {
        this.setState({ selectedOrigins: values });
    }

    onChangeSelectedBrowsers(values, action) {
        this.setState({ selectedBrowsers: values });
    }

    onClickRunQuery() {
        store.dispatch(setInitialState());
        this.retrieveMeasurements();
    }

    onClickBackFromDetailedView() {
        this.setState({
            isDetailedView: false
        });
    }

    onClickMeasurementOpen(id) {
        this.retrieveMeasurementDetails(id);
    }

    onChangeGroupTimeField(e) {
        this.resetUserControls();
        this.setState({ groupTimeField: e.target.value });
    }

    onClickAddNumberCalculationField() {
        let maxId = 0;
        if(this.state.numberCalculationFields.length > 0) maxId = Math.max(...this.state.numberCalculationFields.map(({id}) => id)) + 1;

        const newElement = {
            id: (maxId),
            name: 'averageFps',
            function: 'avg'
        };
        let updatedArray = [...this.state.numberCalculationFields, newElement];
        updatedArray.sort(((a, b) => (a.id > b.id) ? 1 : -1));

        this.setState({ numberCalculationFields : updatedArray });
    }

    onChangeNumberCalculationFieldName(e) {
        const elementId = parseInt(e.target.id.split('-')[1]);
        const element = this.state.numberCalculationFields.find(({id}) => id === elementId);
        const updatedArray = this.state.numberCalculationFields.filter(el => el.id !== elementId);

        if (element) {
            const updatedElement = { ...element, name: e.target.value };
            updatedArray.push(updatedElement);
            updatedArray.sort(((a, b) => (a.id > b.id) ? 1 : -1));
            this.setState({ numberCalculationFields: updatedArray });
        } 
        else console.error('Element in onChangeNumberCalculationFieldName could not be found.');
    }

    onChangeNumberCalculationFieldFunction(e) {
        const elementId = parseInt(e.target.id.split('-')[1]);
        const element = this.state.numberCalculationFields.find(el => el.id === elementId);
        const updatedArray = this.state.numberCalculationFields.filter(el => el.id !== elementId);

        if (element) {
            const updatedElement = { ...element, function: e.target.value };
            updatedArray.push(updatedElement);
            updatedArray.sort(((a, b) => (a.id > b.id) ? 1 : -1));
            this.setState({ numberCalculationFields: updatedArray });
        } 
        else console.error('Element in onChangeNumberCalculationFieldFunction could not be found.');
    }

    onClickNumberCalculationFieldDelete(e) {
        const elementId = parseInt(e.target.id.split('-')[1]);
        const updatedArray = this.state.numberCalculationFields.filter(({id}) => id !== elementId);
        updatedArray.sort(((a, b) => (a.id > b.id) ? 1 : -1));
        this.setState({ numberCalculationFields: updatedArray });
    }

    onChangeQueryType(e) {
        this.resetUserControls();
        this.setState({ queryType: e.target.value });
    }

    onChangeGraphType(e) {
        this.resetUserControls();
        this.setState({ 
            graphType: e.target.value,
            graphSubType: '' ,
            queryPieReports: e.target.value === 'pie',
        });
    }

    onChangeGraphSubType(e) {
        this.resetUserControls();
        this.setState({ graphSubType: e.target.value });
    }

    onChangeQueryReports(e) {
        this.resetUserControls();
        this.setState({ queryReports: !this.state.queryReports });
    }

    resetUserControls() {
        const initialState = {
            queryPieReports: false,
            startDate: moment().hours(0).minutes(0).seconds(0).milliseconds(0),
            endDate: moment().add(1, 'days').hours(0).minutes(0).seconds(0).milliseconds(0),
            selectedBrowsers: null,
            selectedOrigins: null, 
            selectedGames: null, 
            averageFps: [],
            numberOfFriends: [],
            numberOfFriendsOnline: [],
            numberOfPrivateChats: [],
            numberOfPlayersInRoom: [],
            groupTimeField: '',
            numberCalculationFields: [],
        };

        if(this.state.queryType === 'table') {
            initialState.graphType = '';
            initialState.graphSubType = '';
        }

        this.setState({ ...initialState });
    }

    onClickExportToCSV() {
        let data = this.props.measurements;
        if(this.state.measurementFormat = 'time/number') {
            data = this.props.measurements.map(obj => {
                const date = moment();
                const {_id, ...idlessObject} = obj;
                const dateKeys = Object.keys(_id);

                dateKeys.forEach(key => date['key'] = _id[key]);

                return {date: formatDateToCommonDateString(date.toDate()), ...idlessObject};
            });
        }
        const csvData = convertArrayOfObjectsToCSV({data, columnDelimiter: ',', lineDelimiter:'\n'});
        saveCSVToPC(csvData);
        console.log(csvData);
    }
}

const mapStateToProps = (state, ownprops) => {
    return {
        measurements: state.measurements
    };
}
 
export default connect(mapStateToProps)(MeasurementContainer);