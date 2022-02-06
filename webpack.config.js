const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const PATHS = {
  source: path.join(__dirname, 'source'),
  public: path.join(__dirname, 'public'),
  build: path.join(__dirname, 'build'),
};

const developmentConfig = {
  mode: 'development',
  devServer: {
    static: {
      directory: PATHS.public,
    },
    port: 8080,
    hot: true
  },
  optimization: {
    moduleIds: 'named',
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
  ],
};

const productionConfig = {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        ecma: 5,
      },
    })],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: PATHS.public, to: PATHS.build },
      ],
    }),
  ],
}

const common = {
  entry: {
    main: PATHS.source + '/index.ts'
  },
  output: {
    path: PATHS.build,
    filename: 'bundle.js',
    library: {
      type: 'umd',
      name: 'ThreeShooter',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'source'),
    },
    extensions: ['.js', '.ts'],
  },
  devtool: 'source-map',
  module: {
    rules: [
      { enforce: "pre", test: /\.js$/, use: ["source-map-loader"] },
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: 'ts-loader'
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
  if (env.development) {
    return Object.assign(
      {},
      common,
      developmentConfig
    );
  }
  if (!env.development) {
    return Object.assign(
      {},
      common,
      productionConfig
    );
  }
};
