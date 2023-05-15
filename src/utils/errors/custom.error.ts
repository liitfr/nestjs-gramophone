import { GraphQLError } from 'graphql';
import { ApolloServerErrorCode } from '@apollo/server/errors';

interface UserFriendlyMessage {
  fr: string;
}

export enum ErrorCode {
  // Apollo errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  GRAPHQL_PARSE_FAILED = 'GRAPHQL_PARSE_FAILED',
  GRAPHQL_VALIDATION_FAILED = 'GRAPHQL_VALIDATION_FAILED',
  PERSISTED_QUERY_NOT_FOUND = 'PERSISTED_QUERY_NOT_FOUND',
  PERSISTED_QUERY_NOT_SUPPORTED = 'PERSISTED_QUERY_NOT_SUPPORTED',
  BAD_USER_INPUT = 'BAD_USER_INPUT',
  OPERATION_RESOLUTION_FAILURE = 'OPERATION_RESOLUTION_FAILURE',
  BAD_REQUEST = 'BAD_REQUEST',
  // Custom mapped errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  USER_INPUT_ERROR = 'USER_INPUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  // Other errors
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  FORBIDDEN = 'FORBIDDEN',
}

export const errorMapping: Record<string, string> = {
  // Apollo errors
  [ErrorCode.INTERNAL_SERVER_ERROR]:
    ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
  [ErrorCode.GRAPHQL_PARSE_FAILED]: ApolloServerErrorCode.GRAPHQL_PARSE_FAILED,
  [ErrorCode.GRAPHQL_VALIDATION_FAILED]:
    ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED,
  [ErrorCode.PERSISTED_QUERY_NOT_FOUND]:
    ApolloServerErrorCode.PERSISTED_QUERY_NOT_FOUND,
  [ErrorCode.PERSISTED_QUERY_NOT_SUPPORTED]:
    ApolloServerErrorCode.PERSISTED_QUERY_NOT_SUPPORTED,
  [ErrorCode.BAD_USER_INPUT]: ApolloServerErrorCode.BAD_USER_INPUT,
  [ErrorCode.OPERATION_RESOLUTION_FAILURE]:
    ApolloServerErrorCode.OPERATION_RESOLUTION_FAILURE,
  [ErrorCode.BAD_REQUEST]: ApolloServerErrorCode.BAD_REQUEST,
  // Custom mapped errors
  [ErrorCode.UNKNOWN_ERROR]: ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
  [ErrorCode.INVALID_ARGUMENT]: ApolloServerErrorCode.BAD_USER_INPUT,
  [ErrorCode.NOT_FOUND]: ApolloServerErrorCode.BAD_USER_INPUT,
  [ErrorCode.ALREADY_EXISTS]: ApolloServerErrorCode.BAD_USER_INPUT,
  [ErrorCode.PERMISSION_DENIED]: ApolloServerErrorCode.BAD_REQUEST,
  [ErrorCode.USER_INPUT_ERROR]: ApolloServerErrorCode.BAD_USER_INPUT,
  [ErrorCode.VALIDATION_ERROR]: ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED,
  // Other errors
  // [ErrorCode.UNAUTHENTICATED]:
  // [ErrorCode.FORBIDDEN]:
};

export class CustomError extends GraphQLError {
  constructor(
    public override readonly message: string,
    public readonly code: ErrorCode,
    public readonly userFriendlyMessage?: UserFriendlyMessage,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message, {
      extensions: {
        code: errorMapping[code] ?? code,
        userFriendlyMessage,
        stack: new Error().stack,
        details,
      },
    });
  }
}
