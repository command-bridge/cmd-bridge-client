const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const packageJson = require('./package.json');

module.exports = {
  entry: './src/main.ts', // Entry for the main process
  mode: 'production',
  target: 'electron-main',
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      'electron-reload': false,
    },        
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    filename: 'main.js', // Output file for the main process
    path: path.resolve(__dirname, 'dist'), // Ensure this matches your Electron builder config
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'assets', to: 'assets' }, // Copy assets
      ],
    }),
    new webpack.DefinePlugin({
      'process.env.npm_package_version': JSON.stringify(packageJson.version),
    }),
  ],
};
