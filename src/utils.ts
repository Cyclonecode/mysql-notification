import config from './config';

export const originIsAllowed = (origin: string) =>
  !!config.allowedOrigins.find(
    (it) => it === '*' || it === origin.toLowerCase()
  );
