import Web3 from 'web3';
import { Web3BaseWalletAccount } from 'web3-types';

import { GethClient } from '../../src';
import { DockerContainerStatus } from '../../src/types';

jest.setTimeout(30000);

const provider = 'http://127.0.0.1:8545';
const web3 = new Web3(provider);

describe('Client Geth - start and stop', () => {
	let gethClient: GethClient;

	it('should start a Geth client and get block number', async () => {
		gethClient = new GethClient();
		await gethClient.start();

		const result = await web3.eth.getBlockNumber();

		expect(gethClient.dockerContainerStatus).toBe(
			DockerContainerStatus.RUNNING,
		);
		expect(result).toBe(0n);
	});

	it('should stop the Geth client', async () => {
		expect(gethClient.dockerContainerStatus).toBe(
			DockerContainerStatus.RUNNING,
		);
		gethClient.stop();
		expect(gethClient.dockerContainerStatus).toBe(DockerContainerStatus.EXITED);
	});
});

describe('Client Geth - Methods', () => {
	const expectedInitialAccountBalance = 1000000000000000000n;

	let gethClient: GethClient;
	let newAccount: Web3BaseWalletAccount;

	beforeAll(async () => {
		gethClient = new GethClient();
		await gethClient.start();
	});

	afterAll(() => {
		gethClient.stop();
	});

	it('should create an account with default initial balance', async () => {
		newAccount = await gethClient.createAccount();
		expect(await web3.eth.getBalance(newAccount.address)).toBe(
			expectedInitialAccountBalance,
		);
	});

	it('should fund the above created account with an additional 1 ETH', async () => {
		const expectedNewBalance =
			BigInt(expectedInitialAccountBalance) * BigInt(2);

		expect(await web3.eth.getBalance(newAccount.address)).toBe(
			expectedInitialAccountBalance,
		);

		await gethClient.fundAccount(
			newAccount.address,
			BigInt(expectedInitialAccountBalance),
		);

		expect(await web3.eth.getBalance(newAccount.address)).toBe(
			expectedNewBalance,
		);
	});
});
