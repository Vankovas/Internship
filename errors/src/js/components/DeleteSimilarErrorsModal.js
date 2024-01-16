import SimilarErrorsModal from './SimilarErrorsModal';

import { postDeleteErrors } from '../data/connectionHelper'

class DeleteSimilarErrorsModal extends SimilarErrorsModal {

    constructor(props) {
        super(props);
    }

    getDedicatedQuery(checkedIds) {
        return postDeleteErrors(checkedIds);
    }

    getComponentAction() {
        return 'delete';
    }

    getTitle() {
        return 'Check which similar errors should be deleted.';
    }
}

export default DeleteSimilarErrorsModal;