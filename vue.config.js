const {defineConfig} = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,
    devServer: {
        port: 3000
    },
    publicPath: process.env.NODE_ENV === 'production'
        ? '/vocab-builder-frontend'
        : '/'
})
