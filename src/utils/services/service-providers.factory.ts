import { Provider } from '@nestjs/common';

export function ServiceProvidersFactory(
  Service: Provider,
  serviceToken: symbol,
) {
  return [
    Service,
    {
      provide: serviceToken,
      useExisting: Service,
    },
  ];
}
