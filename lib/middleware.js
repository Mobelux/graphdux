import { Lokka } from 'lokka';
import { Transport } from 'lokka-transport-http';
import { camelizeKeys, decamelizeKeys } from 'humps';
import { GRAPHQL_QUERY, GRAPHQL_MUTATION } from './constants';

// have to use `require` instead of `import` because normalizr may not exist at runtime
/* eslint-disable import/no-unresolved */
const normalizrLib = require('normalizr');
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

    return _store => next => action => {
        const GRAPHQL = action[GRAPHQL_QUERY] || action[GRAPHQL_MUTATION];

        if (typeof GRAPHQL === 'undefined') {
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

        // call graphql endpoint
        return client.query(query, queryVars)
            .then(
                // success -> call graphql_success action
                data => {
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
            );
    };
}
