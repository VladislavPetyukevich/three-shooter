const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const PATHS = {
  source: path.join(__dirname, 'source'),
  build: path.join(__dirname, 'public')
};

const developmentConfig = {
  mode: 'development',
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
  mode: 'production',
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
    main: PATHS.source + '/index.ts'
  },
  output: {
    path: PATHS.build,
    filename: 'bundle.js',
    libraryTarget: 'umd',
    library: 'ThreeShooter'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'source'),
    },
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: 'awesome-typescript-loader'
        },
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
      },
      {
        test: /\.glsl$/i,
        use: 'raw-loader'
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