import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
	{
		test: {
			name: "integration-browser",
			include: ["test/integration/**/*.spec.ts"],
			browser: {
				enabled: true,
				provider: "playwright",
				name: "chromium",
				headless: true,
			},
		},
	},
]);
