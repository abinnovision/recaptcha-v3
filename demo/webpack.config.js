/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const WebpackHtmlPlugin = require("html-webpack-plugin");

module.exports = {
	entry: path.resolve(__dirname, "./src/index.ts"),

	output: {
		path: path.resolve(__dirname, "./dist"),
		publicPath: "/",
	},

	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: "ts-loader",
				options: {
					configFile: path.resolve(__dirname, "tsconfig.json"),
				},
			},
			{
				test: /\.js$/,
				loader: "babel-loader",
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: [".js", ".ts"],
	},
	mode: "development",
	devServer: {
		compress: true,
		historyApiFallback: true,
	},
	plugins: [
		new WebpackHtmlPlugin({
			template: path.resolve(__dirname, "./src/index.html"),
			inject: true,
		}),
	],
};
