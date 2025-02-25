import consola, { InputLogObject } from "consola";

export const Logger = {
  info(message: InputLogObject | any, ...args: any[]) {
    consola.info(message, ...args);
  },
  success(message: InputLogObject | any, ...args: any[]) {
    consola.success(message, ...args);
  },
  warn(message: InputLogObject | any, ...args: any[]) {
    consola.warn(message, ...args);
  },
  error(message: InputLogObject | any, ...args: any[]) {
    consola.error(message, ...args);
  },
};

export { consola };
