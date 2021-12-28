module.exports = {
  devServer: {
    host: "0.0.0.0",
    public: "0.0.0.0:8080",
    disableHostCheck: true
  },
  publicPath: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'
    ? '/epicftr/biligram-3.0' // '/epicftr/provonfhir/dmr' // '/epicftr/biligram-3.0'
    : '/',
  configureWebpack: {
    output: {
      filename: () => (process.env.NODE_ENV === 'staging') ? '[name].[hash:8].js' : '[name].js'
    },
    // optimization: {
    //   splitChunks: {
    //     minSize: 10000,
    //     maxSize: 200000,
    //   }
    // }
  },
  chainWebpack: config => {

    config.plugin('VuetifyLoaderPlugin').tap(args => [{
      match(originalTag, { kebabTag, camelTag, path, component }) {
        if (kebabTag.startsWith('core-')) {
          return [camelTag, `import ${camelTag} from '@/components/core/${camelTag.substring(4)}.vue'`]
        }
      }
    }]);
  },

  transpileDependencies: [
    'vuetify', 'canvg'
  ],
  pages: {
    index: 'src/main.js',
    launch: 'src/launch.js'
  }
}
