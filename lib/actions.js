import { GRAPHQL_QUERY, GRAPHQL_MUTATION } from './constants';

export function graphQLQuery(type, query, variables = {}, schema = null) {
    const action = {
        payload: {
            query,
            variables
        }
    };
    if (type instanceof Array) {
        action.types = type;
    } else {
        action.type = type && type.toUpperCase();
    }

    if (schema) {
        action.meta = { schema };
    }

    return { [GRAPHQL_QUERY]: action };
}

export function graphQLMutation(type, mutation, variables = {}) {
    const action = {
        payload: {
            query: mutation,
            variables
        }
    };
    if (type instanceof Array) {
        action.types = type;
    } else {
        action.type = type && type.toUpperCase();
    }

    return { [GRAPHQL_MUTATION]: action };
}
