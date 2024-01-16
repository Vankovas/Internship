import { getRequest, postRequest } from '../../../../common/WebRequest';

const rootHost = () => {
    return window.security.rootHost;
};

const host = () => {
    return window.security.host;
};

export const getQuerySummary = (newAndUnique, queryFields) => {
    let query = undefined;
    if(newAndUnique === true) query = 'new-and-unique';
    else if(newAndUnique === false && queryFields !== undefined) query = parseQueryParameters(queryFields);

    return new Promise((resolve, reject) => {
        getRequest(`${host()}/query-summary/${query}`)

            .then(data => {
                if(data && data.data)
                    resolve(data.data);

                else
                    reject(null);
            })

            .catch(err => reject(err));
    });
};

export const getNewAndUniqueErrors = () => {

    return new Promise((resolve, reject) => {

        getRequest(`${host()}/new-and-unique/`)

            .then(data => {
                if(data && data.data) 
                    resolve(data.data);
                else 
                    reject(null);
            })

            .catch(err => reject(err));
    });
};

export const getErrors = (queryParametersInput) => {
    const query = parseQueryParameters(queryParametersInput);

    return new Promise((resolve, reject) => {
        getRequest(`${host()}/${query}`)

            .then(data => {

                if(data && data.data)
                    resolve(data.data);

                else
                    reject(null);
            })

            .catch(err => reject(err));
    });
};

const parseQueryParameters = (queryParametersInput) => {
    let query = '?';
    const queryParameters = [];

    //Parse parameters to query parameters
    for (const key in queryParametersInput) {
            if(key === 'uniqueFields') {
                const uniqueFieldsArray = queryParametersInput[key];
                //Push Unique Fields Array to Query Parameters
                if(uniqueFieldsArray.length > 0)
                    uniqueFieldsArray.forEach(element => {
                        queryParameters.push(`${key}[]=${element}`);
                    });
            }
            else {
                //Format the other query parameters for in the url format
                queryParameters.push(`${key}=${queryParametersInput[key]}`);
            }
    }
    
    //Check for parameters
    if(queryParameters.length > 0)
        queryParameters.forEach(param => {
            if(query.length === 1)
                query += param;
            else
                query += ('&' + param);
        });

    return query.length > 1 ? query : '';
};

export const getErrorDetails = errorId => {
    return new Promise((resolve, reject) => {
        getRequest(`${host()}/${errorId}`)
            
            .then(data => {
                    if(data) {
                        resolve(data.data);
                    } 
                    else {
                        reject(null);
                    }
                })

            .catch(err => reject(err));
    });
};

export const getConfiguration = () => {

    return new Promise((resolve, reject) => {
        getRequest(`${rootHost()}/configurations/`)

            .then(config => {
                if(config) resolve(config.data);
                else reject(null);
            })

            .catch(err => console.error(err));
    });
};

export const saveConfiguration = taggedErrors => {

    return new Promise((resolve, reject) => {
        postRequest(`${rootHost()}/configurations/`, {taggedErrors:taggedErrors})
            .then(result => {
                if(result) resolve(result)
                else reject(null);
            })
            .catch(err => reject(err))
    });
    
};

export const getSimilarErrors = (excludeIds, message, resolved = false) => {

    let query = '?';
    const queryParameters = [];
    let ids = [];

    if(excludeIds && !Array.isArray(excludeIds)) ids = [excludeIds];
    else if(excludeIds && Array.isArray(excludeIds)) ids = excludeIds;

    if(ids.length > 0) ids.forEach(id => queryParameters.push(`excludeIds[]=${id}`));
    
    if(message) queryParameters.push(`message=${message}`);
    if(resolved) queryParameters.push('resolved=false');

    queryParameters.forEach((param,index) => {
        if(index === 0) query += param;
        else query += '&' + param;
    });

    return new Promise((resolve, reject) => {
            getRequest(`${host()}/${query.length > 1 ? query : ''}`)
                .then(data => {

                    if(data && data.data) {
                        resolve(data.data);
                    }
                    else reject(null);
                })

                .catch(err => reject(err));
    });
};

export const postResolveErrors = (errorIdArray) => {
    return new Promise((resolve, reject) => {
        postRequest(`${host()}/resolve`, { errorIdArray: errorIdArray })
            .then(result => {
                if(result) resolve(result)
                else reject(null);
            })
            .catch(err => reject(err));
    });
};

export const postDeleteErrors = (errorIdArray) => {
    return new Promise((resolve, reject) => {
        postRequest(`${host()}/delete`, { errorIdArray: errorIdArray })
            .then(result => {
                if(result) resolve(result)
                else reject(null);
            })
            .catch(err => reject(err));
    });
};

export const getGames = () => {
    return getRequest(`${rootHost()}/configurations/games`);
};