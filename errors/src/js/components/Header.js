import React from 'react';
import ziango_logo_small from '../../img/ziango_logo_small.png'

class Header extends React.PureComponent {
    render() {

        return (
            <div id='Header'>
                <h1 className='secondary-color'>
                    gamepoint
                    <span className='primary-color font-heavy'>dashboard</span>
                </h1>
                <h1 className='secondary-color'>manage errors</h1>
                <img src={ziango_logo_small} />
            </div>
        );
    }
}

export default Header;