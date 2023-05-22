import { BullModule } from '@nestjs/bull';
import { DynamicModule, Injectable } from '@nestjs/common';

@Injectable()
export class QueueStore {
  private static queues = new Map<string, DynamicModule>();

  public static create(name: string) {
    if (QueueStore.queues.has(name)) {
      throw new Error(`Queue ${name} already exists`);
    }

    const module = BullModule.registerQueue({
      name,
    });

    QueueStore.queues.set(name, module);

    return module;
  }

  public static get(name: string) {
    const module = QueueStore.queues.get(name);

    if (!module) {
      throw new Error(`Queue ${name} not found`);
    }

    return module;
  }

  public static getAllNames() {
    return Array.from(QueueStore.queues.keys());
  }
}
