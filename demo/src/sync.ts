import { load } from "../../src/ReCaptcha";

load("6LfC6HgUAAAAAEtG92bYRzwYkczElxq7WkCoG4Ob")
	.then((recaptcha) => {
		recaptcha
			.execute("login")
			.then((token) => {
				console.log(token);
			})
			.catch(console.error);
	})
	.catch(console.error);
