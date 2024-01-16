import React from 'react';

class CheckableError extends React.PureComponent {

    constructor(props) {
        super(props);

        this.onElementCheckChange = this.onElementCheckChange.bind(this);
    }
    
    render() { 
        return ( 
            <tr className='modal-contents-errors-table-item'>
                <td id='modal-contents-table__checkbox'>
                    <input 
                        type='checkbox' 
                        onChange={this.onElementCheckChange} 
                        checked={this.props.error.checked ? true : false} 
                    />
                </td>

                <td>{this.props.error.message}</td>
                <td>{this.props.error.userName} </td>
                <td>{this.props.error.gameVersion}</td>
            </tr>
         );
    }

    onElementCheckChange(e) {
        this.props.onElementCheckChange(this.props.error._id);
    }
}
 
export default CheckableError;