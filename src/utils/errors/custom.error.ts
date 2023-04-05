import { GraphQLError } from 'graphql';
import { ApolloServerErrorCode } from '@apollo/server/errors';

interface UserFriendlyMessage {
  fr: string;
}

export enum ErrorCode {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  USER_INPUT_ERROR = 'USER_INPUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  FORBIDDEN = 'FORBIDDEN',
}

export const errorMapping = {
  [ErrorCode.UNKNOWN_ERROR]: ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
  [ErrorCode.INVALID_ARGUMENT]: ApolloServerErrorCode.BAD_USER_INPUT,
  [ErrorCode.NOT_FOUND]: ApolloServerErrorCode.BAD_USER_INPUT,
  [ErrorCode.ALREADY_EXISTS]: ApolloServerErrorCode.BAD_USER_INPUT,
  [ErrorCode.PERMISSION_DENIED]: ApolloServerErrorCode.BAD_REQUEST,
  [ErrorCode.USER_INPUT_ERROR]: ApolloServerErrorCode.BAD_USER_INPUT,
  [ErrorCode.VALIDATION_ERROR]: ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED,
} as const;

export class CustomError extends GraphQLError {
  constructor(
    public readonly message: string,
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
