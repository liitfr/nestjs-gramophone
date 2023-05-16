import { ClassType } from '../types/class.type';

// code from https://github.com/tkqubo/conditional-decorator/tree/master

interface ClassDecorator {
  <T extends ClassType>(target: T): T | void;
}

interface PropertyDecorator {
  (target: unknown, propertyKey: string | symbol): void;
}

interface MethodDecorator {
  <T>(
    target: unknown,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ): TypedPropertyDescriptor<T> | void;
}

interface ParameterDecorator {
  (target: unknown, propertyKey: string | symbol, parameterIndex: number): void;
}

enum DecoratorType {
  Class,
  Parameter,
  Property,
  Method,
  None,
}

export function getDecoratorTypeFromArguments(args: IArguments): DecoratorType {
  'use strict';
  if (args.length === 0 || args.length > 3) {
    return DecoratorType.None;
  }

  const kind: string = typeof (args.length === 1 ? args[0] : args[2]);
  switch (kind) {
    case 'function':
      return DecoratorType.Class;
    case 'number':
      return DecoratorType.Parameter;
    case 'undefined':
      return DecoratorType.Property;
    case 'object':
      return DecoratorType.Method;
    default:
      return DecoratorType.None;
  }
}

export function isClassDecorator(
  _decorator: unknown,
  args: IArguments,
): _decorator is ClassDecorator {
  'use strict';
  return getDecoratorTypeFromArguments(args) === DecoratorType.Class;
}

export function isParameterDecorator(
  _decorator: unknown,
  args: IArguments,
): _decorator is ParameterDecorator {
  'use strict';
  return getDecoratorTypeFromArguments(args) === DecoratorType.Parameter;
}

export function isPropertyDecorator(
  _decorator: unknown,
  args: IArguments,
): _decorator is PropertyDecorator {
  'use strict';
  return getDecoratorTypeFromArguments(args) === DecoratorType.Property;
}

export function isMethodDecorator(
  _decorator: unknown,
  args: IArguments,
): _decorator is MethodDecorator {
  'use strict';
  return getDecoratorTypeFromArguments(args) === DecoratorType.Method;
}

function Conditional(test: boolean, decorator: ClassDecorator): ClassDecorator;
function Conditional(
  test: (clazz?: ClassType) => boolean,
  decorator: ClassDecorator,
): ClassDecorator;
function Conditional(
  test: boolean,
  decorator: PropertyDecorator,
): PropertyDecorator;
function Conditional(
  test: (target?: unknown, key?: string | symbol) => boolean,
  decorator: PropertyDecorator,
): PropertyDecorator;
function Conditional(
  test: boolean,
  decorator: ParameterDecorator,
): ParameterDecorator;
function Conditional(
  test: (target?: unknown, key?: string | symbol, index?: number) => boolean,
  decorator: ParameterDecorator,
): ParameterDecorator;
function Conditional(
  test: boolean,
  decorator: MethodDecorator,
): MethodDecorator;
function Conditional(
  test: (
    target?: unknown,
    key?: string | symbol,
    desc?: PropertyDescriptor,
  ) => boolean,
  decorator: MethodDecorator,
): MethodDecorator;
function Conditional(test: unknown, decorator: unknown): unknown {
  'use strict';
  return function (
    target: unknown,
    key: string | symbol,
    value: unknown,
  ): unknown {
    // eslint-disable-next-line prefer-rest-params
    if (isClassDecorator(decorator, arguments)) {
      const clazz: ClassType = target as ClassType;
      const shouldDecorate: boolean =
        typeof test === 'function' ? test(clazz) : test;
      if (shouldDecorate && decorator) {
        return decorator(clazz);
      }
      return clazz;
      // eslint-disable-next-line prefer-rest-params
    } else if (isParameterDecorator(decorator, arguments)) {
      const index: number = value as number;
      const shouldDecorate: boolean =
        typeof test === 'function' ? test(target, key, index) : test;
      if (shouldDecorate && decorator) {
        decorator(target, key, index);
      }
      return;
      // eslint-disable-next-line prefer-rest-params
    } else if (isPropertyDecorator(decorator, arguments)) {
      const shouldDecorate: boolean =
        typeof test === 'function' ? test(target, key) : test;
      if (shouldDecorate && decorator) {
        decorator(target, key);
      }
      return;
      // eslint-disable-next-line prefer-rest-params
    } else if (isMethodDecorator(decorator, arguments)) {
      const desc: PropertyDescriptor = value as PropertyDescriptor;
      const shouldDecorate: boolean =
        typeof test === 'function' ? test(target, key, desc) : test;
      if (shouldDecorate && decorator) {
        return decorator(target, key, desc);
      }
      return desc;
    }
    throw new Error('Invalid decorator type');
  };
}

export { Conditional };
