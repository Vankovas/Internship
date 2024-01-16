import React, { PureComponent } from 'react';


class Dot extends PureComponent {
    constructor(props) {
        super(props);
        this.state = { 
            radius: 2,
            x: 0,
            y: 0,
        }

        this._onMouseEnter = this._onMouseEnter.bind(this);
        this._onMouseLeave = this._onMouseLeave.bind(this);
    }

    render() { 
        return  <React.Fragment>
                    {/* The invisible circle is used to extend the detection range of the onMouseOver/Leave event. */}
                    {/* Pointer events have to be explicitly enabled on the invisible circle and disabled on the visible one. */}
                    <circle 
                        pointerEvents='all'
                        cx={this.props.cx}
                        cy={this.props.cy}
                        r={6}
                        fill='none'
                        onMouseOver={this._onMouseEnter}
                        onMouseLeave={this._onMouseLeave}
                    />
                    <circle 
                        pointerEvents='none'
                        cx={this.props.cx}
                        cy={this.props.cy}
                        r={this.state.radius}
                        fill={this.props.fill}
                    />
                </React.Fragment>
    }


    _onMouseEnter(e) {
        this.props.updateTooltip(this.props.tooltipData, true, e.pageX, e.pageY);
        this.setState({radius: 6});
    }

    _onMouseLeave() {
        this.props.updateTooltip([], false, 0, 0);
        this.setState({radius: 2});
    }
}
 
export default Dot;