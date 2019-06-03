const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const PATHS = {
  source: path.join(__dirname, 'source'),
  build: path.join(__dirname, 'public')
};

const developmentConfig = {
  devtool: 'eval',
  devServer: {
    contentBase: PATHS.build,
    port: 8080,
    hot: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
};

const productionConfig = {
  devtool: "cheap-module-source-map",
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new UglifyJSPlugin(),
  ]
}

const common = {
  entry: {
    main: [
      '@babel/polyfill',
      PATHS.source + '/index.js'
    ]
  },
  output: {
    path: PATHS.build,
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/polyfill', 'env', 'stage-0']
          }
        }
      },
      {
        test: /\.(gif|png|jpe?g|svg|mp3)$/i,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              bypassOnDebug: true,
              disable: true,
            },
          },
        ],
      },
      {
        test: /\.(json|dae)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192
            }
          }
        ]
      }
    ]
  }
};

module.exports = function (env) {
  console.log('env: ', env);
  if (env === 'development') {
    return Object.assign(
      {},
      common,
      developmentConfig
    );
  }
  if (env === 'production') {
    return Object.assign(
      {},
      common,
      productionConfig
    );
  }
};