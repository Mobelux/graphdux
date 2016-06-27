'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.graphQLQuery = graphQLQuery;
exports.graphQLMutation = graphQLMutation;
exports.graphQLCachedQuery = graphQLCachedQuery;

var _constants = require('./constants');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var actionData = function actionData(type, query, variables, schema) {
    var action = {
        payload: {
            query: query,
            variables: variables
        }
    };
    if (type instanceof Array) {
        action.types = type;
    } else {
        action.type = type && type.toUpperCase();
    }

    if (schema) {
        action.meta = { schema: schema };
    }

    return action;
};

function graphQLQuery(type, query) {
    var variables = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
    var schema = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

    return _defineProperty({}, _constants.GRAPHQL_QUERY, actionData(type, query, variables, schema));
}

function graphQLMutation(type, mutation) {
    var variables = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    return _defineProperty({}, _constants.GRAPHQL_MUTATION, actionData(type, mutation, variables));
}

function graphQLCachedQuery(type, query) {
    var variables = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
    var schema = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

    return _defineProperty({}, _constants.GRAPHQL_CACHED_QUERY, actionData(type, query, variables, schema));
}