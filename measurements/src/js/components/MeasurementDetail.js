import React from 'react';

class MeasurementDetail extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className='detailed-measurement' key={this.props.detailedMeasurement._id}>{
                    Object.keys(this.props.detailedMeasurement).map(function (key, index) {
                        return (
                            <div key={key} className='detailed-measurement-field'>

                                <div className='detailed-measurement-field-title'>
                                    {key}
                                </div>

                                <div className='detailed-measurement-field-content'>
                                    {this.props.detailedMeasurement[key]}
                                </div>
                                
                            </div>
                        ); 
                    }) 
            }
            </div>
        )
    }
}

export default MeasurementDetail;