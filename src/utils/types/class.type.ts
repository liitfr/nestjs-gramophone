export interface ClassType<InstanceType extends {} = {}> extends Function {
  new (...args: any[]): InstanceType;
  prototype: InstanceType;
}
