/* eslint-disable react/jsx-key */
import { treeConfiguration } from './schema';

import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { loadFluidData, containerSchema } from './infra/fluid';
import './output.css';
import { ReactApp } from './react_app';
import { _defaultMaxLevel } from './schema';
import { AttachState } from 'fluid-framework';
import { clientProps } from './infra/clientProps';
import { AzureClient } from '@fluidframework/azure-client';

export let maxLevel = -1;
const maxMaxLevel = 7;

async function main() {
    // create the root element for React
    const app = document.createElement('div');
    app.id = 'app';
    document.body.appendChild(app);
    const root = createRoot(app);

    // Get the root container id from the URL
    // If there is no container id, then the app will make
    // a new container.
    let containerId = location.hash.substring(1);

    const client = new AzureClient(clientProps);

    // Initialize Fluid Container
    const { container, services } = await loadFluidData(
        containerId,
        containerSchema,
        client
    );

    // if the container is detached
    // get the query parameters from the URL
    // and set the maxLevel to the value in the query parameters
    if (container.attachState === AttachState.Detached) {
        const queryParams = location.search.substring(1);
        const usp = new URLSearchParams(queryParams);
        // Get the maxLevel from the URL and convert it to a number
        const max = parseInt(usp.get('maxLevel') as string);
        if (!isNaN(max)) maxLevel = parseInt(usp.get('maxLevel') as string);
        else maxLevel = _defaultMaxLevel;
        if (maxLevel > maxMaxLevel) maxLevel = maxMaxLevel;
        if (maxLevel < 0) maxLevel = _defaultMaxLevel;
    }

    // Initialize the SharedTree Data Structure
    const appData = container.initialObjects.appData.schematize(treeConfiguration);

    // If the maxLevel is not set and the container is not detached
    // Get the maxLevel from the Fluid Container
    if (maxLevel === -1) {
        maxLevel = appData.root.maxLevel;
    }

    // Render the app - note we attach new containers after render so
    // the app renders instantly on create new flow. The app will be
    // interactive immediately.
    root.render(
        <StrictMode>
            <ReactApp
                rootItem={appData.root.item}
                container={container}
                services={services}
            />
        </StrictMode>
    );

    // If the app is in a `createNew` state - the container is detached, we attach the container.
    // This uploads the container to the service and connects to the collaboration session.
    if (container.attachState === AttachState.Detached) {
        containerId = await container.attach();

        // The newly attached container is given a unique ID that can be used to access the container in another session
        location.hash = containerId;
    }
}

export default main();
