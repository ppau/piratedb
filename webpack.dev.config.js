const webpack = require('webpack')
const path = require('path')
const process = require('process')
const packageJson = require('./package.json')
const stripeJson = require('./config/stripe.json')

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  devtool: 'source-map',
  entry: {
    livereload: 'webpack-dev-server/client?http://localhost:3001/',
    react: 'webpack/hot/only-dev-server',
    main: './src/frontend/index.jsx',
  },
  output: {
    path: path.join(__dirname, 'public', 'javascript'),
    filename: '[name].bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },
      {
        test: /\.scss$/,
        loader: 'style-loader!css-loader!sass-loader'
      },
      {
        test: /\.jsx?$/,
        loaders: ['react-hot-loader', 'babel-loader?presets[]=es2015,presets[]=react,presets[]=stage-0'],
        exclude: /node_modules/
      },
      {
        test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
        loader: 'file'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.PIRATEDB_VERSION': JSON.stringify(packageJson.version),
      'process.env.STRIPE_PUBLIC_KEY': JSON.stringify(stripeJson.development.stripe_public_key),
    }),
    //new BundleAnalyzerPlugin({analyzerPort: 3002}),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  devServer: {
    contentBase: path.resolve(__dirname, './public'),
    publicPath: "/javascript/",
    port: 3001,
    host: "0.0.0.0",
    hot: true,
    inline: true,
    historyApiFallback: true,
    quiet: false,
    proxy: {
      "**": "http://localhost:3000"
    },
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    }
  },
  watchOptions: {
    poll: true
  }
}
