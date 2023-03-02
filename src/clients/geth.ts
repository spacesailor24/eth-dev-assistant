import { Client } from './client';
import { ClientConfig } from '../config';
import {
	pullDockerImage,
	startDockerContainer,
	waitForConnection,
	waitForPort,
} from './utils';

export class GethClient extends Client {
	constructor(config?: Partial<ClientConfig>) {
		super({
			...config,
			port: config?.port ?? 8545,
			web3Provider: config?.web3Provider ?? 'http://127.0.0.1:8545',
			dockerRepo: config?.dockerRepo ?? 'ethereum/client-go',
			dockerImageTag: config?.dockerImageTag ?? 'latest',
		});
	}

	public async start(
		options: { waitForConnection?: boolean } = { waitForConnection: true },
	) {
		pullDockerImage(this.dockerImageString);
		this.dockerContainerId = startDockerContainer(
			`docker run --detach --publish ${this.config.port}:${this.config.port} ${this.dockerImageString} ` +
				`--nodiscover --nousb --http --http.addr 0.0.0.0 --http.port ${this.config.port} ` +
				`--allow-insecure-unlock --http.api personal,web3,eth,admin,debug,txpool,net --dev`,
		);
		await waitForPort(this.config.port);

		if (options.waitForConnection) {
			await waitForConnection(this.config.web3Provider, this.dockerContainerId);
		}

		this._fundingAccountAddress = (await this.web3.eth.getAccounts())[0];

		return this.dockerContainerId;
	}
}
