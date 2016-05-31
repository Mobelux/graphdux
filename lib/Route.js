import React from 'react';
import { createRouteFromReactElement } from 'react-router/lib/RouteUtils';

export default class Route extends React.Component {
    static propTypes = {
        path: React.PropTypes.string,
        component: React.PropTypes.func,
        fetch: React.PropTypes.func.isRequired,
        store: React.PropTypes.object.isRequired,
        variables: React.PropTypes.object,
        schema: React.PropTypes.object
    };

    static getDefaultProps = {
        isGraphRoute: true
    };

    static createRouteFromReactElement = (element, _parentRoute) => {
        const {
            component, fetch, query, schema, store, variables: routeVariables = {}, queryName
        } = element.props;

        const route = createRouteFromReactElement(element);

        // check if component has a query to fire off
        const graphqlQuery = query || component.query;
        if (!graphqlQuery) {
            // attempt to render the parent path?
            // super.createRouteFromReactElement(element, parentRoute);
            // return null;
            // just throw error for now until figure out how to build it properly
            throw new Error('[GraphRoute] query required in GraphQL route.');
        }

        route.onEnter = (nextState, replace, callback) => {
            // TODO figure out how to do this
            // if (parentRoute) {
            //     parentRoute.onEnter(nextState, replace);
            // }

            const compVars = component.variables && component.variables(store.getState()) || {};
            const variables = { ...compVars, ...routeVariables };

            // if the query name is specified in props, use that, otherwise get the name from the
            // component
            let qName;
            if (queryName) {
                qName = queryName;
            } else {
                // check if component is a container
                // WrappedComponent seems to be pretty popular
                qName = component.WrappedComponent && component.WrappedComponent.displayName
                    ? component.WrappedComponent.displayName
                    // try display name or function name
                    : component.displayName || component.name;
            }


            if (typeof fetch === 'function') {
                const maybePromise = fetch(qName, graphqlQuery, variables, schema);

                if (typeof maybePromise.then === 'function') {
                    maybePromise.then(() => callback());
                } else {
                    callback();
                }
            }
        };

        return route;
    };

    render() {
        return false;
    }
}
