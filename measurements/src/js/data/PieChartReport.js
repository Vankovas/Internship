class PieChartReport {
	constructor() {
		this.data = {};
	}

	finalize(action) {
        const nonConsolidatedData = this.data;
        this.data = {};
        this.recursiveDiscover(nonConsolidatedData, [], action);
    }

	inject(pie) {
		this.recursiveDiscover(pie, []);
	}

	recursiveDiscover(inputObject, path, action) {
		if (typeof inputObject === 'number' && action === undefined || Array.isArray(inputObject) && action) {
			let currentPathObject = this.data;

			path.forEach((p, index) => {
				if (index < path.length - 1) {
                    if (!currentPathObject[p]) currentPathObject[p] = {};
					currentPathObject = currentPathObject[p];
                }
                else {
                    if(action) this.injectCalculationAction(currentPathObject, p, inputObject, action);
                    else this.injectArray(currentPathObject, p, inputObject);
				}
			});
        } 
        else {
			Object.keys(inputObject).forEach(k => {
				this.recursiveDiscover(inputObject[k], [...path, k], action);
			});
		}
    }
    
    injectArray(object, path, value) {
        if(!object[path]) object[path] = [];
        object[path].push(value);
    }

    injectCalculationAction(object, path, array, action) {
        let value = 0;
        if(action === 'sum') value = array.reduce((a,b) => a + b, 0);
        if(action === 'avg') value = array.reduce((a,b) => a + b, 0) / array.length;
        object[path] = parseInt(value.toFixed(0));
    }
}

export default PieChartReport;