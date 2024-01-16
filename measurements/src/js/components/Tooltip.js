import React, { Component } from 'react';

class Tooltip extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            height: 0,
            width: 0,
        }

        this.currentTooltip = React.createRef()
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.state.height !== nextState.height) return true;
        if(this.state.width !== nextState.width) return true;

        if(this.props.x !== nextProps.x) return true;
        if(this.props.y !== nextProps.y) return true;

        if(this.props.data.length !== nextProps.data.length) return true;

        for (let i = 0; i < this.props.data.length; i++) {
            const currentData = this.props.data[i];
            const nextData = nextProps.data[i];

            const currentDataKeys = Object.keys(currentData);
            const nextDataKeys = Object.keys(nextData);

            if(currentDataKeys.length !== nextDataKeys.length) return true;

            for (let j = 0; j < currentDataKeys.length; j++) {
                const key = currentDataKeys[j];
                if(currentData[key] !== nextData[key]) return true;
            }
        }

        return false;
    }

    componentDidMount() {
        const height = this.currentTooltip.current.offsetHeight;
        const width = this.currentTooltip.current.offsetWidth;
        this.setState({width, height});
    }

    render() {

        let {data, x, y} = this.props;

        const styles = {
            top: y - 20 - this.state.height,
            left: x - this.state.width/2,
            position: "absolute"
        };

        return  (
            <div id='Tooltip' style={styles} ref={this.currentTooltip}>
                { data.map((el, i) => {
                    const key = Object.keys(el)[0];
                    return (
                        <div key={i}>
                            <p className='tooltip__title'>{key}</p>
                            <p className='tooltip__value'>{el[key]}</p>
                        </div>
                    )
                    })
                }
            </div>
        );
    }
}
 
export default Tooltip;