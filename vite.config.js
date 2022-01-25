import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue';
import Pages from 'vite-plugin-pages';
import Layouts from 'vite-plugin-vue-layouts';
import Markdown from 'vite-plugin-md';
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        Vue({
            include: [ /\.vue$/, /\.md$/ ],
        }),
        Pages({
            extensions: [ 'vue', 'md' ],
            syncIndex: false,
            dirs: "src/views"
        }),
        Layouts({
            defaultLayout: 'default'
        }),
        Markdown()
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        }
    }
})