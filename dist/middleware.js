'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = Middleware;

var _lokka = require('lokka');

var _lokkaTransportHttp = require('lokka-transport-http');

var _humps = require('humps');

var _constants = require('./constants');

// have to use `require` instead of `import` because normalizr may not exist at runtime
/* eslint-disable import/no-extraneous-dependencies */
var normalizrLib = require('normalizr');
/* eslint-enable */
var normalize = null;
if (normalizrLib) {
    normalize = normalizrLib.normalize;
}

var graphduxDefaultActionType = 'GRAPHDUX_QUERY';
function createRequestTypes(base) {
    return ['REQUEST', 'SUCCESS', 'FAILURE'].map(function (type) {
        return base + '_' + type;
    });
}

function Middleware(endpoint) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var client = new _lokka.Lokka({
        transport: new _lokkaTransportHttp.Transport(endpoint, options)
    });

    return function (_store) {
        return function (next) {
            return function (action) {
                var graphduxType = Object.keys(action)[0];
                var GRAPHQL = action[graphduxType];

                // nothing to see here if it's not a graphdux action or no action data
                if ([_constants.GRAPHQL_QUERY, _constants.GRAPHQL_MUTATION, _constants.GRAPHQL_CACHED_QUERY].indexOf(graphduxType) === -1 || typeof GRAPHQL === 'undefined') {
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

                // default the graphql request type

                var queryType = type || graphduxDefaultActionType;

                if (typeof query !== 'string') {
                    throw new Error('[graphql-redux] field "query" is required to be a string on GraphQL actions');
                }

                // build action types if not specified

                var _ref = types || createRequestTypes(queryType);

                var _ref2 = _slicedToArray(_ref, 3);

                var requestType = _ref2[0];
                var successType = _ref2[1];
                var failureType = _ref2[2];

                // decamelize vars if desired

                var queryVars = options.enforceCamelcase ? (0, _humps.decamelizeKeys)(variables) : variables;

                // fire off graphql request action
                next({
                    type: requestType,
                    payload: {
                        query: query,
                        queryVars: queryVars
                    }
                });

                var actionPromise = void 0;

                // the majority of our traffic is typically queries and mutations
                if (graphduxType === _constants.GRAPHQL_QUERY || graphduxType === _constants.GRAPHQL_MUTATION) {
                    // call graphql endpoint
                    actionPromise = client.query(query, queryVars).then(
                    // success -> call graphql_success action
                    function (data) {
                        var queryResp = options.enforceCamelcase ? (0, _humps.camelizeKeys)(data) : data;
                        return next({
                            type: successType,
                            payload: schema && normalize ? normalize(queryResp, schema) : queryResp
                        });
                    },
                    // failure -> call graphql_failure action
                    function (error) {
                        return next({
                            type: failureType,
                            error: true,
                            payload: options.enforceCamelcase ? (0, _humps.camelizeKeys)(error.rawError) : error.rawError
                        });
                    }); //
                } else if (graphduxType === _constants.GRAPHQL_CACHED_QUERY) {
                    // cached queries behave a bit differently
                    var cachedResult = client.cache.getItemPayload(query, queryVars);
                    if (cachedResult) {
                        actionPromise = next({
                            type: successType,
                            payload: schema && normalize ? normalize(cachedResult, schema) : cachedResult
                        });
                    } else {
                        // need to return a promise from the middleware for action chaining
                        actionPromise = new Promise(function (resolve) {
                            client.watchQuery(query, queryVars, function () {
                                resolve();
                            });
                        }).then(function () {
                            var fresRes = client.cache.getItemPayload(query, queryVars);
                            return next({
                                type: successType,
                                payload: schema && normalize ? normalize(fresRes, schema) : fresRes
                            });
                        });
                    }
                }
                return actionPromise;
            };
        };
    };
}