import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    publicDir: 'themes',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: 'index.html',
                sw: 'sw.js',
                manifest: 'manifest.json',
            },
            output: {
                entryFileNames: (chunkInfo) => {
                    return chunkInfo.name === 'sw' ? 'sw.js' : 'assets/[name]-[hash].js';
                },
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === 'manifest.json') {
                        return 'manifest.json';
                    }
                    return 'assets/[name]-[hash].[ext]';
                },
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
            exclude: [
                'node_modules/',
                'dist/',
                'demo/',
                'e2e/',
                '**/*.config.js',
                '**/*.config.ts',
                'src/tests/',
            ],
        },
    },
});
