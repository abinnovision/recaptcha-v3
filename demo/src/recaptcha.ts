import { load } from "../../src/ReCaptcha";

(async () => {
	const recaptcha = await load("6LfC6HgUAAAAAEtG92bYRzwYkczElxq7WkCoG4Ob");

	const token = await recaptcha.execute("login");

	console.log(token);
})();
