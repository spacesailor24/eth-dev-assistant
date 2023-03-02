import { execSync } from 'child_process';
import { FetchError } from 'node-fetch';
import waitPort from 'wait-port';
import { Web3RequestManager } from 'web3-core';
import { ethRpcMethods } from 'web3-rpc-methods';

import { ClientFailureToConnectError } from '../errors';

export const pullDockerImage = (dockerImageString: string) => {
	try {
		execSync(`docker pull ${dockerImageString}`);
	} catch (error) {
		throw error;
	}
};

export const startDockerContainer = (dockerContainerRunCommand: string) => {
	try {
		const dockerContainerId = execSync(dockerContainerRunCommand);
		return dockerContainerId.toString().substring(0, 12);
	} catch (error) {
		throw error;
	}
};

export const stopDockerContainer = (dockerContainerId: string) => {
	try {
		execSync(`docker container kill ${dockerContainerId}`);
	} catch (error) {
		throw error;
	}
};

export const getDockerContainerStatus = (dockerContainerId: string) => {
	try {
		return execSync(
			`docker inspect --format='{{ .State.Status }}' ${dockerContainerId}`,
		)
			.toString()
			.trim();
	} catch (error) {
		throw error;
	}
};

export const waitForPort = async (port: number) => {
	try {
		await waitPort({ port, output: 'silent' });
	} catch (error) {
		throw error;
	}
};

export const waitForConnection = async (
	provider: string,
	dockerContainerId: string,
	options: {
		maxConnectionAttempts: number;
		connectionAttemptDelay: number;
	} = {
		maxConnectionAttempts: 5,
		connectionAttemptDelay: 1500,
	},
) => {
	const web3RequestManager = new Web3RequestManager(provider);

	let connectionAttempts = 0;

	const connect = async () => {
		const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

		if (connectionAttempts === options.maxConnectionAttempts) {
			// TODO Replace error
			throw new Error('Max connection attempts reached');
		}
		connectionAttempts += 1;

		try {
			await ethRpcMethods.getBlockNumber(web3RequestManager);
		} catch (error) {
			if (
				(error as FetchError)?.code === 'ECONNRESET' &&
				(error as FetchError)?.message.includes('reason: socket hang up')
			) {
				await sleep(options.connectionAttemptDelay);
				await connect();
			} else {
				throw new ClientFailureToConnectError(
					error as Error,
					dockerContainerId,
				);
			}
		}
	};

	await connect();
};
