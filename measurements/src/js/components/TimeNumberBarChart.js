import React from 'react';
import * as d3 from 'd3';
import Axis from './Axis';

const width = 1800;
const height = 400;
const margin = { top: 20, right: 30, bottom: 20, left: 200 };


class TimeNumberBarChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            bars: [],
            labels: [],
            xScale: d3.scaleTime().range([margin.left, width - margin.right]),
            yScale: d3.scaleLinear().range([height - margin.bottom, margin.top]),
        };

        this.xAxis = d3                                         
            .axisBottom()                                       
            .scale(this.state.xScale)                           
            .tickFormat(d3.timeFormat(this.props.xTimeFormat)); 

        this.yAxis = d3                                        
            .axisLeft()                                         
            .scale(this.state.yScale)                          
            .tickFormat(d => `${d} ${this.props.yTickTag}`)     
            .tickSize(width * -1);                              

        this.innerWidth = width - margin.left - margin.right;

        this.renderPopup = this.renderPopup.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.xTimeFormat !== nextProps.xTimeFormat) return true;

        if(this.state.bars.length !== nextState.bars.length) return true;
        for (let i = 0; i < this.state.bars.length; i++) {
            const currentBar = this.state.bars[i];
            const nextBar = nextState.bars[i];

            if(Object.keys(currentBar).length !== Object.keys(nextBar).length) return true;
            for (const barKey of Object.keys(currentBar)) {
                if(currentBar[barKey] !== nextBar[barKey]) return true;
            }
        }

        if(this.state.labels.length !== nextState.labels.length) return true;
        for (let k = 0; k < this.state.labels.length; k++) {
            const currentLabel = this.state.labels[k];
            const nextLabel = nextState.labels[k];

            if(currentLabel !== nextLabel) return true;
        }

        return false;
    }

    //TODO: Ivan: check if forceUpdate can be of use (perhaps even using a throttle system)
    static getDerivedStateFromProps(nextProps, prevState) {
        if (!nextProps.data) return null;

        const { data } = nextProps;
        const { xScale, yScale } = prevState;
        const { yTickTag } = nextProps;

        const xDomain = d3.extent(data, d => d.date);
        const valMin = data.length > 1 ? d3.min(data, d => d[yTickTag]) : 0;
        const valMax = data.length > 1 ? d3.max(data, d => d[yTickTag]) : 60;
        xScale.domain(xDomain);
        yScale.domain([valMin, valMax]);
        const bars = [];
        const labels = [];

        data.forEach(d => {
            const yMin = yScale(valMin);
            const y2 = yScale(d[yTickTag]);

            bars.push({
                x: xScale(d.date),
                y: y2,
                height: yMin - y2,
                fill: d.fill
            });

            labels.push({
                x: xScale(d.date),
                y: y2 - 2,
                value: d[yTickTag],
            });
        });

        return { bars, labels };
    }

    render() {
        return (
            <svg width={width} height={height}>
                <g>
                    <Axis axis={this.xAxis.tickFormat(d3.timeFormat(this.props.xTimeFormat)).ticks(this.state.bars.length)} transform={`translate(0, ${height - margin.bottom})`}/>
                    <Axis axis={this.yAxis} transform={`translate(${margin.left}, 0)`}/>
                </g>

                {this.state.bars.map((d, i) => {
                    const nextIndex = i === this.state.bars.length - 1 ? i : i + 1;
                    const nextXValue = i === nextIndex ? this.state.bars[i] + 5 : this.state.bars[nextIndex].x;
                    return (
                        <rect
                            key={i}
                            x={d.x}
                            y={d.y}
                            data-index={i}
                            height={d.height}
                            fill={d.fill}
                            width={nextXValue - d.x < 30 && nextXValue - d.x > 1 ? nextXValue - d.x : 30}
                            style={{ opacity: 0.99 }}
                            onMouseOver={this.renderPopup}
                        />
                    );
                })}

                {this.state.labels.map((d, i) => (
                    <text key={i} x={d.x} y={d.y} style={{ fontWeight: 800 }}>
                        {d.value.toFixed(2)}
                    </text>
                ))}
            </svg>
        );
    }
}

export default TimeNumberBarChart;
