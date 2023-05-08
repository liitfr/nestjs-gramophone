export type OmitFieldArray<T, K extends readonly (keyof T)[]> = Pick<
  T,
  Exclude<keyof T, K[number]>
>;
