import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'mfShopping',
  exposes: {
    './Routes': 'apps/mfShopping/src/app/remote-entry/entry.routes.ts',
  },
  shared: (libraryName, defaultConfig) => {
    if (libraryName === '@angular/core' || 
        libraryName === '@angular/common' || 
        libraryName === '@angular/router') {
      return { singleton: true, strictVersion: true };
    }
    if (libraryName === 'primeng' || 
        libraryName === 'primeflex' || 
        libraryName === 'primeicons') {
      return { singleton: true, strictVersion: false };
    }
    return defaultConfig;
  },
};

/**
 * Nx requires a default export of the config to allow correct resolution of the module federation graph.
 **/
export default config;
