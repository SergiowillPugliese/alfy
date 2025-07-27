import { defineConfig } from 'orval';

export default defineConfig({
  'alfy-api': {
    input: {
      target: 'http://localhost:3000/api/swagger.json',
    },
    output: {
      target: 'libs/alfy-shared-lib/src/lib/api',
      client: 'angular',
      mode: 'tags-split',
      clean: ['./app/**/*', './models/**/*', './services/**/*'],
      prettier: true,
    },
  },
}); 