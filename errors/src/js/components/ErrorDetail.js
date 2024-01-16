import React from 'react';

class ErrorDetail extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        const detailedError = this.props.detailedError;

        return (
            <div id='ErrorDetail' key={detailedError._id}>
                {
                    Object.keys(detailedError).map(function (key, index) {
                        return (
                            <div key={key} className='error-detail-field'>
                                <div className='error-detail-field__title'>
                                    {key}
                                </div>
                                <div className='error-detail-field__content'>
                                    {detailedError[key].toString()}
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        );
    }
}

export default ErrorDetail;