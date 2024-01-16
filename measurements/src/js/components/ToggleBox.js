import React from 'react';

function ToggleBox({ value, onClick }) {
	return (
		<div id='ToggleBox'>
			<div
				className={`toggle${value === true ? ' toggle-on' : ''}`}
				onClick={onClick}
			>
				<div className='toggle__rect'></div>
			</div>
		</div>
	);
}

export default ToggleBox;
