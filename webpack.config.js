const isElectron = process.env.BUILD_TARGET === 'electron';

module.exports = {
  entry: './src/main.ts',
  target: isElectron ? 'electron-renderer' : 'web',
  devServer: isElectron ? undefined : {
    hot: false,
    liveReload: false,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    filename: 'bundle.js',
    path: __dirname + '/dist'
  }
};