import React, { Component } from 'react';
import _ from 'lodash';

import { makeOnlyFirstCharCapital } from '../../../../common/util/stringManipulation';

import TimeNumberLineChart from './TimeNumberLineChart';
import PieChartD3 from './PieChartD3';
import PieChartData from '../data/PieChartData';
import TimeNumberChartData from '../data/TimeNumberChartData';
import Tooltip from './Tooltip';


class ChartContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            //Data
            timeNumberLineCharts: [],
            pieCharts: [],
            chartData: [],
            currentChart: 0,

            //User Input Fields
            chartDistributionField: '',
            divideCalculationData: false,
            timeNumberChartXAxisFormat: '%m/%d',
            pieChartSettings: {
                state: '',
                game: '',
                browser: '',
                version: '',
                divisionFields: [],
                states: [],
                games: [],
                browsers: [],
                versions: {
                    frameworkVersion: [],
                    gameVersion: [],
                },
                percentages: false,
            },
            tooltip: {
                data: [],
                shouldRender: false,
                x: 0,
                y: 0,
            },

            //Views
            renderCharts: false,
        };

        this.pieChartData = new PieChartData();
        this.timeNumberChartData = new TimeNumberChartData();

        this.renderTimeNumberLineCharts = this.renderTimeNumberLineCharts.bind(this);
        this.renderPieCharts = this.renderPieCharts.bind(this);
        this.renderTimeNumberDistributionFieldOptions = this.renderTimeNumberDistributionFieldOptions.bind(this);
        this.renderPieChartDistributionFieldOptions = this.renderPieChartDistributionFieldOptions.bind(this);
        
        this.updateTooltip = this.updateTooltip.bind(this);
        this.setTimeNumberChartXAxisFormat = this.setTimeNumberChartXAxisFormat.bind(this);
        this.setToPreviousChart = this.setToPreviousChart.bind(this);
        this.setToNextChart = this.setToNextChart.bind(this);

        this.onChangeChartDistributionField = this.onChangeChartDistributionField.bind(this);
        this.onChangeDivideCalculationData = this.onChangeDivideCalculationData.bind(this);
        this.onChangePieChartSettingsGameState = this.onChangePieChartSettingsGameState.bind(this);
        this.onChangePieChartSettingsGame = this.onChangePieChartSettingsGame.bind(this);
        this.onChangePieChartSettingsBrowser = this.onChangePieChartSettingsBrowser.bind(this);
        this.onChangePieChartSettingsPercentages = this.onChangePieChartSettingsPercentages.bind(this);
        this.onChangePieChartSettingsVersion = this.onChangePieChartSettingsVersion.bind(this); 
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.state.currentChart !== nextState.currentChart) return true;
        if(this.props.measurements.length !== nextProps.measurements.length) return true;
        for (let i = 0; i < this.props.measurements.length; i++) {
            const currentElement = this.props.measurements[i];
            const nextElement = nextProps.measurements[i];

            if(Object.keys(currentElement).length !== Object.keys(nextElement).length) return true;
            const keys = Object.keys(currentElement);

            for (let j = 0; j < keys.length; j++) {
                const key = keys[j];
                if(currentElement[key] !== nextElement[key]) return true;
            }
        }

        if(this.state.chartData.length !== nextState.chartData.length) return true;
        for (let i = 0; i < this.state.chartData.length; i++) {
            const prevElement = this.state.chartData[i];
            const nextElement = nextState.chartData[i];

            if(Object.keys(prevElement).length !== Object.keys(nextElement).length) return true;
            const keys = Object.keys(prevElement);

            for (let j = 0; j < keys.length; j++) {
                const key = keys[j];
                if(prevElement[key] !== nextElement[key]) return true;
            }
        }

        const pieChartSettingsKeys = Object.keys(this.state.pieChartSettings);
        for (let k = 0; k < pieChartSettingsKeys.length; k++) {
            const key = pieChartSettingsKeys[k];
            const previous = this.state.pieChartSettings[key];
            const next = nextState.pieChartSettings[key];

            if(Array.isArray(previous) && 
                _.isEqual(previous, next) === true) return true;
            else if (typeof previous === 'object') {
                const innerKeys = Object.keys(previous);

                for (let i = 0; i < innerKeys.length; i++) {
                    const innerKey = innerKeys[i];
                    if(Array.isArray(previous[innerKey]) && 
                        _.isEqual(previous[innerKey], next[innerKey]) === true) return true;
                    else if(previous[innerKey] !== next[innerKey]) return true;
                }
            }
            else if(previous !== nextState.pieChartSettings[key]) return true;
        }

        if(this.state.pieCharts.length !== nextState.pieCharts.length) return true;
        for (let i = 0; i < this.state.pieCharts.length; i++) {
            const prevElement = this.state.pieCharts[i];
            const nextElement = nextState.pieCharts[i];

            if(Object.keys(prevElement).length !== Object.keys(nextElement).length) return true;
            const keys = Object.keys(prevElement);

            for (let j = 0; j < keys.length; j++) {
                const key = keys[j];
                if((Array.isArray(prevElement[key]) || Array.isArray(nextElement[key]) && 
                    _.isEqual(prevElement[key], nextElement[key] === true))) return true;
                else if(prevElement[key] !== nextElement[key]) return true;
            }
        }

        if(Object.keys(this.state.tooltip).length !== Object.keys(nextState.tooltip).length) return true;
        const tooltipKeys = Object.keys(this.state.tooltip);
        for (let i = 0; i < tooltipKeys.length; i++) {
            const tooltipKey = tooltipKeys[i];
            
            if((Array.isArray(this.state.tooltip[tooltipKey]) || Array.isArray(nextState.tooltip[tooltipKey])) && 
                _.isEqual(this.state.tooltip[tooltipKey], nextState.tooltip[tooltipKey]) === true ) return true;
            else if(this.state.tooltip[tooltipKey] !== nextState.tooltip[tooltipKey]) return true;
        }
        
        if(this.state.timeNumberChartXAxisFormat !== nextState.timeNumberChartXAxisFormat) return true;
        if(this.state.chartDistributionField !== nextState.chartDistributionField) return true;
        if(this.state.divideCalculationData !== nextState.divideCalculationData) return true;

        return false;
    }

    componentDidMount() {
        if(this.props['measurementFormat'] === 'pie') {
            this.pieChartData.loadMeasurements(this.props.measurements);

            const { states, games, browsers, versions, divisionFields } = this.pieChartData;
            const pieChartSettings = {...this.state.pieChartSettings, states, games, browsers, versions, divisionFields };

            const {state, game, browser, version, percentages} = this.state.pieChartSettings;
            this.pieChartData.setFields(state, game, browser, version, percentages, this.state.chartDistributionField);

            const pieCharts = this.pieChartData.pieCharts;
            const newState = {pieChartSettings, pieCharts};

            if(this.pieChartData.pieCharts.length) newState.renderCharts = true;

            this.setState({ ...newState });
        }
        else if(this.props['measurementFormat'] === 'time/number') {
            this.timeNumberChartData.loadMeasurements(this.props.measurements, this.props.measurementSource);
            const newState = { chartData: this.timeNumberChartData.chartData };
            if(this.timeNumberChartData.chartData.length) newState.renderCharts = true;
            this.setState({ ...newState });
        }
    }

    componentDidUpdate(prevProps, prevState) {  
        let measurementsChanged = false;
        if(this.props.measurements && prevProps.measurements) {
            if(this.props.measurements.length !== prevProps.measurements.length) measurementsChanged = true;
            else {
                for (let i = 0; i < this.props.measurements.length; i++) {
                    const prevElement = this.props.measurements[i];
                    const nextElement = prevProps.measurements[i];

                    if(Object.keys(prevElement).length !== Object.keys(nextElement).length) {
                        measurementsChanged = true;
                        break;
                    }
                    const keys = Object.keys(prevElement);
        
                    for (let j = 0; j < keys.length; j++) {
                        const key = keys[j];
                        if(prevElement[key] !== nextElement[key]) {
                            measurementsChanged = true;
                            break;
                        }
                    }
                }
            }
        }

        if(measurementsChanged) {
            this.resetState();

            if(this.props['measurementFormat'] === 'pie') {
                this.pieChartData.loadMeasurements(this.props.measurements);
                const { states, games, browsers, versions, divisionFields } = this.pieChartData; 
                const pieChartSettings = {...this.state.pieChartSettings, states, games, browsers, versions, divisionFields }; 
                this.setState({ pieChartSettings });
            }

            if(this.props['measurementFormat'] === 'time/number') {
                this.timeNumberChartData.loadMeasurements(this.props.measurements, this.props.measurementSource);
                const newState = {chartData: this.timeNumberChartData.chartData};
                if(this.state.renderCharts !== true && this.timeNumberChartData.chartData.length > 0) newState.renderCharts = true;
                this.setState(newState)
            }
        }
        else if(!measurementsChanged && this.props['measurementFormat'] === 'pie') {
            if( this.state.pieChartSettings.state === prevState.pieChartSettings.state && 
                this.state.pieChartSettings.game === prevState.pieChartSettings.game &&
                this.state.pieChartSettings.browser === prevState.pieChartSettings.browser && 
                this.state.pieChartSettings.version === prevState.pieChartSettings.version &&
                this.state.pieChartSettings.percentages === prevState.pieChartSettings.percentages &&
                this.state.chartDistributionField === prevState.chartDistributionField
            ) return;
            
            const {state, game, browser, version, percentages} = this.state.pieChartSettings;
            this.pieChartData.setFields(state, game, browser, version, percentages, this.state.chartDistributionField)

            const currentPieChartUserControlSettings = [this.pieChartData.states, this.pieChartData.games, this.pieChartData.browsers, this.pieChartData.versions];
            const previousPieChartUserControlSettings = [this.state.pieChartSettings.states, this.state.pieChartSettings.games, this.state.pieChartSettings.browsers, this.state.pieChartSettings.versions];
            let settingsChanged = false;

            for (let i = 0; i < currentPieChartUserControlSettings.length; i++) {
                const current = currentPieChartUserControlSettings[i];
                const previous = previousPieChartUserControlSettings[i];

                if(Array.isArray(current)) {
                    if(current.length !== previous.length) {
                        settingsChanged = true;
                        break;
                    }

                    for (let j = 0; j < current.length; j++) {
                        const currentSubElement = current[j];
                        const previousSubElement = previous[j];

                        if(currentSubElement !== previousSubElement) {
                            settingsChanged = true;
                            break;
                        }
                    }
                }
                else {
                    const versionKeys = Object.keys(current);

                    if(versionKeys.length !== Object.keys(previous).length) {
                        settingsChanged = true;
                        break;
                    }
                    for (let k = 0; k < versionKeys.length; k++) {
                        const versionKey = versionKeys[k];
                        const currentVersionArray = current[versionKey];
                        const previousVersionArray = previous[versionKey];

                        if(_.isEqual(currentVersionArray, previousVersionArray) === true) { 
                            settingsChanged = true;
                            break;
                        }
                    }
                }                

                if(settingsChanged === true) break;
            }

            
            let pieChartSettings = undefined;

            if(settingsChanged === true) 
                pieChartSettings = {
                    ...this.state.pieChartSettings,
                    states: currentPieChartUserControlSettings[0],
                    games: currentPieChartUserControlSettings[1],
                    browsers: currentPieChartUserControlSettings[2],
                    versions: currentPieChartUserControlSettings[3],
                };

            let dataChanged = false;

            if(this.state.pieCharts.length !== this.pieChartData.pieCharts.length) dataChanged = true;
            else {
                for (let i = 0; i < this.state.pieCharts.length; i++) {
                    const prevElement = this.state.pieCharts[i];
                    const nextElement = this.pieChartData.pieCharts[i];
        
                    if(Object.keys(prevElement).length !== Object.keys(nextElement).length) {
                        dataChanged = true;
                        break;
                    }
                    const keys = Object.keys(prevElement);
        
                    for (let j = 0; j < keys.length; j++) {
                        const key = keys[j];
        
                        if(Array.isArray(prevElement[key]) || Array.isArray(nextElement[key])) {
                            for (let a = 0; a < prevElement[key].length; a++) 
                                if(prevElement[key][a] !== nextElement[key][a]) {
                                    dataChanged = true;
                                    break;
                                };
                        }
                        else if(prevElement[key] !== nextElement[key]) {
                            dataChanged = true;
                            break;
                        }

                        if(dataChanged === true) break;
                    }

                    if(dataChanged === true) break;
                }
            }

            const newState = {};
            if(pieChartSettings) newState.pieChartSettings = pieChartSettings;
            if(dataChanged) newState.pieCharts = this.pieChartData.pieCharts;
            if(this.pieChartData.pieCharts.length > 0 && this.state.renderCharts !== true) newState.renderCharts = true;
            this.setState(newState); 
        }
        else if(!measurementsChanged && this.props['measurementFormat'] === 'time/number') {
            if(this.timeNumberChartData.currentDataDistributionField === this.state.chartDistributionField &&
                this.timeNumberChartData.currentDataIsCalculationDivided === this.state.divideCalculationData) return;

            this.timeNumberChartData.formatData(this.state.chartDistributionField, this.state.divideCalculationData);
            const newState = {chartData: this.timeNumberChartData.chartData};
            if(this.state.renderCharts !== true) newState.renderCharts = true;
            this.setState(newState)
        }
    }

    updateTooltip(data, shouldRender, x, y) {
        this.setState({ tooltip: {data, shouldRender, x, y} });
    }

    render() {
        if(this.props.measurementFormat === 'time/number' && this.props.measurements.length <= 0) return <p>not enough data retrieved to render a chart, please extend your search criteria.</p>
        
        let chartArray = undefined;
        if(this.props.measurementFormat === 'time/number') chartArray = this.state.chartData;
        if(this.props.measurementFormat === 'pie') chartArray = this.state.pieCharts;

        return (
            <div id="ChartContainer">
                {this.state.tooltip.shouldRender === true &&
                    <Tooltip 
                        data={this.state.tooltip.data}
                        x={this.state.tooltip.x}
                        y={this.state.tooltip.y}
                    />
                }
                <div className='search-controls'>
                    <span>search controls</span>

                    <div className='chartcontainer-controls'>
                        
                        <div className='chartcontainer-controls-group'>
                            <label htmlFor='divideBy'>distribute data by field:</label>
                            <select type='text' value={this.state.chartDistributionField} onChange={this.onChangeChartDistributionField}>
                                <option value=''>{this.props['measurementFormat'] === 'pie' ? 'Day' : 'no grouping'}</option>
                                {this.props['measurementFormat'] === 'time/number' && this.renderTimeNumberDistributionFieldOptions()}
                                {this.props['measurementFormat'] === 'pie' && this.renderPieChartDistributionFieldOptions()}
                            </select>
                        </div>

                        { this.props['measurementFormat'] === 'time/number' &&
                            <div className='chartcontainer-controls-group'>
                                <label htmlFor='divideCalculationData'>one line per chart</label>
                                <input type='checkbox' value={this.state.divideCalculationData} onChange={this.onChangeDivideCalculationData}/>
                            </div>
                        }

                        {this.props['measurementFormat'] === 'pie' && 
                            this.state.pieChartSettings.states.length && 
                            this.state.pieChartSettings.games.length &&
                            this.state.pieChartSettings.browsers.length &&

                            <React.Fragment>
                                <div className='chartcontainer-controls-group'>
                                    <label htmlFor='pieChartSettings.state'>Game State:</label>
                                    <select type='text' value={this.state.pieChartSettings.state} onChange={this.onChangePieChartSettingsGameState}>
                                        {this.renderPieChartSettingsOptions('states')}
                                    </select>
                                </div>

                                <div className='chartcontainer-controls-group'>
                                    <label htmlFor='pieChartSettings.game'>Game:</label>
                                    <select type='text' value={this.state.pieChartSettings.game} onChange={this.onChangePieChartSettingsGame}>
                                        {this.renderPieChartSettingsOptions('games')}
                                    </select>
                                </div>

                                <div className='chartcontainer-controls-group'>
                                    <label htmlFor='pieChartSettings.browser'>Browser:</label>
                                    <select type='text' value={this.state.pieChartSettings.browser} onChange={this.onChangePieChartSettingsBrowser}>
                                        {this.renderPieChartSettingsOptions('browsers')}
                                    </select>
                                </div>

                                <div className='chartcontainer-controls-group'>
                                    <label htmlFor='pieChartSettings.version'>Version:</label>
                                    <select type='text' value={this.state.pieChartSettings.version} onChange={this.onChangePieChartSettingsVersion}>
                                        {this.renderPieChartSettingsOptions('versions')}
                                    </select>
                                </div>

                                <div className='chartcontainer-controls-group'>
                                    <label htmlFor='pieChartSettings.percentages'>In Percentages:</label>
                                    <input type='checkbox' checked={this.state.pieChartSettings.percentages === true} onChange={this.onChangePieChartSettingsPercentages}/>
                                </div>
                            </React.Fragment>
                        }

                    </div>
                </div>

                <div className='search-results'>
                    <span>search results</span>

                    <div className='chart-render'>
                        {this.state.renderCharts && this.props['measurementFormat'] === 'time/number' &&
                            this.renderTimeNumberLineCharts()
                        }

                        {this.state.renderCharts && this.props['measurementFormat'] === 'pie' &&
                            this.renderPieCharts()
                        }
                    </div>

                    <div className='chart-pagination'>
                        {this.state.currentChart !== 0 && <button className='button-narrow button-transparent float-left' onClick={this.setToPreviousChart}>previous</button> }
                        {chartArray.length - 1 > this.state.currentChart && <button className='button-narrow button-transparent float-right' onClick={this.setToNextChart}>next</button> }
                    </div>
                </div>

            </div>
        );
    }

    resetState() {
        const state = {
            //Data
            timeNumberLineCharts: [],
            pieCharts: [],
            chartData: [],
            currentChart: 0,

            //User Input Fields
            chartDistributionField: '',
            divideCalculationData: false,
            timeNumberChartXAxisFormat: '%d/%m', 
            pieChartSettings: {
                state: '',
                game: '',
                browser: '',
                divisionFields: [],
                states: [],
                games: [],
                browsers: [],
                percentages: false,
            },

            //Views
            renderCharts: false,
        }
        this.setState({ ...state });
    }

    renderPieChartSettingsOptions(property) {
        let keys = this.state.pieChartSettings[property];

        if(property === 'versions') { 
            const keyArray = ['any'];
            keys = Object.keys(this.state.pieChartSettings[property]);
            keys.forEach(key => keyArray.push(...this.state.pieChartSettings[property][key]));
            keys = keyArray;
        }
        return keys.map((key,index) => (
					<option key={`${property}[${key}][${index}]`} value={key}>
						{makeOnlyFirstCharCapital(key)}
					</option>
				));
    }

    renderPieChartDistributionFieldOptions() {
            return this.state.pieChartSettings.divisionFields.map((field, index) => {
                return <option key={`DivideByOption${index}`} value={field}>{makeOnlyFirstCharCapital(field)}</option>
            });
        }

    renderPieCharts() {
        if(!this.state.pieCharts || this.state.pieCharts.length <= 0) return <p>No data found for the input settings.</p>;

        const { data, ...details } = this.state.pieCharts[this.state.currentChart];
        return (
                <PieChartD3 
                        key={'pie-chart'} 
                        data={data} 
                        details={details}
                        width={1208}
                        height={250}
                        innerRadius={0}
                        outerRadius={150}
                        updateTooltip={this.updateTooltip}
                />
        );
    }

    renderTimeNumberDistributionFieldOptions() {
        return Object.keys(this.props.measurements[0]['_id']).map((key, index) => {
            if(index == Object.keys(this.props.measurements[0]['_id']).length - 1) return;
            return <option key={`DivideByOption${index}`} value={key}>{key}</option>
        });
    }

    renderTimeNumberLineCharts() {
        if(!this.state.chartData || this.state.chartData <= 0) return null;

        let valueField = undefined;
        const arr = this.state.chartData[this.state.currentChart];
        valueField = Object.keys(arr[0]).find(key => key !== 'date' && key !== 'fill' && key !== 'count' && key !== 'measurementsConsolidated' && !key.includes('amountOfMeasurements'));
        return  <TimeNumberLineChart 
                    key={`TimeLineChart1`} 
                    data={arr} 
                    xTimeFormat={this.state.timeNumberChartXAxisFormat} 
                    yTickTag={valueField} 
                />
    }

    setTimeNumberChartXAxisFormat(chartDistributionField) {
        let xAxisFormat = '%b';
        if(chartDistributionField === 'month') xAxisFormat = '%d';
        if(chartDistributionField === 'week') xAxisFormat = '%A';
        if(chartDistributionField === 'day') xAxisFormat = '%H:00';

        if(this.state.timeNumberChartXAxisFormat !== xAxisFormat) this.setState({ timeNumberChartXAxisFormat: xAxisFormat });
    }
    
    updateTooltip(data, shouldRender, x, y) {
        this.setState({ tooltip: {data, shouldRender, x, y} });
    }

    onChangeChartDistributionField(e) {
        this.setState({ chartDistributionField: e.target.value, currentChart: 0 });
        this.setTimeNumberChartXAxisFormat(e.target.value);
    }

    onChangePieChartSettingsGameState(e) {
        const nextValue = e.target.value;
        const pieChartSettings = { ...this.state.pieChartSettings, state: nextValue };
        this.setState({ pieChartSettings });
    }

    onChangePieChartSettingsGame(e) {
        const nextValue = e.target.value;
        const pieChartSettings = { ...this.state.pieChartSettings, game: nextValue };
        this.setState({ pieChartSettings });
    }

    onChangePieChartSettingsBrowser(e) {
        const nextValue = e.target.value;
        const pieChartSettings = { ...this.state.pieChartSettings, browser: nextValue };
        this.setState({ pieChartSettings });
    }

    onChangePieChartSettingsVersion(e) {
        const nextValue = e.target.value;
        const pieChartSettings = { ...this.state.pieChartSettings, version: nextValue };
        this.setState({ pieChartSettings });
    }

    onChangePieChartSettingsPercentages() {
        const prevValue = this.state.pieChartSettings.percentages;
        const pieChartSettings = { ...this.state.pieChartSettings, percentages: !prevValue };
        this.setState({ pieChartSettings });
    }

    onChangeDivideCalculationData() {
        this.setState({divideCalculationData: !this.state.divideCalculationData, currentChart: 0});
    }

    setToPreviousChart() {
        this.setState({ currentChart: this.state.currentChart - 1 });
    }

    setToNextChart() {
        this.setState({ currentChart: this.state.currentChart + 1 });
    }

}

export default ChartContainer;