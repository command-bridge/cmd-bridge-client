const { defineConfig } = require('@vue/cli-service');
const path = require('path');

process.env.VUE_APP_BUILD_DATE = new Date().toISOString();

module.exports = defineConfig({
    devServer: {
        port: 8090,
    },
    outputDir: 'dist/renderer',
    publicPath: './', 
    transpileDependencies: [
        'vuetify'
    ],
    configureWebpack: {
        target: 'electron-renderer',
        resolve: {
            extensions: ['.ts', '.js', '.vue'],
            alias: {
                '@configs': path.resolve(__dirname, 'configs'),
            },
        },
    },
    publicPath: './',
    pages: {
        index: {
            entry: path.resolve(__dirname, 'src/renderer/index.ts'),
        },
    },
    pluginOptions: {
        electronBuilder: {
            mainProcessFile: path.resolve(__dirname, 'src/main.ts'), // Caminho absoluto para main.ts
            rendererProcessFile: path.resolve(__dirname, 'src/renderer/index.ts'),
            nodeIntegration: true,
            contextIsolation: false,
        }
    },
    chainWebpack: config => {
        // Configuração para usar o vue-loader em arquivos .vue
        config.module
            .rule('vue')
            .use('vue-loader')
            .loader('vue-loader')
            .tap(options => ({
                ...options,
                compilerOptions: {
                    isCustomElement: tag => tag.startsWith('custom-')
                }
            }));

        // Configuração para lidar com TypeScript nos arquivos .vue
        config.module
            .rule('ts')
            .test(/\.ts$/)
            .use('ts-loader')
            .loader('ts-loader')
            .options({ appendTsSuffixTo: [/\.vue$/] }); // Adiciona suporte para .vue com TypeScript
    }
});