import React from 'react';


/**
 * @props
 * @param {String} path
 * @param {String} stroke
 * @param {String} fill
 * @param {Number} strokeWidth 
 */
class LineD3 extends React.PureComponent {

    render() {
        let { path, stroke, fill, strokeWidth } = this.props;
		return (
            <path 
                d={path} 
                fill={fill} 
                stroke={stroke} 
                strokeWidth={strokeWidth}
            />
		);
    }
}

export default LineD3;