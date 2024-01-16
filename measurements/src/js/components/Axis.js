import React from 'react';
import * as d3 from 'd3';

class Axis extends React.Component {
    //TODO Ivan: use the proper react ref syntax
    //TODO Jochen: This example uses refs, which the React docs caution against, but it uses refs to integrate with a third-party DOM library, which is one of the reasons to use refs that the React docs call out specifically.

    componentDidMount() { this.renderAxis(); }
    componentDidUpdate() { this.renderAxis(); }

    renderAxis() {
	    const axis = this.props.axis;

	    d3.select(this.refs.g).call(axis);  
    }

    render() {
        const transform = this.props.transform;
    	return <g transform={transform} ref="g" className={`d3-chart__axis ${this.props.isYAxis === true ? 'd3-y-axis' : ''}`}/>
    }
}

export default Axis;