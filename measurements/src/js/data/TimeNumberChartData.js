import { generateColor } from '../../../../common/util/randomColorGenerator';

class TimeNumberChartData {
	constructor() {
		this.chartData = [];
		this.measurements = [];

		this.currentDataQuerySource = '';
        this.currentDataDistributionField = '';
        this.currentDataIsCalculationDivided = false;
	}

	/**
	 * This method will load the measurements into the object and give you the ability to format them into usable chart data.
	 * @param {Array} measurements - An array of measurements (could be reports or normal measurements)
	 * @param {String} querySource - Indicate whether it is of type 'report' or of type 'measurement'
	 */
	loadMeasurements(measurements, querySource) {
		this.reset();
        this.measurements = measurements;
        this.currentDataQuerySource = querySource;
		this.formatData(this.currentDataDistributionField, this.currentDataIsCalculationDivided);
    }
    
    /**
     * Resets object to the default values.
     */
    reset() {
        this.chartData = [];
		this.measurements = [];

		this.currentDataQuerySource = '';
        this.currentDataDistributionField = '';
        this.currentDataIsCalculationDivided = false;
    }

	/**
	 * This function converts the measurements data into usable chart data and saves it to the object variable 'chartData'
	 * @param {String} distributeBy - Setting this field will distribute the data based on its value. ('year', 'month', 'week', 'day')
     * @param {Boolean} divideCalculations - Setting this to true will additionaly divide the data by the calculation fields(from multiple factors to 1 per graph).
	 */
	formatData(distributeBy, divideCalculations) {
        this.chartData = [];
        this.currentDataDistributionField = distributeBy;
        this.currentDataIsCalculationDivided = divideCalculations === true;

		this.distributeData(distributeBy);
		
        this.formatToChartData();
		if(this.currentDataIsCalculationDivided === true) this.divideCalculationData();
		this.colorizeData();
	}

	/**
	 * Internal method
	 * @param {String} distributionField
	 * @formats chartData to [...measurements] or [...groups][...measurements].
	 */
	distributeData(distributionField) {
		//ifno distribution field, the app will try to distribute the data based on the 2nd to last time group field.
		//ifno such field is found or there are less than 2 measurements, means that the data is already distributed as much as possible.
		if(
			this.measurements.length < 1 ||
			(distributionField === undefined &&
				Object.keys(this.measurements[0]._id).length === 1)
		) {
			this.chartData = this.measurements;
			return;
		}

		const distributedData = [];
		let _distributionField = undefined;

		if(distributionField !== undefined) {
			_distributionField = distributionField;
			this.currentDataDistributionField = _distributionField;
        } 
        else {
			const dataTimeGroupFields = Object.keys(this.chartData[0]._id);
			_distributionField = dataTimeGroupFields[dataTimeGroupFields.length - 2];
		}

		for (let i = 0; i < this.measurements.length; i++) {
			const measurement = this.measurements[i];
			if(i === 0) {
				distributedData.push([measurement]);
				continue;
			}
            const lastGroup = distributedData[distributedData.length - 1];
			const sameGroup = (lastGroup[lastGroup.length - 1]['_id'][_distributionField] === measurement['_id'][_distributionField]);
			if(sameGroup) lastGroup.push(measurement);
			else distributedData.push([measurement]);
		}

        this.chartData = distributedData;
	}

    /**
     * Internal Method.
     * @summary Takes the distributed data and formats it into usable Time/Number chart data.
     */
	formatToChartData() {
		const chartData = [];

        const hasGroups = this.chartData.find(value => Array.isArray(value)) !== undefined;
		if(!hasGroups) this.chartData = [this.chartData];

		for (let i = 0; i < this.chartData.length; i++) {
			const group = this.chartData[i];
            const formattedTimeGroup = this.formatTimeData(group);
			chartData.push(this.formatValueData(formattedTimeGroup));
        }
        
        this.chartData = chartData;
	}

	/**
	 * Internal Method
	 * @param {Array} dataArray - an array of measurements
	 */
	formatTimeData(dataArray) {
        const formattedData = [];
		dataArray.forEach(el => {
			const formattedElement = {};

			const year = el._id.year || 0;
			const month = el._id.month || 0;
			const day = el._id.day || 0;
			const hour = el._id.hour || 0;

			const date = new Date(year, month - 1, day, hour, 0, 0);
			Object.keys(el).forEach(key => {
				if(key === '_id') return;
				formattedElement[key] = el[key];
			});
			formattedData.push({ ...formattedElement, date });
		});
		return formattedData;
	}

	/**
	 * Internal Method
	 * @param {Array} dataArray - an array of measurements
	 */
	formatValueData(dataArray) {
        const formattedChartDataArray = [];
        
		for (let i = 0; i < dataArray.length; i++) {
			const measurement = dataArray[i];
            const measurementKeys = Object.keys(measurement);
            
            const formattedChartDataObject = {};
            const data = [];

            measurementKeyLoop:
			for (let j = 0; j < measurementKeys.length; j++) {
				const measurementKey = measurementKeys[j];

				if(['date'].includes(measurementKey)) {
                    formattedChartDataObject[measurementKey] = measurement[measurementKey];
					continue measurementKeyLoop;
                }
                
				if(this.currentDataQuerySource === 'report') {

					if(measurementKey === 'averageFps') {
						data.push({
							[measurementKey]: measurement[measurementKey],
							count: measurement['measurementsConsolidated'] || 0,
						});
						continue measurementKeyLoop;
                    } 
                    else if(measurementKey.includes('averageFps')) {
						const countKey = (measurementKey + '').replace(
							'averageFps',
							'amountOfMeasurements'
						);
						data.push({
							[measurementKey]: measurement[measurementKey],
							count: measurement[countKey] || 0,
						});
                    } 
                    else continue measurementKeyLoop;
                } 
                else if(this.currentDataQuerySource === 'measurement') {
					if(measurementKey !== 'count') {
						data.push({
							[measurementKey]: measurement[measurementKey],
							count: measurement['count'] || 0,
						});
					}
				}

            }
            formattedChartDataArray.push({...formattedChartDataObject, data });
		}

		return formattedChartDataArray;
	}

	/**
	 * Internal Method
	 * @description
	 * Returns the separated data arrays. Which are separated by the calculation fields.
	 * @summary
	 * ifyou have extracted both the averageFps for the group and numberOfFriendsOnline ->
	 * This will separate it into 2 charts: 1 for the avgFps and 1 for the numberOfFriendsOnline.
	 * It is going to be priamarily used for the Bar Charts.
	 */
    divideCalculationData() {
        const chartDataObjectArray = [];

        for (let i = 0; i < this.chartData.length; i++) {
            const chartArray = this.chartData[i];
            const updatedChartArray = {};
            
            for (let j = 0; j < chartArray.length; j++) {
                const measurement = chartArray[j];
                const measurementDataArray = measurement.data;

                for (let k = 0; k < measurementDataArray.length; k++) {
                    const measurementData = measurementDataArray[k];
                    const valueKey = Object.keys(measurementData).find(value => value !== 'count');

                    if(!Array.isArray(updatedChartArray[valueKey])) updatedChartArray[valueKey] = [];
                    updatedChartArray[valueKey].push({...measurement, data: [measurementData]});
                }
            }

            chartDataObjectArray.push(updatedChartArray);
        }

        const chartData = [];

        for (let i = 0; i < chartDataObjectArray.length; i++) {
            const chartDataObject = chartDataObjectArray[i];
            const chartDataObjectKeys = Object.keys(chartDataObject);

            for (let j = 0; j < chartDataObjectKeys.length; j++) {
                const arrayKey = chartDataObjectKeys[j];
                chartData.push(chartDataObject[arrayKey])
            }
        }

        this.chartData = chartData;
	}
	
	/**
	 * Internal Method
	 * @description Adds a color to represent each of the different data groups of chartData.
	 */
	colorizeData() {
		if(this.chartData.length === 0) return;
		const chartData = [];
		for (let i = 0; i < this.chartData.length; i++) {
			const group = this.chartData[i];
			const valueKeys = {};

			chartData.push([]);
			
			for (let j = 0; j < group.length; j++) {
				const measurement = group[j];

				chartData[i].push({ data: [] });
				Object.keys(measurement).forEach(key => {
					if(key === 'data') return;
					chartData[i][j][key] = measurement[key];
				});

				for (let k = 0; k < measurement.data.length; k++) {
					const dataObject = measurement.data[k];
					const valueKey = Object.keys(dataObject).find(key => key !== 'count');
					let color = undefined;

                    if(valueKeys[valueKey] === undefined) {
                        color = generateColor();
                        valueKeys[valueKey] = color;
                    }
					else color = valueKeys[valueKey];

					chartData[i][j]['data'].push({...dataObject, color});
				}
			}
		}

		this.chartData = chartData;
	}
}

export default TimeNumberChartData;