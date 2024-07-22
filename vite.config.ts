import {resolve} from 'path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts'

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'lib/theia-sticky-sidebar.ts'),
            name: 'TheiaStickySidebar',
            formats: ['es'],
            fileName: 'theia-sticky-sidebar',
        },
        rollupOptions: {
            output: {
                // format: 'esm',
                // preserveModules: true,
                // interop: "auto",
            },
        },
    },
    plugins: [dts({include: 'lib/theia-sticky-sidebar.ts'})],
})
