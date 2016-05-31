'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = Middleware;

var _lokka = require('lokka');

var _lokkaTransportHttp = require('lokka-transport-http');

var _constants = require('./constants');

// have to use `require` instead of `import` to satisfy eslint
// import { normalize } from 'normalizr';
var normalizrLib = require('normalizr');
var normalize = null;
if (normalizrLib) {
    normalize = normalizrLib.normalize;
}

function createRequestTypes(base) {
    return ['REQUEST', 'SUCCESS', 'FAILURE'].map(function (type) {
        return base + '_' + type;
    });
}

function Middleware(endpoint, options) {
    var client = new _lokka.Lokka({
        transport: new _lokkaTransportHttp.Transport(endpoint, options)
    });

    return function (_store) {
        return function (next) {
            return function (action) {
                var GRAPHQL = action[_constants.GRAPHQL_QUERY] || action[_constants.GRAPHQL_MUTATION];

                if (typeof GRAPHQL === 'undefined') {
                    return next(action);
                }

                var type = GRAPHQL.type;
                var _GRAPHQL$types = GRAPHQL.types;
                var types = _GRAPHQL$types === undefined ? null : _GRAPHQL$types;
                var _GRAPHQL$payload = GRAPHQL.payload;
                var query = _GRAPHQL$payload.query;
                var _GRAPHQL$payload$vari = _GRAPHQL$payload.variables;
                var variables = _GRAPHQL$payload$vari === undefined ? {} : _GRAPHQL$payload$vari;
                var _GRAPHQL$meta = GRAPHQL.meta;
                _GRAPHQL$meta = _GRAPHQL$meta === undefined ? {} : _GRAPHQL$meta;
                var schema = _GRAPHQL$meta.schema;


                if (typeof type === 'undefined') {
                    throw new Error('[graphql-redux] field "type" is required on GraphQL actions');
                }

                if (typeof query !== 'string') {
                    throw new Error('[graphql-redux] field "query" is required to be a string on GraphQL actions');
                }

                var _ref = types || createRequestTypes(type);

                var _ref2 = _slicedToArray(_ref, 3);

                var requestType = _ref2[0];
                var successType = _ref2[1];
                var failureType = _ref2[2];

                // fire off graphql request action

                next({
                    type: requestType,
                    payload: {
                        query: query,
                        variables: variables
                    }
                });

                // call graphql endpoint
                return client.query(query, variables).then(
                // success -> call graphql_success action
                function (response) {
                    return next({
                        type: successType,
                        payload: schema && normalize ? normalize(response, schema) : response
                    });
                },
                // failure -> call graphql_failure action
                function (response) {
                    return next({
                        type: failureType,
                        error: true,
                        payload: response.errors
                    });
                });
            };
        };
    };
}