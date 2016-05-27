import { GRAPHQL_QUERY } from './constants';

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
