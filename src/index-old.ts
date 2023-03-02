import { Command } from 'commander';

import { SupportedClients } from './types';
import { GanacheClient } from './clients/ganache';
import { Client } from './clients/client';
import { ClientConfig } from './config';
import { stopDockerContainer } from './clients/utils';

(async () => {
	const program = new Command();

	program
		.name('Ethereum Dev Assistant')
		.description('CLI helper for creating local ETH networks for testing')
		.version('1.0.0');

	program
		.command('start')
		.description('Starts a specified ETH client with configurations')
		.option('-c, --client <client>', 'name of client')
		.option(
			'-n, --number-accounts <numberOfAccounts>',
			'number of accounts to create',
		)
		.option(
			'-a, --seed-amount <seedAmount>',
			'number of wei to seed accounts with',
		)
		.option('-p, --port <port>', 'port to serve client RPC API')
		.action(async options => {
			for (let option in options) {
				if (!(options.client in SupportedClients))
					throw new Error(`Specified client not supported: ${options.client}`);

				const clientConfig: Partial<ClientConfig> = {};

				switch (option) {
					case 'numberAccounts':
						console.log(options.numberAccounts);
						break;
					default:
						break;
				}

				let client: Client;
				switch (options.client.toLowerCase()) {
					case 'ganache':
						client = new GanacheClient(clientConfig);
						break;
					default:
						throw new Error(
							`Specified client not supported: ${options.client}`,
						);
				}

				client.start();
			}
		});

	program
		.command('stop')
		.description('Stops a specified ETH client')
		.option('--container-id <dockerContainerId>', 'Docker container id')
		.action(options => stopDockerContainer(options.containerId));

	program.parse();
})();
