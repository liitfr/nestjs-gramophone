import { Kind, ASTNode, GraphQLScalarType } from 'graphql';

const coerceLong = (value: unknown) => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const num = parseInt(value, 10);
    if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
      throw new Error('Int cannot represent non 52-bit signed integer value');
    }
    return num;
  }
  return null;
};

export const LongScalar = new GraphQLScalarType({
  name: 'Long',
  description: 'The `Long` scalar type represents 52-bit integers',

  // value from the client
  parseValue: coerceLong,

  // value sent to the client
  serialize: coerceLong,

  parseLiteral: (ast: ASTNode) => {
    if (ast.kind === Kind.INT) {
      const num = parseInt(ast.value, 10);
      if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
        throw new Error('Int cannot represent non 52-bit signed integer value');
      }
      return num;
    }
    return null;
  },
});
