export type UpdatedModel = {
  matchedCount: number;
  modifiedCount: number;
  acknowledged: boolean;
  upsertedId: unknown;
  upsertedCount: number;
};

export type RemovedModel = {
  deletedCount: number;
  acknowledged: boolean;
};
