import React from 'react';
import * as d3 from 'd3';

import Axis from './Axis';
import Line from './LineD3';
import Dot from './Dot';
import Tooltip from './Tooltip';

//TODO: Make these variables to be specified in the props (will be of use when styling probably)?
const width = 1200;
const height = 400;
const margin = { top: height/20, right: width/15, bottom: height/20, left: width/5 };


class TimeNumberLineChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dots: [],
            lines: [],
            labels: [],
            legend: {},
            xScale: d3.scaleTime().range([margin.left, width - margin.right]),
            yScale: d3.scaleLinear().range([height - margin.bottom, margin.top]),
            lineGenerator: d3.line().curve(d3.curveCatmullRom),
            tooltip: {
                data: [],
                shouldRender: false,
                x: 0,
                y: 0,
            },
        };

        this.xAxis = d3                                         
            .axisBottom()                                       
            .scale(this.state.xScale)                           
            .tickFormat(d3.timeFormat(this.props.xTimeFormat)); 

        this.yAxis = d3                                        
            .axisLeft()                                         
            .scale(this.state.yScale)                          
            .tickFormat(d => `${d}`)     
            .tickSize((width - margin.left - margin.right) * -1);

        this.innerWidth = width - margin.left - margin.right;
        this.tooltipRef = React.createRef();

        this.updateTooltip = this.updateTooltip.bind(this);

    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.xTimeFormat !== nextProps.xTimeFormat) return true;

        if( this.compareObjectArrays(this.state.dots, nextState.dots) === true ||
            this.compareObjectArrays(this.state.labels, nextState.labels) === true ||
            this.compareObjectArrays(this.state.lines, nextState.lines) === true
        ) return true; 

        if(this.props.data && nextProps.data && this.dataDidChange(this.props.data, nextProps.data) === true) return true;

        for (let i = 0; i < Object.keys(this.state.tooltip).length; i++) {
            const tooltipKey = Object.keys(this.state.tooltip)[i];
            if(this.state.tooltip[tooltipKey] !== nextState.tooltip[tooltipKey]) return true;
        }

        return false;
    }

    compareObjectArrays(arr1, arr2) {
        if(arr1.length !== arr2.length) return true;

        for (let i = 0; i < arr1.length; i++) {
            const element1 = arr1[i];
            const element2 = arr2[i];

            const keys1 = Object.keys(element1);
            const keys2 = Object.keys(element2);

            if(keys1.length !== keys2.length) return true;

            for (let j = 0; j < keys1.length; j++) {
                const key = keys1[j];
                if(element1[key] !== element2[key]) return true;
            }
        }

        return false;
    }

    dataDidChange(first, second) {
        if(first.length !== second.length) return true;

        for (let i = 0; i < first.length; i++) {
            const firstElement = first[i];
            const secondElement = second[i];

            const firstElementKeys = Object.keys(firstElement);
            const secondElementKeys = Object.keys(secondElement);

            if(firstElementKeys.length !== secondElementKeys.length) return true;

            for (let j = 0; j < firstElementKeys.length; j++) {
                const elementKey = firstElementKeys[j];
                
                if(elementKey === 'data') {
                    const firstDataArray = firstElement['data'];
                    const secondDataArray = secondElement['data'];

                    if(firstDataArray.length !== secondDataArray.length) return true;

                    for (let k = 0; k < firstDataArray.length; k++) {
                        const firstData = firstDataArray[k];
                        const secondData = secondDataArray[k];

                        const firstDataKeys = Object.keys(firstData);
                        const secondDataKeys = Object.keys(secondData);

                        if(firstDataKeys.length !== secondDataKeys.length) return true;

                        for (let x = 0; x < firstDataKeys.length; x++) {
                            const key = firstDataKeys[x];
                            
                            if(firstData[key] !== secondData[key]) return true;
                        }
                    }
                }
                else if(firstElement[elementKey] !== secondElement[elementKey]) return true;
            }
        }

        return false;
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (!nextProps.data) return null;
        
        const { data } = nextProps;
        const { xScale, yScale, lineGenerator } = prevState;

        const legend = {};
        const lines = [];
        const labels = [];
        const dots = [];

        const dividedByLineData = {};
        let min, max = undefined; 

        for (let i = 0; i < data.length; i++) {
            const element = data[i];

            for (let j = 0; j  < element.data.length; j++) {
                const dataElement = element.data[j];
                const dataElementKeys = Object.keys(dataElement);

                const dataElementValueKey = dataElementKeys.find(value => (value !== 'count' && value !== 'color'));
                const dataElementValue = dataElement[dataElementValueKey];

                if(legend[dataElementValueKey] === undefined) legend[dataElementValueKey] = dataElement['color'];

                if(dividedByLineData[dataElementValueKey] === undefined) dividedByLineData[dataElementValueKey] = [{date: element.date, ...dataElement}];
                else dividedByLineData[dataElementValueKey].push({date: element.date, ...dataElement});

                if(min === undefined || min > dataElementValue) min = dataElementValue;
                if(max === undefined || max < dataElementValue) max = dataElementValue;
            }
        }

        let xDomain = d3.extent(data, d => d.date);

        xScale.domain(xDomain);
        yScale.domain([min, max]);
        lineGenerator.x(d => xScale(d.date));

        const dividedByLineDataKeys = Object.keys(dividedByLineData);

        for (let i = 0; i < dividedByLineDataKeys.length; i++) {
            const dividedByLineDataKey = dividedByLineDataKeys[i];
            
            lineGenerator.y(d => yScale(d[dividedByLineDataKey]));
            lines.push({
                path: lineGenerator(dividedByLineData[dividedByLineDataKey]),
                fill: legend[dividedByLineDataKey],
            });

            for (let j = 0; j < dividedByLineData[dividedByLineDataKey].length; j++) {
                const formattedElement = dividedByLineData[dividedByLineDataKey][j];
                const y2 = yScale(formattedElement[dividedByLineDataKey])
                
                dots.push({
                    x: xScale(formattedElement['date']),
                    y: y2,
                    radius: 5,
                    fill:'black',
                    tooltipData: [
                        { date: formattedElement['date'].toLocaleString() },
                        { measurements: formattedElement['count'] },
                        { type: dividedByLineDataKey },
                        { value: formattedElement[dividedByLineDataKey] }
                    ],
                })
            }
        }

        return {labels, lines, legend, dots}
    }

    render() {
        if(!this.props.data || this.props.data.length <= 1) return null;
        return (
            <React.Fragment>
                { this.state.tooltip.shouldRender === true &&
                    <Tooltip 
                        data={this.state.tooltip.data}
                        x={this.state.tooltip.x}
                        y={this.state.tooltip.y}
                    />
                }
                <svg width={width} height={height}>
                    <g>
                        <Axis 
                            axis={this.xAxis.tickFormat(d3.timeFormat(this.props.xTimeFormat)).ticks(this.props.data.length <= 30 ? this.props.data.length : 30)} 
                            transform={`translate(0, ${height - margin.bottom})`}
                        />
                        <Axis 
                            isYAxis={true}
                            axis={this.yAxis} 
                            transform={`translate(${margin.left}, 0)`}
                        />
                    </g>

                    { this.state.lines.map((line,i) => (
                        <Line 
                            key={i}
                            path={line.path}
                            stroke={line.fill} 
                            fill='none'
                            strokeWidth='2' 
                        />
                    ))}

                    { this.state.labels.map((d, i) => (
                        <text className='d3-chart-label' key={i} x={d.x} y={d.y}>
                            {d.value === null ? 0 : d.value.toFixed(2)}
                        </text>
                    ))}

                    { this.state.dots.map(({x, y, fill, tooltipData}, i) => (
                        <Dot
                            key={'dot' + i}
                            cx={x} 
                            cy={y} 
                            fill={fill}
                            updateTooltip={this.updateTooltip}
                            tooltipData={tooltipData}
                        />
                    ))}

                    <g>
                        { Object.keys(this.state.legend).map((legendKey, i) => {
                            return  <g key={`legend ${i}`}>
                                        <rect 
                                            x={0} 
                                            y={(4 * 2 + i * 4 + 1) + 'rem'} 
                                            height={3.2 + 'rem'} 
                                            width={3.2 + 'rem'} 
                                            fill={this.state.legend[legendKey]}
                                        />
                                        <text 
                                            x={4 + 'rem'} 
                                            y={(4 * 2 + i * 4 + 1.3 + 4/2) + 'rem'}
                                            fill='white'
                                            style={{fontSize: '1.4rem', fontWeight: 100}}
                                        >
                                            {legendKey}
                                        </text>
                                    </g>
                        })}
                    </g>
                    
                    <g>
                        <text x={0} y={0}>
                            <tspan style={{fontSize: '1.4rem', fontWeight: 100}} fill='white' x={0} dy={2 + 'rem'} >from: {this.props.data[0].date.toLocaleString()}</tspan>
                            <tspan style={{fontSize: '1.4rem', fontWeight: 100}} fill='white' x={0} dy={2 + 'rem'} >to: {this.props.data[this.props.data.length - 1].date.toLocaleString()}</tspan>
                        </text>
                    </g>
                </svg>
            </React.Fragment>
        );
    }

    updateTooltip(data, shouldRender, x, y) {
        this.setState({ tooltip: {data, shouldRender, x, y} });
    }
}

export default TimeNumberLineChart;
