import { Kind, ASTNode, GraphQLScalarType } from 'graphql';
import { ObjectId } from 'mongodb';

export const IdScalar = new GraphQLScalarType({
  name: 'Id',
  description: 'Id scalar type',

  // value from the client
  parseValue: (value: unknown) => new ObjectId(value as string),

  // value sent to the client
  serialize: (value: unknown) => (value as ObjectId).toHexString(),

  parseLiteral: (ast: ASTNode) => {
    if (ast.kind === Kind.STRING) {
      return new ObjectId(ast.value); // value from the client query
    }
    return null;
  },
});
