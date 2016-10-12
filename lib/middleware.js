import { Lokka } from 'lokka';
import { Transport } from 'lokka-transport-http';
import { camelizeKeys, decamelizeKeys } from 'humps';
import { GRAPHQL_QUERY, GRAPHQL_MUTATION, GRAPHQL_CACHED_QUERY } from './constants';

// check for optional dependency on normalizr
/* eslint-disable import/no-extraneous-dependencies */
let normalizrLib;
try {
    /* eslint-disable global-require */
    normalizrLib = require('normalizr');
} catch (er) {
    normalizrLib = null;
}
/* eslint-enable */
let normalize = null;
if (normalizrLib) {
    normalize = normalizrLib.normalize;
}


const graphduxDefaultActionType = 'GRAPHDUX_QUERY';
function createRequestTypes(base) {
    return ['REQUEST', 'SUCCESS', 'FAILURE'].map(type => `${base}_${type}`);
}


export default function Middleware(endpoint, options = {}) {
    const client = new Lokka({
        transport: new Transport(endpoint, options)
    });

    return _store => next => (action) => {
        const graphduxType = Object.keys(action)[0];
        const GRAPHQL = action[graphduxType];

        // nothing to see here if it's not a graphdux action or no action data
        if (
            [GRAPHQL_QUERY, GRAPHQL_MUTATION, GRAPHQL_CACHED_QUERY].indexOf(graphduxType) === -1
            || typeof GRAPHQL === 'undefined'
        ) {
            return next(action);
        }

        const {
          type,
          types = null,
          payload: { query, variables = {} },
          meta: { schema } = {}
        } = GRAPHQL;

        // default the graphql request type
        const queryType = type || graphduxDefaultActionType;

        if (typeof query !== 'string') {
            throw new Error(
                '[graphql-redux] field "query" is required to be a string on GraphQL actions'
            );
        }

        // build action types if not specified
        const [requestType, successType, failureType] = types || createRequestTypes(queryType);

        // decamelize vars if desired
        const queryVars = options.enforceCamelcase ? decamelizeKeys(variables) : variables;

        // fire off graphql request action
        next({
            type: requestType,
            payload: {
                query,
                queryVars
            }
        });

        let actionPromise;

        // the majority of our traffic is typically queries and mutations
        if (graphduxType === GRAPHQL_QUERY || graphduxType === GRAPHQL_MUTATION) {
            // call graphql endpoint
            actionPromise = client.query(query, queryVars)
                .then(
                    // success -> call graphql_success action
                    (data) => {
                        const queryResp = options.enforceCamelcase ? camelizeKeys(data) : data;
                        return next({
                            type: successType,
                            payload: schema && normalize
                                ? normalize(queryResp, schema)
                                : queryResp
                        });
                    },
                    // failure -> call graphql_failure action
                    error => next({
                        type: failureType,
                        error: true,
                        payload: options.enforceCamelcase
                            ? camelizeKeys(error.rawError)
                            : error.rawError
                    })
                );    //
        } else if (graphduxType === GRAPHQL_CACHED_QUERY) {
            // cached queries behave a bit differently
            const cachedResult = client.cache.getItemPayload(query, queryVars);
            if (cachedResult) {
                actionPromise = next({
                    type: successType,
                    payload: schema && normalize ? normalize(cachedResult, schema) : cachedResult
                });
            } else {
                // need to return a promise from the middleware for action chaining
                actionPromise = new Promise((resolve) => {
                    client.watchQuery(query, queryVars, () => {
                        resolve();
                    });
                }).then(() => {
                    const fresRes = client.cache.getItemPayload(query, queryVars);
                    return next({
                        type: successType,
                        payload: schema && normalize ? normalize(fresRes, schema) : fresRes
                    });
                });
            }
        }
        return actionPromise;
    };
}
