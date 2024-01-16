import React, { Component } from 'react';

import radio_button_checked from '../../img/radio_button_checked.svg';
import radio_button_unchecked from '../../img/radio_button_unchecked.svg'

/**
 * A component which gives the user the ability to select either a singular value with a comparator or to specify a range between 2 values.
 * @props updateValues - specify a function which will receive the returned value object.
 * @returns singular - { comparator: x, value: y }
 * @returns ranged - { start: x, end: y }
 * 
 */
class RangedInput extends Component {
    constructor(props){
        super(props);

        this.state = {
            isRanged: false,
            first: {
                comparator: '',
                value: '',
            },
            ranged: {
                start: '',
                end: '',
            },
        };

        this.setToSingular = this.setToSingular.bind(this);
        this.setToRanged = this.setToRanged.bind(this);
        this.onValueChanged = this.onValueChanged.bind(this);
        this.renderSingularInput = this.renderSingularInput.bind(this);
        this.renderSingularInput = this.renderSingularInput.bind(this);
        this.renderSelectOptions = this.renderSelectOptions.bind(this);
        this.onClickClear = this.onClickClear.bind(this);
        this.onChangeFirstComparator = this.onChangeFirstComparator.bind(this);
        this.onChangeFirstValue = this.onChangeFirstValue.bind(this);
        this.onChangeStartRangedValue = this.onChangeStartRangedValue.bind(this);
        this.onChangeEndRangedValue = this.onChangeEndRangedValue.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.state.isRanged !== nextState.isRanged) return true;
        if(this.compareObjects(this.state.first, nextState.first) === true) return true;
        if(this.compareObjects(this.state.ranged, nextState.ranged) === true) return true;

        return false;
    }

    componentDidUpdate() {
        if(this.state.isRanged === true && (this.state.ranged.start === '' || this.state.ranged.end === '' || parseFloat(this.state.ranged.start) >= parseFloat(this.state.ranged.end))) return;
        if(this.state.isRanged !== true && (this.state.first.comparator === '' || this.state.first.value === '')) return;
        this.onValueChanged();
    }

    compareObjects(start, end) {
        const keysA = Object.keys(start);
        const keysB = Object.keys(end);

        if(keysA.length !== keysB.length) return true;

        for (let i = 0; i < keysA.length; i++) {
            const key = keysA[i];
            if(start[key] !== end[key]) return true;
        }

        return false;
    }

    render() { 
        return (
            <div id='RangedInput'>

                <div className='rangedinput-heading'>
                    <label htmlFor={`${this.props.title}`}>{this.props.title}</label>
                    <button className='button-narrow button-transparent' onClick={this.onClickClear}>clear</button>
                </div>

                <div className='rangedinput-toggle'>
                    <div className='rangedinput-toggle-group' onClick={this.setToSingular}>
                        <img src={this.state.isRanged !== true ? radio_button_checked : radio_button_unchecked}/>
                        <label htmlFor='ranged'>Comparator Mode</label>
                    </div>

                    <div className='rangedinput-toggle-group' onClick={this.setToRanged}>
                        <img src={this.state.isRanged === true ? radio_button_checked : radio_button_unchecked}/>
                        <label htmlFor='ranged'>Range Mode</label>
                    </div>

                </div>

                <div>
                    { this.state.isRanged ? this.renderRangedInput() : this.renderSingularInput() }
                </div>

            </div>
        );
    }

    setToSingular() {
        if(this.state.isRanged === true) this.setState({
            isRanged: false,
            ranged: {
                start: '',
                end: '',
            },
        }, this.props.updateValues([]));
    }
    
    setToRanged() {
        if(this.state.isRanged !== true) this.setState({
            isRanged: true,
            first: {
                comparator: '',
                value: '',
            }
        }, this.props.updateValues([]));
    }

    onValueChanged() {
        let values = [];

        if (this.state.first.comparator !== '' && this.state.first.value !== '' && this.state.first.value >= 0)
            values = [
                { ...this.state.first, value: parseFloat(this.state.first.value) },
            ];

        if (this.state.isRanged === true && this.state.ranged.start !== '' && this.state.ranged.end !== '')
            values = [
                { comparator: 'gte', value: parseFloat(this.state.ranged.start) },
                { comparator: 'lte', value: parseFloat(this.state.ranged.end) },
            ];

        this.props.updateValues(values);
    }

    renderSingularInput() {
        return  <div className='rangedinput-singular-group'>
                    <select type='number' value={this.state.first.comparator} onChange={this.onChangeFirstComparator}>
                        <option disabled={true} value=''>select/leave blank</option>
                        {this.renderSelectOptions()}
                    </select>
                    <input className={this.state.first.comparator !== '' && this.state.first.value === '' ? 'error-border' : ''} disabled={this.state.first.comparator === ''} type='number' value={this.state.first.value} onChange={this.onChangeFirstValue}/>
                </div>
    }

    renderRangedInput() {
        return  <div className='rangedinput-ranged-group'>
                        <input className={this.state.ranged.start === '' ? 'error-border' : ''} type='number' value={this.state.ranged.start} onChange={this.onChangeStartRangedValue}/>
                        <label className='rangedinput-ranged-group__label' htmlFor='endRange'>{'<->'}</label>
                        <input className={this.state.ranged.end === '' || parseFloat(this.state.ranged.start) >= parseFloat(this.state.ranged.end) ? 'error-border' : ''} type='number' value={this.state.ranged.end} onChange={this.onChangeEndRangedValue}/>
                </div>
    }

    renderSelectOptions() {
        const options = [{value: 'lte', text:'less than'}, {value: 'gte', text:'greater than'}]
        if(this.state.isRanged !== true) options.unshift({value: 'eq', text: 'equals to'});

        return options.map(option => <option key={option.value + option.text} value={option.value}>{option.text}</option>)
    }

    onClickClear() {
        this.setState({
            isRanged: false,
            first: {
                comparator: '',
                value: '',
            },
            ranged: {
                start: '',
                end: '',
            },
        });
    }

    onChangeFirstComparator(e) {
        const first = { ...this.state.first, comparator: e.target.value };
        this.setState({first});
    }

    onChangeFirstValue(e) {
        const first = { ...this.state.first, value: e.target.value };
        this.setState({first});
    }

    onChangeStartRangedValue(e) {
        const ranged = { ...this.state.ranged, start: e.target.value };
        this.setState({ranged});
    }

    onChangeEndRangedValue(e) {
        const ranged = { ...this.state.ranged, end: e.target.value };
        this.setState({ranged});
    }
}
 
export default RangedInput;