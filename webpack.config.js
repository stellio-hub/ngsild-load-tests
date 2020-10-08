const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    batchCreateEntities: './src/api/scenario-batch-create-entities.js',
    createEntities: './src/api/scenario-create-entities.js',
    loadOnTemporal: './src/api/scenario-load-on-temporal.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs',
    filename: '[name].bundle.js',
  },
  module: {
    rules: [{ test: /\.js$/, use: 'babel-loader' }],
  },
  target: 'web',
  externals: /k6(\/.*)?/,
};