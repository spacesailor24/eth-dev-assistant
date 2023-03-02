import { Client } from './client';
import { ClientConfig } from '../config';
import {
	pullDockerImage,
	startDockerContainer,
	waitForConnection,
	waitForPort,
} from './utils';

export class GanacheClient extends Client {
	constructor(config?: Partial<ClientConfig>) {
		super({
			...config,
			port: config?.port ?? 8545,
			web3Provider: config?.web3Provider ?? 'http://127.0.0.1:8545',
			dockerRepo: config?.dockerRepo ?? 'trufflesuite/ganache',
			dockerImageTag: config?.dockerImageTag ?? 'latest',
		});
	}

	public async start(
		options: { waitForConnection?: boolean } = { waitForConnection: true },
	) {
		pullDockerImage(this.dockerImageString);
		this.dockerContainerId = startDockerContainer(
			`docker run --detach --publish ${this.config.port}:${this.config.port} ${this.dockerImageString} ` +
				`--wallet.totalAccounts 1 ` +
				`--wallet.passphrase "123" ` +
				`--networkId 1337`,
		);
		await waitForPort(this.config.port);

		if (options.waitForConnection) {
			await waitForConnection(this.config.web3Provider, this.dockerContainerId);
		}

		this._fundingAccountAddress = (await this.web3.eth.getAccounts())[0];

		return this.dockerContainerId;
	}
}
