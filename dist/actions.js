'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.graphQLQuery = graphQLQuery;
exports.graphQLMutation = graphQLMutation;

var _constants = require('./constants');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function graphQLQuery(name, query) {
    var variables = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
    var schema = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

    var action = {
        type: name.toUpperCase(),
        payload: {
            query: query,
            variables: variables
        }
    };

    if (schema) {
        action.meta = { schema: schema };
    }

    return _defineProperty({}, _constants.GRAPHQL_QUERY, action);
}

function graphQLMutation(name, mutation) {
    var variables = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var action = {
        type: name.toUpperCase(),
        payload: {
            query: mutation,
            variables: variables
        }
    };

    return _defineProperty({}, _constants.GRAPHQL_MUTATION, action);
}