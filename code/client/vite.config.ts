import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import * as fs from "fs";
import * as path from "path";
import viteCompression from 'vite-plugin-compression'
import {createSvgIconsPlugin} from "vite-plugin-svg-icons";

export default defineConfig({
    resolve: {
        alias: {
            "@": path.join(__dirname, "src")
        }
    },
    plugins: [
        vue(),
        viteCompression({
            threshold: 102400
        }),
        createSvgIconsPlugin({
            iconDirs: [path.join(__dirname, "./src/assert/custom")],
            symbolId: '[name]'
        })
    ],
    server: {
        host: "0.0.0.0",
        https: {
            key: fs.readFileSync(path.join(__dirname, './certs/key.pem')),
            cert: fs.readFileSync(path.join(__dirname, './certs/cert.pem'))
        },
        port: 3000,
        hmr: true,
        open: false, //自动打开
        base: "./ ", //生产环境路径
        proxy: { // 本地开发环境通过代理实现跨域，生产环境使用 nginx 转发
            // 正则表达式写法
            '^/api': {
                secure: false,
                target: 'https://localhost:14000/api', // 后端服务实际地址
                changeOrigin: true, //开启代理
                rewrite: (path) => path.replace(/^\/api/, '')
            },
            '^/file': {
                secure: false,
                target: 'https://localhost:14000/file', // 后端服务实际地址
                changeOrigin: true, //开启代理
                rewrite: (path) => path.replace(/^\/file/, '')
            },
            "/socket.io": {
                target: "https://localhost:14000",
                secure: false,
                ws: true,
                changeOrigin: true
            }
        }
    },
})
