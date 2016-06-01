import { Lokka } from 'lokka';
import { Transport } from 'lokka-transport-http';
import { GRAPHQL_QUERY, GRAPHQL_MUTATION } from './constants';

// have to use `require` instead of `import` because normalizr may not exist at runtime
/* eslint-disable import/no-unresolved */
const normalizrLib = require('normalizr');
/* eslint-enable */
let normalize = null;
if (normalizrLib) {
    normalize = normalizrLib.normalize;
}

function createRequestTypes(base) {
    return ['REQUEST', 'SUCCESS', 'FAILURE'].map(type => `${base}_${type}`);
}

export default function Middleware(endpoint, options) {
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

        if (typeof type === 'undefined') {
            throw new Error('[graphql-redux] field "type" is required on GraphQL actions');
        }

        if (typeof query !== 'string') {
            throw new Error(
                '[graphql-redux] field "query" is required to be a string on GraphQL actions'
            );
        }

        const [requestType, successType, failureType] = types || createRequestTypes(type);

        // fire off graphql request action
        next({
            type: requestType,
            payload: {
                query,
                variables
            }
        });

        // call graphql endpoint
        return client.query(query, variables)
            .then(
                // success -> call graphql_success action
                response => next({
                    type: successType,
                    payload: schema && normalize
                        ? normalize(response, schema)
                        : response
                }),
                // failure -> call graphql_failure action
                response => next({
                    type: failureType,
                    error: true,
                    payload: response.errors
                })
            );
    };
}
