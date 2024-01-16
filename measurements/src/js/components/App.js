import React from 'react';

import Security from '../../../../common/security/Security';
import Header from './Header';
import MeasurementContainer from './MeasurementContainer';

class App extends React.Component {
    constructor() {
        super();

        this.state = {
            measurementContainerSliderIsCollapsed: false,
        };

        this.security = new Security();
        this.toggleLeftPanel = this.toggleLeftPanel.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.state.measurementContainerSliderIsCollapsed !== nextState.measurementContainerSliderIsCollapsed) return true;

        return false;
    }

    render() {
        return (
            <div id='main'>
                <MeasurementContainer isCollapsed={this.state.measurementContainerSliderIsCollapsed} toggleLeftPanel={this.toggleLeftPanel} />
                {/* <Header /> */}
            </div>
        );
    }

    toggleLeftPanel() {
        this.setState({ measurementContainerSliderIsCollapsed: !this.state.measurementContainerSliderIsCollapsed });
    }
}

export default App;