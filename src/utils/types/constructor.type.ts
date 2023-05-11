// TODO : Please use nestjs Type instead of this type for better consistency
export type Constructor<O = object> = { new (...args: any[]): O };
