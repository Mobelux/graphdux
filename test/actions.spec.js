/* global describe it */

import expect from 'expect';

import { graphQLQuery, graphQLMutation, GRAPHQL_QUERY, GRAPHQL_MUTATION } from '../lib';
describe('graphdux action creator', () => {
    it('should handle a graphql query action with all the trimmings', () => {
        const qName = 'TEST_QUERY';
        const query = 'graphql query';
        const variables = {
            v1: 'variable 1'
        };
        const schema = {
            k: 'key'
        };
        const qAction = graphQLQuery(qName, query, variables, schema);
        const graphqlAction = Object.keys(qAction)[0];
        expect(graphqlAction).toEqual(GRAPHQL_QUERY);
        const action = qAction[graphqlAction];
        expect(action).toBeA(Object);
        expect(action.type).toEqual('TEST_QUERY');
        expect(action.payload.query).toEqual(query);
        expect(action.payload.variables).toEqual(variables);
        expect(action.meta).toBeA(Object);
        expect(action.meta.schema).toEqual(schema);
    });

    it('should default variables in a graphql query action without variables', () => {
        const qName = 'TEST_QUERY';
        const query = 'graphql query';
        const qAction = graphQLQuery(qName, query);
        const action = qAction[GRAPHQL_QUERY];
        expect(action).toBeA(Object);
        expect(action.payload.variables).toEqual({});
    });

    it('should uppercase the query name', () => {
        const qName = 'test_query';
        const query = 'graphql query';
        const qAction = graphQLQuery(qName, query);
        const action = qAction[GRAPHQL_QUERY];
        expect(action).toBeA(Object);
        expect(action.type).toEqual('TEST_QUERY');
    });

    it('should omit the meta key if no schema is specified', () => {
        const qName = 'TEST_QUERY';
        const query = 'graphql query';
        const qAction = graphQLQuery(qName, query, {});
        const action = qAction[GRAPHQL_QUERY];
        expect(action).toBeA(Object);
        expect(action.meta).toNotExist();
    });

    it('should handle a graphql mutation action with all the trimmings', () => {
        const name = 'TEST_MUTATION';
        const mutation = 'graphql mutation';
        const variables = {
            v: 'var 1'
        };
        const mAction = graphQLMutation(name, mutation, variables);
        const gqlAction = Object.keys(mAction)[0];
        expect(gqlAction).toEqual(GRAPHQL_MUTATION);
        const action = mAction[GRAPHQL_MUTATION];
        expect(action).toBeA(Object);
        expect(action.type).toEqual(name);
        expect(action.payload.query).toEqual(mutation);
        expect(action.payload.variables).toEqual(variables);
    });

    it('should default the variables when not specified', () => {
        const name = 'TEST_MUTATION';
        const mutation = 'graphql mutation';
        const mAction = graphQLMutation(name, mutation);
        const action = mAction[GRAPHQL_MUTATION];
        expect(action.payload.variables).toEqual({});
    });

    it('should uppercase the name of the mutation', () => {
        const name = 'test_mutation';
        const mutation = 'graphql mutation';
        const variables = {
            v: 'var 1'
        };
        const mAction = graphQLMutation(name, mutation, variables);
        const action = mAction[GRAPHQL_MUTATION];
        expect(action.type).toEqual('TEST_MUTATION');
    });
});
