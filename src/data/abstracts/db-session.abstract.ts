import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class DbSession<T> {
  public abstract start(): Promise<void>;
  public abstract commit(): Promise<void>;
  public abstract end(): Promise<void>;
  public abstract abort(): Promise<void>;
  public abstract get(): T | null;
}
