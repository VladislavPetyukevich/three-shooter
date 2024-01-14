const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

const commitHash = require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString()
  .trim();

const buildPrefix = 'alpha';
const build = `${buildPrefix}-${commitHash}`;

const PATHS = {
  root: path.join(__dirname),
  source: path.join(__dirname, 'source'),
  public: path.join(__dirname, 'public'),
  build: path.join(__dirname, 'build'),
};

const common = {
  entry: {
    main: PATHS.source + '/index.ts'
  },
  output: {
    path: PATHS.build,
    filename: '[name].[contenthash].js',
    clean: true,
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
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      inject: false,
      template: PATHS.root + '/index.html',
      filename: './index.html',
      templateParameters: {
        build,
      },
    }),
  ],
};

const developmentConfig = {
  mode: 'development',
  devServer: {
    static: {
      directory: PATHS.public,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        pathRewrite: { '^/api': '' },
      },
    },
    port: 8080,
    hot: true
  },
  optimization: {
    moduleIds: 'named',
  },
  plugins: [
    ...common.plugins,
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
    ...common.plugins,
    new CopyPlugin({
      patterns: [
        { from: PATHS.public, to: PATHS.build },
      ],
    }),
  ],
}

module.exports = function (env) {
  if (env.development) {
    return Object.assign(
      {},
      common,
      developmentConfig
    );
  }
  return Object.assign(
    {},
    common,
    productionConfig
  );
};
