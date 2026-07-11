type LogFn = (...args: unknown[]) => void;

const isProd = process.env.NODE_ENV === 'production';

const noop: LogFn = () => {};

const withPrefix = (prefix: string, fn: LogFn): LogFn => (...args) =>
  fn(prefix, ...args);

export const logger = {
  // Debug/info are noisy request-level logs — disabled in production to avoid
  // the synchronous I/O cost of console.log on every request.
  debug: isProd
    ? noop
    : withPrefix('[DEBUG]', console.log.bind(console)),
  info: isProd ? noop : withPrefix('[INFO]', console.log.bind(console)),
  warn: withPrefix('[WARN]', console.warn.bind(console)),
  error: withPrefix('[ERROR]', console.error.bind(console)),
};

export default logger;
