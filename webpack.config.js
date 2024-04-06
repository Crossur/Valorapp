/* eslint-disable no-unused-vars */
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
  entry:'./src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    // publicPath: '/',
    filename: 'bundle.js',
  },
  mode: 'development',
  devServer: {
    host: 'localhost',
    port: 8080,
    static: {
      directory: path.resolve(__dirname, 'build'),
    },
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    proxy:{
      '/':{target:'http://localhost:3000/',secure:false},
      '/Login/**':{target:'http://localhost:3000/',secure:false},
      '/Kills':{target:'http://localhost:3000/',secure:false},
      '/deaths':{target:'http://localhost:3000/',secure:false},
      '/addKill':{target:'http://localhost:3000/',secure:false},
      '/addDeath':{target:'http://localhost:3000/',secure:false},
      '/gamesW':{target:'http://localhost:3000/',secure:false},
      '/addGamesW':{target:'http://localhost:3000/',secure:false},
      '/gamesL':{target:'http://localhost:3000/',secure:false},
      '/addGamesL':{target:'http://localhost:3000/',secure:false},
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
      },
      {
        test: /.(css|scss)$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader']
      },
    ],
  },
  plugins: [
    // new HtmlWebpackPlugin({
    //   template: 'index.html',
    // }),
    new NodePolyfillPlugin(),
  ],
  resolve: {
    // Enable importing JS / JSX files without specifying their extension
    extensions: ['.js', '.jsx'],
    modules:['src','node_modules']
  },
};