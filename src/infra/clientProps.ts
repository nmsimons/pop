import {
    AzureRemoteConnectionConfig,
    AzureClientProps,
    AzureLocalConnectionConfig,
} from '@fluidframework/azure-client';
import { AzureFunctionTokenProvider, azureUser, user } from './tokenProvider';


const useAzure = process.env.FLUID_CLIENT === 'azure';
if (!useAzure) {
    console.warn(`Configured to use local tinylicious.`);
}

const remoteConnectionConfig: AzureRemoteConnectionConfig = {
    type: 'remote',
    tenantId: process.env.AZURE_TENANT_ID!,
    tokenProvider: new AzureFunctionTokenProvider(
        process.env.AZURE_FUNCTION_TOKEN_PROVIDER_URL!,
        azureUser
    ),
    endpoint: process.env.AZURE_ORDERER!,
};


const connectionConfig: AzureRemoteConnectionConfig = remoteConnectionConfig;
export const clientProps: AzureClientProps = {
    connection: connectionConfig,    
};
