var path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/GridDnd.tsx",
  externals: { react: "commonjs react", "react-dom": "commonjs react-dom" },
  output: {
    path: path.resolve(__dirname, "lib"),
    filename: "index.js",
    libraryTarget: "commonjs2",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules)/,
        use: "ts-loader",
      },
      {
        test: /\.css$/i,
        use: ["css-loader"],
      },
    ],
  },
};
