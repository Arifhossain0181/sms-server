import 'express';

declare global {
	namespace Express {
		interface AuthUser {
			id: string;
			role: string;
			email?: string;
			studentId?: string; // যখন STUDENT login করে তখন তার student ID এ থাকবে
		}

		interface Request {
			user?: AuthUser;
		}
	}
}

export {}; // ensure this file is treated as a module
