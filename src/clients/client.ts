import Web3 from 'web3';
import { Address } from 'web3-types';

import { ClientConfig } from '../config';
import { getDockerContainerStatus, stopDockerContainer } from './utils';

export abstract class Client {
	public config: ClientConfig;
	public dockerImageString: string;
	public dockerContainerId: string | undefined;
	public accounts: string[] = [];
	public web3: Web3;

	protected _fundingAccountAddress: Address | undefined;

	constructor(config: ClientConfig) {
		this.config = config;
		this.dockerImageString = `${this.config.dockerRepo}:${this.config.dockerImageTag}`;
		this.web3 = new Web3(this.config.web3Provider);
	}

	abstract start(): Promise<string>;

	public get fundingAccountAddress() {
		if (this._fundingAccountAddress === undefined) {
			throw new Error(
				'Client must be started before retrieving funding account address',
			);
		}

		return this._fundingAccountAddress;
	}

	public get dockerContainerStatus() {
		try {
			if (this.dockerContainerId === undefined) {
				// TODO
				throw new Error('Docker container not started');
			}

			return getDockerContainerStatus(this.dockerContainerId);
		} catch (error) {
			// TODO
			throw error;
		}
	}

	public async stop() {
		if (this.dockerContainerId === undefined) {
			// TODO
			throw new Error('Docker container not started');
		}

		try {
			stopDockerContainer(this.dockerContainerId);
		} catch (error) {
			// TODO
			throw error;
		}
	}

	public async createAccount(options?: { initialBalance?: bigint }) {
		this.web3.eth.accounts.wallet.create(1);
		const newAccount = this.web3.eth.accounts.wallet.get(
			this.web3.eth.accounts.wallet.length - 1,
		);
		if (newAccount === undefined) {
			// TODO
			throw new Error('Failed to create and get new account');
		}

		if (options?.initialBalance === undefined || options?.initialBalance > 0) {
			await this.fundAccount(
				newAccount.address,
				options?.initialBalance ?? BigInt('1000000000000000000'), // 1 ETH
			);
		}

		return newAccount;
	}

	public async fundAccount(address: Address, amount: bigint) {
		const fundingAccountBalance = await this.web3.eth.getBalance(
			this.fundingAccountAddress,
		);

		if (fundingAccountBalance < amount) {
			// TODO
			throw new Error(
				`Fund amount: ${amount.toString(
					10,
				)} exceeds funding account balance ${fundingAccountBalance.toString(
					10,
				)}`,
			);
		}

		await this.web3.eth.sendTransaction({
			from: this.fundingAccountAddress,
			to: address,
			value: amount,
			gas: '53000',
		});
	}
}
