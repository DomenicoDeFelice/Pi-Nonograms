import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    publicDir: 'themes',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: 'index.html',
            },
        },
    },
    test: {
        globals: true,
        environment: 'happy-dom',
        include: ['src/tests/**/*.test.ts'],
        exclude: ['node_modules/', 'dist/', 'e2e/'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            exclude: ['node_modules/', 'dist/', 'demo/', 'e2e/', '**/*.config.js', 'src/tests/'],
        },
    },
});
