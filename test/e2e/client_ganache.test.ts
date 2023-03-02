import Web3 from 'web3';
import { Web3BaseWalletAccount } from 'web3-types';

import { GanacheClient } from '../../src';
import { DockerContainerStatus } from '../../src/types';

jest.setTimeout(30000);

const provider = 'http://127.0.0.1:8545';
const web3 = new Web3(provider);

describe('Client Ganache - start and stop', () => {
	let ganacheClient: GanacheClient;

	it('should start a Ganache client and get block number', async () => {
		ganacheClient = new GanacheClient();
		await ganacheClient.start();

		const result = await web3.eth.getBlockNumber();

		expect(ganacheClient.dockerContainerStatus).toBe(
			DockerContainerStatus.RUNNING,
		);
		expect(result).toBe(0n);
	});

	it('should stop the Ganache client', async () => {
		expect(ganacheClient.dockerContainerStatus).toBe(
			DockerContainerStatus.RUNNING,
		);
		ganacheClient.stop();
		expect(ganacheClient.dockerContainerStatus).toBe(
			DockerContainerStatus.EXITED,
		);
	});
});

describe('Client Ganache - Methods', () => {
	const expectedInitialAccountBalance = 1000000000000000000n;

	let ganacheClient: GanacheClient;
	let newAccount: Web3BaseWalletAccount;

	beforeAll(async () => {
		ganacheClient = new GanacheClient();
		await ganacheClient.start();
	});

	afterAll(() => {
		ganacheClient.stop();
	});

	it('should create an account with default initial balance', async () => {
		newAccount = await ganacheClient.createAccount();
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

		await ganacheClient.fundAccount(
			newAccount.address,
			BigInt(expectedInitialAccountBalance),
		);

		expect(await web3.eth.getBalance(newAccount.address)).toBe(
			expectedNewBalance,
		);
	});
});
