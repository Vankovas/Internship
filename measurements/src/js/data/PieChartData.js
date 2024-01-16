import * as d3 from 'd3';
import moment from 'moment';
import { sum } from 'lodash';

import PieChartReport from './PieChartReport';


class PieChartData {
    constructor() {
        this.measurements = [];
        this.pieCharts = [];
        this.divisionFields = [];
        this.states = [];
        this.games = [];
        this.browsers = [];
        this.versions = {
            frameworkVersion: [],
            gameVersion: [],
        };
        
        this.currentDataState = 'any';
        this.currentDataGame = 'any';
        this.currentDataBrowser = 'any';
        this.currentDataVersion = 'any';
        this.currentDataPercentages = false;
        this.currentDataDivisionField = 'any';
    }

    /**
     * Loads the provided measurements and configures the states, games, browsers object fields.
     * @param {Array} measurements
     */
    loadMeasurements(measurements) {
        this.reset();
        if(measurements.length < 0) return;
        this.measurements = measurements;
        this.configurePieChartSettings();
    }
    
    /**
     * Based on the parameters generates the pie chart data and saves it in the pieCharts field.
     * @param {string} state - Choose game state
     * @param {string} game - Choose a game
     * @param {string} browser - Choose a browser
     * @param {Boolean} percentages - In percentages (if true), in raw data (if false)
     * @param {string} chartDivisionField - A field which the data will be grouped upon (day, week, month, year)
     */
    setFields(state, game, browser, version, percentages, chartDivisionField) {
        this.currentDataState = state;
        this.currentDataGame = game;
        this.currentDataBrowser = browser;
        this.currentDataVersion = version;
        this.currentDataPercentages = percentages === true;
        this.currentDataDivisionField = chartDivisionField;

        this.formatPieChartData(this.currentDataState, this.currentDataGame, this.currentDataBrowser, this.currentDataVersion, this.currentDataPercentages, this.currentDataDivisionField);
    }

    /**
     * Internal Method
     */
    configurePieChartSettings() {
        if(this.measurements.length) {
            const pieChartSettings = this.calculatePieChartTimeframe();
            const divisionFields = this.calculatePieChartDivisionFields(pieChartSettings.startPeriod, pieChartSettings.endPeriod);

            let states = [];
            let games = [];
            let browsers = [];
            const versions = {
                frameworkVersion: [],
                gameVersion: [],
            };

            this.measurements.forEach(measurement => {
                const measurementData = measurement.data;
                
                Object.keys(measurement.versions).forEach(versionType => versions[versionType].push(...measurement.versions[versionType]));

                Object.keys(measurementData).forEach(stateKey => {
                    states.push(stateKey);
                    const stateValue = measurementData[stateKey];

                    Object.keys(stateValue).forEach(gameKey => {
                        games.push(gameKey);
                        const gameValue = stateValue[gameKey];

                        Object.keys(gameValue).forEach(browserKey => {
                            browsers.push(browserKey);
                        });
                    });
                });
            });

            states = Array.from(new Set(states));
            games = Array.from(new Set(games));
            browsers = Array.from(new Set(browsers));
            
            const finalVersions = {
                frameworkVersion: [],
                gameVersion: [],
            }; 

            Object.keys(versions).forEach(versionType => finalVersions[versionType] = Array.from(new Set(versions[versionType])));

            this.divisionFields = divisionFields;
            this.states = states;
            this.games = games;
            this.browsers = browsers;
            this.versions = finalVersions;
        }
        else this.reset();
    }

    /**
     * Internal Method
     */
    calculatePieChartTimeframe() {
        const data = this.measurements;
        let startPeriod = d3.min(data.map(measurement => new Date(measurement.startPeriod)));
        let endPeriod = d3.max(data.map(measurement => new Date(measurement.endPeriod)));

        const pieChartSettings = { 
            ...this.pieChartSettings,
            startPeriod,
            endPeriod,
        };
        
        return pieChartSettings;
    }

    /**
     * Internal Method
     */
    calculatePieChartDivisionFields(startPeriod, endPeriod) {
        const divisionFields = [];
        if(moment(startPeriod).week() !== moment(endPeriod).week()) divisionFields.push('week');

        if(startPeriod.getUTCMonth() !== endPeriod.getUTCMonth()) divisionFields.push('month');
            
        if(startPeriod.getUTCFullYear() !== endPeriod.getUTCFullYear()) divisionFields.push('year');

        return divisionFields;
    }

    /**
     * Internal Method
     */
    reset() {
        this.measurements = [];
        this.pieCharts = [];
        this.divisionFields = [];
        this.states = [];
        this.games = [];
        this.browsers = [];
        this.versions = {
            frameworkVersion: [],
            gameVersion: [],
        };

        this.currentDataState = 'any';
        this.currentDataGame = 'any';
        this.currentDataBrowser = 'any';
        this.currentDataPercentages = false;
        this.currentDataDivisionField = 'any';
    }

    /**
     * Internal Method - Use setFields() instead.
     */
    formatPieChartData(state = 'any', game = 'any', browser = 'any', version = 'any', percentages = true, chartDivisionField = '') {
        const groupedData = this.groupPieChartData(chartDivisionField);
        const consolidatedData = this.consolidatePieChartData(groupedData, chartDivisionField);
        const path = ['data', state, game, browser, version].map(el => el || 'any');
        const usableData = [];
        const formattedData = [];

        //Leave only the measurements containing the requested data.
        consolidatedData.forEach(measurement => {
            let obj = measurement;
            let containsRequestedData = true;

            pathLoop:
            for (let i = 0; i < path.length; i++) {
                const p = path[i];
                if(obj[p] === undefined)  {
                    containsRequestedData = false;
                    break pathLoop;
                }
                obj = obj[p];
            }

            if(containsRequestedData === true) usableData.push(measurement);
        });

        usableData.forEach(measurement => {

            let obj = measurement;
            path.forEach(p => obj = obj[p]);

            let data = [obj.zeroToTwenty, obj.twentyToThirty, obj.thirtyToFourty, obj.fourtyToFifty, obj.fiftyPlus];

            const total = sum(data);
            const percentageData = data.map(el => (el/total) * 100);

            formattedData.push({...measurement, data: data, percentageData, percentages: percentages === true});
        });

        this.pieCharts = formattedData;
    }

    /**
     * Internal Method.
     * This method will group the data based on user input, whenever possible.
     * @returns {Object} groupedData 
     */
    groupPieChartData(chartDivisionField) {
        const measurements = this.measurements;

        if(chartDivisionField === '') return measurements;

        const groupedData = [];
        let previousComparable = undefined;

        measurements.forEach((currentElement, index) => {
            if(index === 0) groupedData.push([currentElement]);
            else {
                const currentComparable = this.getPieChartComparable(chartDivisionField, currentElement.startPeriod);
                if(previousComparable === currentComparable) groupedData[groupedData.length - 1].push(currentElement);
                else groupedData.push([currentElement]);
            }

            previousComparable = this.getPieChartComparable(chartDivisionField, currentElement.startPeriod);
        });
        return groupedData;
    }

    /**
     * Internal Method
     */
    getPieChartComparable(chartDivisionField, date) {
        const UTCDate = moment.utc(date);
        if(chartDivisionField === '') return UTCDate.valueOf();
        else if(chartDivisionField === 'week' || 'month' || 'year') return UTCDate[chartDivisionField]();
        
        throw 'Invalid chart division field!';
    }

    /**
     * Internal Method
     */
    consolidatePieChartData(groupedData, chartDivisionField) {
        const shouldConsolidate = groupedData.find(report => Array.isArray(report)) !== undefined;
        const consolidatedData = [];

        if(shouldConsolidate) {
            groupedData.forEach(group => {
                if(Array.isArray(group) ) {
                    if(group.length < 1) return consolidatedData.push(group[0]);

                    const consolidatedPie = new PieChartReport();
                    consolidatedPie.startPeriod = d3.min(group, g => g.startPeriod);
                    consolidatedPie.endPeriod = d3.max(group, g => g.endPeriod);
                    consolidatedPie.reportType = chartDivisionField === '' ? 'day' : chartDivisionField;

                    group.forEach(el => consolidatedPie.inject(el.data));
                    consolidatedPie.finalize('sum');
                    consolidatedData.push(consolidatedPie);
                }
                else consolidatedData.push(group)
            });
        }
        else groupedData.forEach(obj => consolidatedData.push({startPeriod: obj.startPeriod, endPeriod: obj.endPeriod, reportType: obj.reportType, data: obj.data }));

        return consolidatedData;
    }
}

export default PieChartData;