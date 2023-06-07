const { merge } = require('webpack-merge');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const common = require('./webpack.baseconfig.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new CopyPlugin({
      patterns: [
        { 
          from: 'static' 
        }, 
        { 
          from: 'manifests/manifest_firefox.json', 
          to: 'manifest.json' 
        }
      ],
    })
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'firefox_dist'),
    clean: true,
  },
  devServer: {
    static: './dist',
  },
});
