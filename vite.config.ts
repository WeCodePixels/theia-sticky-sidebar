import {resolve} from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'lib/theia-sticky-sidebar.ts'),
            name: 'TheiaStickySidebar',
            formats: ['es'],
            fileName: 'theia-sticky-sidebar',
        }
    }
})
