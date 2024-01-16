import SimilarErrorsModal from './SimilarErrorsModal';

import { postResolveErrors } from '../data/connectionHelper'

class ResolveSimilarErrorsModal extends SimilarErrorsModal {

    constructor(props) {
        super(props);
    }

    getDedicatedQuery(checkedIds) {
        return postResolveErrors(checkedIds);
    }

    getComponentAction() {
        return 'resolve';
    }

    getTitle() {
        return 'Check which similar errors should be resolved.';
    }
}

export default ResolveSimilarErrorsModal;