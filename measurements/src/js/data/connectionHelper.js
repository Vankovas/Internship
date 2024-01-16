import { getRequest } from '../../../../common/WebRequest';

const rootHost = () => {
    return window.security.rootHost;
}

const host = () => {
    return window.security.host;
};

export const retrieveMeasurements = () => {
    return new Promise((resolve, reject) => {
        getRequest(`${host()}/`)
            .then(data => {
                if (data && data.data) resolve(data.data);
                else reject(null); 
            })
            .catch(err => reject(err));
    });
};

export const retrieveMeasurementsWithParameters = (queryFields) => {
    const query = parseQueryParameters(queryFields);
    return new Promise((resolve, reject) => {
        getRequest(`${host()}/${query}`)
            .then(data => {
                if(data && data.data) resolve(data.data);
                else reject(null);
            })
            .catch(err => reject(err));
    });
};

const parseQueryParameters = (queryParametersInput) => {
    let query = '?';
    const queryParameters = [];
    const comparatorFields = ['averageFps', 'numberOfFriends', 'numberOfFriendsOnline', 'numberOfPrivateChats', 'numberOfPlayersInRoom'];
    const arrayFields = ['gameId', 'origin', 'browserName'];
    //Parse parameters to query parameters
    for (const key in queryParametersInput || arrayFields.includes(key)) {
        if(key === 'groupFields') {
            const array = queryParametersInput[key];
            if(array.length > 0) array.forEach(element => queryParameters.push(`${key}[]=${element}`));
        }
        else if(comparatorFields.includes(key)) {
            const comparatorField = queryParametersInput[key];
            comparatorField.forEach(field => queryParameters.push(`${key}[]=${JSON.stringify(field)}`));
        }
        else queryParameters.push(`${key}=${queryParametersInput[key]}`);
    }
    
    //Check for parameters
    if(queryParameters.length > 0) queryParameters.forEach(param => {
        if(query.length === 1) query += param;
        else query += ('&' + param);
    });

    return query.length > 1 ? query : '';
};

export const retrieveMeasurementDetails = measurementId => {
    return new Promise((resolve, reject) => {
        getRequest(`${host()}/${measurementId}`)
            .then(data => {
                if (data && data.data) resolve(data.data);
                else reject(null);
            })
            .catch(err => console.error(err));
    });
};

export const retrieveDistinctOriginFields = () => {
    return new Promise((resolve, reject) => {
        getRequest(`${rootHost()}/configurations/origins`)
            .then(data => {
                if(data && data.data) resolve(data.data);
                else reject(null);
            })
            .catch(err => console.error(err));
    });
};

export const retrieveDistinctBrowserNameFields = () => {
    return new Promise((resolve, reject) => {
        getRequest(`${rootHost()}/configurations/browsers`)
            .then(data => {
                if(data && data.data) resolve(data.data);
                else reject(null);
            })
            .catch(err => console.error(err));
    });
};

export const retrieveReportFieldKeys = () => {
    return new Promise((resolve, reject) => {
        getRequest(`${rootHost()}/measurement-reports/keys`)
            .then(data => {
                if(data && data.data) resolve(data.data);
                else reject(null);
            })
            .catch(err => console.error(err));
    });
};

export const retrieveGames = () => {
    return new Promise((resolve, reject) => {
        getRequest(`${rootHost()}/configurations/games`)
            .then(data => {
                if(data && data.data) resolve(data.data);
                else reject(null);
            })
            .catch(err => console.error(err));
    });
}; 

export const retrieveUsernameExistentialStatus = (userName) => {
    return new Promise((resolve, reject) => {
        getRequest(`${host()}/userName/${userName}`)
            .then(data => {
                if(data) {
                    if(data.data !== null) resolve(true);
                    else resolve(false);
                }
                else reject(null);
            })
            .catch(err => console.error(err));
    });
};