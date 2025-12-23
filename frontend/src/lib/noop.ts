const noop = () => {};
const pinoNoop = {
  pino: () => ({
    info: noop,
    error: noop,
    debug: noop,
    warn: noop,
    child: () => pinoNoop,
  }),
};
export default pinoNoop.pino;
