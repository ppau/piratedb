const webpack = require('webpack')
const path = require('path')
const process = require('process')
const packageJson = require('./package.json')
const stripeJson = require('./config/stripe.json')

module.exports = {
  entry: {
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
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react', 'stage-0']
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.PIRATEDB_VERSION': JSON.stringify(packageJson.version),
      'process.env.STRIPE_PUBLIC_KEY': JSON.stringify(stripeJson.production.stripe_public_key),
    }),
    new webpack.optimize.UglifyJsPlugin()
  ]
}
