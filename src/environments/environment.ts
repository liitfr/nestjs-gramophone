export const environment = {
  jwtAccessTokenSecret: 'secret',
  jwtAccessTokenExpirationTime: 60 * 60,
  sameSiteAndSecure: false,
  jwtRefreshTokenSecret: 'secret',
  jwtRefreshTokenExpirationTime: 7 * 60 * 60 * 24,
  debugGuards: true,
  bullAdminBasePath: '/admin/queues',
  frontReferrer: 'http://localhost:4200',
  development: true,
};
