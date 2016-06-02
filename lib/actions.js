import { GRAPHQL_QUERY, GRAPHQL_MUTATION } from './constants';

export function graphQLQuery(name, query, variables = {}, schema = null) {
    const action = {
        type: name.toUpperCase(),
        payload: {
            query,
            variables
        }
    };

    if (schema) {
        action.meta = { schema };
    }

    return { [GRAPHQL_QUERY]: action };
}

export function graphQLMutation(name, mutation, variables = {}) {
    const action = {
        type: name.toUpperCase(),
        payload: {
            query: mutation,
            variables
        }
    };

    return { [GRAPHQL_MUTATION]: action };
}
