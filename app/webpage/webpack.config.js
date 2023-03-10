const path = require('path');
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: ['./src/index.tsx'],
  mode: 'development',
  stats: 'minimal',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ],
  },
  optimization: {
    minimize: true,

  },
  devtool: 'cheap-module-source-map',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: path.join(__dirname, "src", "*.html"), to: path.join(__dirname, "dist", "[name].html") },
        {
          from: "./src/*.html",
          to: () => "[name].html"
        },
        {
          from: "./src/*.css",
          to: () => "[name].css"
        },
        {
          from: "./src/favicon.ico",
          to: () => "favicon.ico"
        }
      ],
    })
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'piggo-legends-min.js',
    path: path.resolve(__dirname, 'dist'),
  }
};
