import React from 'react';
import * as d3 from 'd3';

import { formatTimestamp } from '../../../../common/util/timestampFormatter'


const Arc = ({ data, index, createArc, color, percentages, percentageData, label, measurementData, updateTooltip}) => {
	
	function _onMouseEnter(e) {
		const tooltipData = [
			{ 'category': label },
			{ 'percentage': percentageData.toFixed(2) + '%' },
			{ 'measurements': measurementData },
		];
        updateTooltip(tooltipData, true, e.pageX, e.pageY);
    }

    function _onMouseLeave() {
        updateTooltip([], false, 0, 0);
	}
	if(data.value === 0 || data.value === null) return null;
	return (
		<g key={index} className='arc' onMouseMove={_onMouseEnter} onMouseLeave={_onMouseLeave}>
			<path 
				d={createArc(data)} 
				fill={color} 
			/>
			<text
				transform={`translate(${createArc.centroid(data)})`}
				textAnchor='middle'
				alignmentBaseline='middle'
				fill='white'
				fontSize='10'
			>
				{ (percentages === true ? data.value.toFixed(1) : data.value) + (percentages === true ? '%' : '')}
			</text>
		</g>
	);
};

/** 
 * @props
 * @param {Array} data - num of measurements int[5] [0-20, 20-30, 30-40, 40-50, 50+]
 * @param {Object} details - has a bool percentages field to toggle percentage view
 * @param {number} width - Sets width in pixels
 * @param {number} height - Sets height in pixels
 * @param {number} innerRadius - Sets inner radius in pixels
 * @param {number} outerRadius - Sets outer radius in pixels
 * @function updateTooltip - Below parameters are for this function
 * @param {Array} tooltipData - Provide the data for the tooltip here in a format [ { 'title': 'value' } ]
 * @param {bool} shouldRender - Should the tooltip render
 * @param {number} x - X value of the tooltip
 * @param {number} y - Y value of the tooltip 
*/

const PieChartD3 = props => {
	const createPie = d3
		.pie()
		.value(d => d)
        .sort(null);
	const createArc = d3
		.arc()
		.innerRadius(props.innerRadius)
		.outerRadius(props.outerRadius);
	const labels = ['0-20', '20-30', '30-40', '40-50', '50+'];
	const colors = ['#E74C3C', '#F39C12', '#F1C40F', '#76D7C4', '#2ECC71'];
	const chosenData = props.details.percentages === true ? props.details.percentageData : props.data;
	const data = createPie(chosenData);

	const chosenDataNotNullFieldLength = chosenData.filter(data => {
		if(data === 0 || data === null) return false;
		else return true;
	}).length;

	if(chosenDataNotNullFieldLength === 0) return null;
	return (
		<svg width={props.width} height={props.height + 100}>
			<g transform={`translate(${props.width/2} ${(props.height + 100)/2})`}>
				{data.map((d, i) => (
					<Arc
						key={i}
						data={d}
						index={i}
						createArc={createArc}
						color={colors[i]}
						percentages={props.details.percentages === true}
						percentageData={props.details.percentageData[i]}
						measurementData={props.data[i]}
						label={labels[i]}
						updateTooltip={ function(data, shouldRender, x, y) { props.updateTooltip(data, shouldRender, x, y); }}
					/>
				))}
			</g>
			<g>
				<text x={0} y={0}>
					<tspan style={{fontSize: '2rem', fontWeight: 100}} fill='white' x={0} dy={3 + 'rem'} >from: {formatTimestamp(props.details.startPeriod)}</tspan>
					<tspan style={{fontSize: '2rem', fontWeight: 100}} fill='white' x={0} dy={3 + 'rem'} >to: {formatTimestamp(props.details.endPeriod)}</tspan>
				</text>
			</g>

			<g>
				{ colors.map((color, i) => 	<g>
												<rect 
													x={0} 
													y={(4 * 2 + i * 4 + 1) + 'rem'} 
													height={3.2 + 'rem'} 
													width={3.2 + 'rem'} 
													fill={color} 
													key={`${color}${i}`}
												/>
												<text 
													x={4 + 'rem'} 
													y={(4 * 2 + i * 4 + 1.3 + 4/2) + 'rem'}
													fill='white'
													style={{fontSize: '2rem', fontWeight: 100}}
												>
													{labels[i] + ' FPS'}
												</text>
											</g>
				)}
			</g>
		</svg>
	);
};

export default PieChartD3;
