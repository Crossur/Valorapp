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
    // proxy:{
    //   '/':{target:'http://localhost:8080'}
    // }
  },
  plugins:[
    new HtmlWebpackPlugin({
        title:'Development',
        template:'index.html'
    })
  ]
}