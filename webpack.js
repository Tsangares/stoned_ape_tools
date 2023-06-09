const { merge } = require('webpack-merge');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const common = require('./webpack.baseconfig.js');

const firefox_webpack = merge(common, {
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
    path: path.resolve(__dirname, 'dist_firefox'),
    clean: true,
  },
  devServer: {
    static: './dist',
  },
});

const chrome_webpack = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: 'static'
        },
        {
          from: 'manifests/manifest_chrome.json',
          to: 'manifest.json'
        }
      ],
    })
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist_chrome'),
    clean: true,
  },
  devServer: {
    static: './dist',
  },
});

module.exports = [chrome_webpack, firefox_webpack];

