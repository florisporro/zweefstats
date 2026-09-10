/// <reference types="../worker-configuration.d.ts" />

declare global {
	namespace App {
		interface Platform {
			env: Env;
			context: ExecutionContext;
		}
	}
}

export {};
