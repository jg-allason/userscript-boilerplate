import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
    plugins: [
        monkey({
            entry: 'src/main.user.ts',
            userscript: {
                name: 'My Userscript',
                namespace: 'https://github.com/yourusername',
                version: '1.0.0',
                description: 'Description here',
                author: 'Your Name',
                match: ['https://example.com/*'],
                grant: [
                    'GM_getValue',
                    'GM_setValue',
                    'GM_deleteValue',
                    'GM_listValues',
                    'GM_xmlhttpRequest',
                    'GM_addStyle',
                    'GM_registerMenuCommand',
                ],
                connect: ['*'],
                updateURL: 'https://raw.githubusercontent.com/jg-allason/userscript-boilerplate/main/dist/bundle.user.js',
                downloadURL: 'https://raw.githubusercontent.com/jg-allason/userscript-boilerplate/main/dist/bundle.user.js',
            },
            build: {
                fileName: 'bundle.user.js',
            },
        }),
    ],
    build: {
        outDir: 'dist',
        sourcemap: process.env.NODE_ENV === 'development' ? 'inline' : false,
        minify: false,
    },
});
