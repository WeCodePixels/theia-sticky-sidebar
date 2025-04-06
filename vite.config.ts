import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts'
import istanbul from 'vite-plugin-istanbul';

export default defineConfig({
    build: {
        lib: {
            entry: 'lib/theia-sticky-sidebar.ts',
            name: 'TheiaStickySidebar',
            formats: ['es', 'umd'],
            fileName: (format) => `theia-sticky-sidebar.${format}.js`
        },
        sourcemap: true,
        emptyOutDir: true,
    },
    plugins: [
        dts({include: 'lib/theia-sticky-sidebar.ts'}),
        istanbul({
            include: 'lib/*',
            exclude: ['node_modules', 'tests/'],
            extension: ['.js', '.ts'],
            requireEnv: true,
        }),
    ],
})
