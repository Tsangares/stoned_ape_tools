const path = require('path');

module.exports = {
  entry: {
    worker: './source/worker.js',
    intel: './source/intel.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)x?$/,
        use: ['ts-loader'],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.jsx'],
  }
};
