import 'express';

declare global {
	namespace Express {
		interface AuthUser {
			id: string;
			role: string;
			email?: string;
		}

		interface Request {
			user?: AuthUser;
		}
	}
}

export {}; // ensure this file is treated as a module
