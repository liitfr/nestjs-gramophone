import { CanActivate } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/ban-types
export type Guard = CanActivate | Function;
