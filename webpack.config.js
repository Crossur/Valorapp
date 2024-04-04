/* eslint-disable no-unused-vars */
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
  entry:'./src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: '/',
    filename: 'bundle.js',
  },
  mode: 'development',
  devServer: {
    host: 'localhost',
    port: 8080,
    // static: {
    //   directory: path.resolve(__dirname, 'build'),
    // },
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    proxy:{
      '/':{target:'http://localhost:3000',secure:false},
      '/Login':{target:'http://localhost:3000',secure:false}
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options:{
            presets:['@babel/preset-env','@babel/react']
          }
        },
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    new NodePolyfillPlugin(),
  ],
  resolve: {
    // Enable importing JS / JSX files without specifying their extension
    extensions: ['.js', '.jsx'],
    modules:['src','node_modules']
  },
};
