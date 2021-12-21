import { defineConfig } from 'vite-plugin-windicss'

export default defineConfig({
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                teal: '#ac69fe' // 自定义颜色
            },
        },
    },
})