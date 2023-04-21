import { load } from "../../src/ReCaptcha";

(async () => {
	async function asyncAwaitReCaptcha() {
		const recaptcha = await load("6LfC6HgUAAAAAEtG92bYRzwYkczElxq7WkCoG4Ob");
		const token = await recaptcha.execute("action");

		console.log(token);
	}

	await asyncAwaitReCaptcha();
})();
