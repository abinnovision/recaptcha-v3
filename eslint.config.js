/** @type {import("@types/eslint").Linter.FlatConfig[]} */
module.exports = [
	...require("@abinnovision/eslint-config-base"),
	...require("@abinnovision/eslint-config-typescript"),
	{
		files: ["**/*.{js,ts}"],
		languageOptions: { globals: require("globals").node },
	},
	{
		files: ["cypress/**/*.{js,ts}"],
		languageOptions: { parserOptions: { project: "./cypress/tsconfig.json" } },
	},
	{
		files: ["demo/**/*.{js,ts}"],
		languageOptions: { parserOptions: { project: "./demo/tsconfig.json" } },
	},
];
