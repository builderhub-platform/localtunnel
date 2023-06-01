declare global {
  namespace NodeJS {
    /* Extending the NodeJS.ProcessEnv interface with the new properties. */
    export interface ProcessEnv extends NodeJS.ProcessEnv {
      /**
       * `MY_KEY`: My App Key.
       */
      MY_KEY: string;
      /**
       * `NODE_ENV`: NodeJS environment (`production`, `development`, `test`)
       */
      NODE_ENV?: string;
    }
  }
}

export {};
