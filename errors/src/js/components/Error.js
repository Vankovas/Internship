import React from 'react';

import { formatTimestamp } from '../../../../common/util/timestampFormatter';

import open_svg from '../../img/open_in_new.svg';
import resolve_svg from '../../img/done_all.svg';
import delete_svg from '../../img/cancel.svg';
import warning from '../../img/assignment_late.svg';
import resolved_tag from '../../img/check_circle.svg'
import ignored_tag from '../../img/remove_circle.svg';
import prioritized_tag from '../../img/star.svg';

class Error extends React.PureComponent {
    constructor(props) {
        super(props);

        this.onOpenClick = this.onOpenClick.bind(this);
        this.onResolveClick = this.onResolveClick.bind(this);
        this.onDeleteClick = this.onDeleteClick.bind(this);
    }

    render() {
        const { timeStamp, userName, _id, message, gameId, gameVersion, origin, isSolved, isIgnored, hasPriority } = this.props.error;

        return (
            <div id='Error' key={_id}>
                <div className='error-header'>
                    <div className='error-header-left'>
                            <p>{formatTimestamp(timeStamp)}</p>

                            { isSolved &&
                                <img className='error-header-left__resolved-tag' src={resolved_tag} />
                            }
                            { isIgnored &&
                                <img className='error-header-left__ignored-tag' src={ignored_tag} />
                            }
                            { hasPriority &&
                                <img className='error-header-left__prioritized-tag' src={prioritized_tag} />
                            }
                    </div>

                    <div className='error-header-right'>
                        <img src={delete_svg} onClick={this.onDeleteClick} />
                        <img src={resolve_svg} onClick={this.onResolveClick} />
                        <img src={open_svg} onClick={this.onOpenClick} />
                    </div>
                </div>

                <div className='error-fields'>
                    <div className='error-fields-message'>
                        <img src={warning} className='error-fields-message__img'/>
                        <p className='error-fields-message__text'>{message}</p>
                    </div>


                    <div className='error-fields-contents'>
                        <div className='error-fields-contents-group'>
                            <p className='error-fields-contents-group__title'>username:</p>
                            <p className='error-fields-contents-group__value'>{userName}</p>
                        </div>

                        <div className='error-fields-contents-group'>
                            <p className='error-fields-contents-group__title'>game:</p>
                            <p className='error-fields-contents-group__value'>{gameId}</p>
                        </div>

                        <div className='error-fields-contents-group'>
                            <p className='error-fields-contents-group__title'>origin:</p>
                            <p className='error-fields-contents-group__value'>{origin}</p>
                        </div>

                        <div className='error-fields-contents-group'>
                            <p className='error-fields-contents-group__title'>game version:</p>
                            <p className='error-fields-contents-group__value'>{gameVersion}</p>
                        </div>
                    </div>
                    
                </div>
            </div>
        );
    }

    onOpenClick() {
        this.props.open(this.props.error._id);
    }

    onResolveClick() {
        this.props.resolve(this.props.error);
    }

    onDeleteClick() {
        this.props.delete(this.props.error);
    }
}

export default Error;