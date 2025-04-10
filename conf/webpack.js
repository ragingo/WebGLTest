'use strict';

const Path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');

const rootDir = `${__dirname}/../`
const getFullPath = (path) => Path.resolve(rootDir, path);

module.exports = {
  mode: 'development',
  entry: [
    "@babel/polyfill",
    getFullPath('./src/ts/main.ts')
  ],
  output: {
    path: getFullPath('./dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              configFile: getFullPath('conf/babel.js')
            }
          }
        ]
      },
      {
        test: /\.(glsl)$/,
        exclude: /node_modules/,
        loader: 'raw-loader',
      },
      {
        test: /\.(png|jpe?g|bmp)$/,
        exclude: /node_modules/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: './img'
        },
      },
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: loadPlugins(),
  devtool: 'source-map',
  devServer: {
    watchFiles: getFullPath('./dist'),
    hot: true,
    open: true,
    port: 3001
  }
}

function loadPlugins() {
  const plugins = [
    new HTMLWebpackPlugin({
      template: getFullPath('./src/index.html'),
      filename: getFullPath('./dist/index.html')
    })
  ];
  return plugins.filter((x) => x !== null);
}
