import { Step } from '../utils/utils';
import MimicClient, { type FieldName, type FieldRecord } from '../api/mimic-client';
import type { UUID } from 'node:crypto';
import { expect } from '@playwright/test';

const mimicBaseUrl: string = 'https://mimic.triforce.jamf.build/';
const pollIntervals: number[] = [1_000, 2_000, 10_000];
const pollTimeout: number = 60_000;

export default class MimicSteps {
	private readonly mimicClient: MimicClient;

	constructor() {
		this.mimicClient = new MimicClient(mimicBaseUrl);
	}

	private async getFieldFromDeviceInfo<T extends FieldName>(udid: string, field: T) {
		const deviceInfo = await this.mimicClient.getDeviceInfo(udid);
		const fields = deviceInfo.fields;
		const fieldDefinition = fields.find((obj) => field in obj)!;
		return (fieldDefinition as FieldRecord)[field];
	}

	private async getConfigurationsOfMimicDevice(udid: string) {
		const valueOfField = await this.getFieldFromDeviceInfo(
			udid,
			'com.jamfsoftware.mimic.asset.state.fields.declarativemanagement.DeclarativeManagementDeclarations'
		);
		return valueOfField.value.configurations;
	}

	private async getActivationsOfMimicDevice(udid: string) {
		const valueOfField = await this.getFieldFromDeviceInfo(
			udid,
			'com.jamfsoftware.mimic.asset.state.fields.declarativemanagement.DeclarativeManagementDeclarations'
		);
		return valueOfField.value.activations;
	}

	@Step('Blueprint with id "$0" is deployed to mimic device "$1" with type "$2"')
	public async blueprintIsDeployedToMimicDevice(blueprintId: UUID, udid: string, type: string) {
		const configurationIdentifier = 'Blueprint_' + blueprintId + '_s1_c1_cfg1';
		const activationIdentifier = 'Blueprint_' + blueprintId + '_s1_activation';

		await expect
			.poll(
				async () => {
					const configurations = await this.getConfigurationsOfMimicDevice(udid);
					return Object.keys(configurations);
				},
				{
					message: 'Eventually mimic has correct configuration key',
					intervals: pollIntervals,
					timeout: pollTimeout,
				}
			)
			.toContain(configurationIdentifier);

		await expect
			.poll(
				async () => {
					const activations = await this.getActivationsOfMimicDevice(udid);
					return Object.keys(activations);
				},
				{
					message: 'Eventually mimic has correct activation key',
					intervals: pollIntervals,
					timeout: pollTimeout,
				}
			)
			.toContain(activationIdentifier);

		const activations = await this.getActivationsOfMimicDevice(udid);
		const activation = activations[activationIdentifier];

		expect(activation).not.toBeUndefined();
		expect(activation!.declarationIdentifiers).toContain(configurationIdentifier);
		expect(activation!.identifier).toEqual(activationIdentifier);
		expect(activation!.active).toBeTruthy();
		expect(activation!.valid).toEqual('valid');

		const configurations = await this.getConfigurationsOfMimicDevice(udid);
		const configuration = configurations[configurationIdentifier];

		expect(configuration).not.toBeUndefined();
		expect(configuration!.type).toEqual(type);
		expect(configuration!.identifier).toEqual(configurationIdentifier);
		expect(configuration!.active).toBeTruthy();
		expect(configuration!.valid).toEqual('valid');
	}

	@Step('The mimic device "$0" checks in')
	public async mimicDeviceChecksIn(udid: string) {
		await this.mimicClient.checkIn(udid);
	}
}
