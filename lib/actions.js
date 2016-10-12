import { GRAPHQL_QUERY, GRAPHQL_MUTATION, GRAPHQL_CACHED_QUERY } from './constants';

const actionData = (type, query, variables, schema) => {
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

    return action;
};


export function graphQLQuery(type, query, variables = {}, schema = null) {
    return { [GRAPHQL_QUERY]: actionData(type, query, variables, schema) };
}

export function graphQLMutation(type, mutation, variables = {}) {
    return { [GRAPHQL_MUTATION]: actionData(type, mutation, variables) };
}

export function graphQLCachedQuery(type, query, variables = {}, schema = null) {
    return { [GRAPHQL_CACHED_QUERY]: actionData(type, query, variables, schema) };
}
