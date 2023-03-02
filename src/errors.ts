import { ERR_CLIENT_FAILURE_TO_CONNECT } from './error_codes';

export interface EthDevAssistantErrorInterface extends Error {
	readonly name: string;
	readonly code: number;
	readonly stack?: string;
}

export abstract class EthDevAssistantError
	extends Error
	implements EthDevAssistantError
{
	public readonly name: string;
	public abstract readonly code: number;
	public stack: string | undefined;
	public innerError: Error | Error[] | undefined;

	public constructor(msg?: string, innerError?: Error | Error[]) {
		super(msg);
		this.innerError = innerError;
		this.name = this.constructor.name;

		if (typeof Error.captureStackTrace === 'function') {
			Error.captureStackTrace(new.target.constructor);
		} else {
			this.stack = new Error().stack;
		}
	}

	public static convertToString(value: unknown, unquotValue = false) {
		// Using "null" value intentionally for validation
		// eslint-disable-next-line no-null/no-null
		if (value === null || value === undefined) return 'undefined';

		const result = JSON.stringify(
			value,
			(_, v) => (typeof v === 'bigint' ? v.toString() : v) as unknown,
		);

		return unquotValue && ['bigint', 'string'].includes(typeof value)
			? result.replace(/['\\"]+/g, '')
			: result;
	}

	public toJSON() {
		return {
			name: this.name,
			code: this.code,
			message: this.message,
			innerError: this.innerError,
		};
	}
}

export class ClientFailureToConnectError extends EthDevAssistantError {
	public code = ERR_CLIENT_FAILURE_TO_CONNECT;
	public readonly dockerContainerId: string;

	public constructor(error: Error, dockerContainerId: string) {
		super(
			`Failed to connect to client with Docker Container ID: ${dockerContainerId}`,
			error,
		);
		this.dockerContainerId = dockerContainerId;
	}

	public toJSON() {
		return { ...super.toJSON(), dockerContainerId: this.dockerContainerId };
	}
}
