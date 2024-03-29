const path = require("path");
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  entry:'./src/index.js',
  output:{
    path:path.resolve(__dirname,'build'),
    filename:'bundle.js'
  },
  mode:'development',
  // resolve:{
  //   fallback:{
  //     'path':require.resolve('path-browserify'),
  //     'util':require.resolve('util/'),
  //     "stream": require.resolve("stream-browserify"),
  //     "buffer": require.resolve("buffer/"),
  //     "querystring": require.resolve("querystring-es3"),
  //     "http": require.resolve("stream-http"),
  //     "crypto": require.resolve("crypto-browserify"),
  //     "zlib": require.resolve("browserify-zlib"),
  //     "assert": require.resolve("assert/"),
  //     "vm": require.resolve("vm-browserify")
  //   }
  //},
  module:{
    rules:[
      {
        test:/\.jsx?/,
        exclude:/node_modules/,
        use:{
          loader:'babel-loader',
          options:{
            presets:['@babel/preset-env','@babel/react']
          }
        }
      }
    ]
  },
  devServer:{
    static:{
      directory:path.resolve(__dirname,'build'),
      publicPath:'/build'
    },
    proxy:[{context:['/'],target:'http://localhost:3000'}],
  },
  plugins:[
    new HtmlWebpackPlugin({
        title:'Development',
        template:'index.html'
    })
  ]
}