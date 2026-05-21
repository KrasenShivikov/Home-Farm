import { proxy } from "./src/proxy";

export { proxy };

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)",
	],
};
