'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// have to disable this guy because it will be resolved at runtime
/* eslint-disable import/no-unresolved */
var React = require('react');
var reactRouterUtils = require('react-router/lib/RouteUtils');
/* eslint-enable */
if (!React) {
    throw new Error('[Graphdux][Route] Graphdux Route component requires react');
}
if (!reactRouterUtils) {
    throw new Error('[Graphdux][Route] Graphdux Route component requires react-router');
}
var createRouteFromReactElement = reactRouterUtils.createRouteFromReactElement;

var Route = function (_React$Component) {
    _inherits(Route, _React$Component);

    function Route() {
        _classCallCheck(this, Route);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Route).apply(this, arguments));
    }

    _createClass(Route, [{
        key: 'render',
        value: function render() {
            return false;
        }
    }]);

    return Route;
}(React.Component);

Route.propTypes = {
    path: React.PropTypes.string,
    component: React.PropTypes.func,
    fetch: React.PropTypes.func.isRequired,
    store: React.PropTypes.object.isRequired,
    variables: React.PropTypes.object,
    schema: React.PropTypes.object
};
Route.getDefaultProps = {
    isGraphRoute: true
};

Route.createRouteFromReactElement = function (element, _parentRoute) {
    var _element$props = element.props;
    var component = _element$props.component;
    var fetch = _element$props.fetch;
    var query = _element$props.query;
    var schema = _element$props.schema;
    var store = _element$props.store;
    var _element$props$variab = _element$props.variables;
    var routeVariables = _element$props$variab === undefined ? {} : _element$props$variab;
    var queryName = _element$props.queryName;


    var route = createRouteFromReactElement(element);

    // check if component has a query to fire off
    var graphqlQuery = query || component.query;
    if (!graphqlQuery) {
        // attempt to render the parent path?
        // super.createRouteFromReactElement(element, parentRoute);
        // return null;
        // just throw error for now until figure out how to build it properly
        throw new Error('[GraphRoute] query required in GraphQL route.');
    }

    route.onEnter = function (nextState, replace, callback) {
        // TODO figure out how to do this
        // if (parentRoute) {
        //     parentRoute.onEnter(nextState, replace);
        // }

        // the component can have a `variables` fn to build args to the query
        var compVars = component.variables && component.variables(store.getState()) || {};
        var variables = _extends({}, compVars, routeVariables);

        // if the query name is specified in props, use that, otherwise get the name from the
        // component
        var qName = void 0;
        if (queryName) {
            qName = queryName;
        } else {
            // check if component is a container
            // WrappedComponent seems to be pretty popular
            qName = component.WrappedComponent && component.WrappedComponent.displayName ? component.WrappedComponent.displayName
            // try display name or function name
            : component.displayName || component.name;
        }

        if (typeof fetch === 'function') {
            var maybePromise = fetch(qName, graphqlQuery, variables, schema);

            if (typeof maybePromise.then === 'function') {
                maybePromise.then(function () {
                    return callback();
                });
            } else {
                callback();
            }
        }
    };

    return route;
};

exports.default = Route;