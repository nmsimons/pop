import React, { useEffect, useState } from 'react';
import { FourCircles, Item } from './schema';
import { ConnectionState, IFluidContainer, Tree } from 'fluid-framework';
import { circleSizeMap } from './utils';
import { playPop } from './utils';
import { AzureContainerServices } from '@fluidframework/azure-client';
import { maxLevel } from '.';

export function ReactApp(props: {
    rootItem: Item;
    container: IFluidContainer;
    services: AzureContainerServices;
}): JSX.Element {
    
    return (        
        <div className="flex flex-col gap-3 items-center justify-center mt-6 content-center select-none relative w-full">
            <div className="scale-75 md:scale-100">
                <CirclesLayerView i={props.rootItem} />
            </div>
            <Explanation />
            <AgainAgain root={props.rootItem} />
            <ConnectionStatus {...props} />
            <div className="h-16" />
        </div>
    );
}

// React component that shows the state of the Fluid container and
// the number of users in the session
export function ConnectionStatus(props: {
    container: IFluidContainer;
    services: AzureContainerServices;
}): JSX.Element {
    const getConnectionStateAsString = (connectionState: ConnectionState) => {
        switch (connectionState) {
            case ConnectionState.Connected:
                return 'connected';
            case ConnectionState.Disconnected:
                return 'disconnected';
            case ConnectionState.EstablishingConnection:
                return 'connecting';
            case ConnectionState.CatchingUp:
                return 'catching up';
            default:
                return 'unknown';
        }
    };
    const [users, setUsers] = useState(props.services.audience.getMembers().size);
    const [connectionState, setConnectionState] = useState(
        getConnectionStateAsString(props.container.connectionState)
    );
    const [savedState, setSavedState] = useState(!props.container.isDirty);

    useEffect(() => {
        const audience = props.services.audience;
        const handleAudienceChange = () => {
            setUsers(audience.getMembers().size);
        };
        audience.on('membersChanged', handleAudienceChange);
        return () => {
            audience.off('membersChanged', handleAudienceChange);
        };
    }, []);

    useEffect(() => {
        props.container.on('connected', () => updateConnectionState());
        props.container.on('disconnected', () => updateConnectionState());
        props.container.on('dirty', () => updateConnectionState());
        props.container.on('saved', () => updateConnectionState());
        props.container.on('disposed', () => updateConnectionState());
    }, []);

    const updateConnectionState = () => {
        setConnectionState(
            getConnectionStateAsString(props.container.connectionState)
        );
        setSavedState(!props.container.isDirty);
    };

    return (
        <div className="flex flex-row gap-2 items-center justify-center mt-6 content-center select-none relative w-full max-w-sm bg-black text-white p-4 rounded shadow-md">
            <div className="flex flex-col text-right w-1/2">
                <div>Users:</div>
                <div>Connection State:</div>
                <div>Saved:</div>
                <div>Max Depth:</div>
            </div>
            <div className="flex flex-col text-left w-1/2">
                <div>{users}</div>
                <div>{connectionState}</div>
                <div>{savedState.toString()}</div>
                <div>{maxLevel}</div>
            </div>
        </div>
    );
}

export function FourCirclesView(props: { fc: FourCircles }): JSX.Element {
    return (
        <div className="flex flex-col">
            <div className="flex flex-row">
                <CirclesLayerView i={props.fc.circle1} />
                <CirclesLayerView i={props.fc.circle2} />
            </div>
            <div className="flex flex-row">
                <CirclesLayerView i={props.fc.circle3} />
                <CirclesLayerView i={props.fc.circle4} />
            </div>
        </div>
    );
}

export function CirclesLayerView(props: { i: Item }): JSX.Element {
    const [invalidations, setInvalidations] = useState(0);

    // Register for tree deltas when the component mounts.
    // Any time this Item changes, the component will update
    useEffect(() => {
        const unsubscribe = Tree.on(props.i, 'nodeChanged', () => {
            setInvalidations(invalidations + Math.random());
        });
        return unsubscribe;
    }, []);

    if (props.i.shape === undefined) {
        return <Popped i={props.i} />;
    } else if (props.i.shape instanceof FourCircles) {
        return <FourCirclesView fc={props.i.shape} />;
    } else if (props.i.shape) {
        return <CircleView circle={props.i} />;
    } else {
        return <Popped i={props.i} />;
    }
}

export function CircleView(props: { circle: Item }): JSX.Element {
    const [mounted, setMounted] = useState(false);    

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleClick = (e: React.MouseEvent) => {
        if (e.button === 0) {
            playPop();
            props.circle.pop();
        }
    };

    const handleMouseEnter = (e: React.MouseEvent) => {
        if (e.buttons > 0) {
            playPop();
            props.circle.pop();
        }
    };

    const size =
        props.circle.level === maxLevel + 1
            ? circleSizeMap.get(props.circle.level) + ' invisible'
            : circleSizeMap.get(props.circle.level);

    const color = { background: props.circle.color };

    return (
        <div
            key={props.circle.id}
            style={color}
            className={
                'transition-all ease-in-out duration-100 border-0 rounded-full hover:scale-100 shadow-md ' +
                size +
                (mounted ? ' scale-95' : ' scale-90')
            }
            onMouseEnter={(e) => handleMouseEnter(e)}
            onClick={(e) => handleClick(e)}
        ></div>
    );
}

export function Popped(props: { i: Item }): JSX.Element {
    const [mounted, setMounted] = useState(false);

    const parent = Tree.parent(props.i);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleClick = (e: React.MouseEvent) => {
        if (e.button === 0 && Tree.is(parent, FourCircles)) {
            parent.trim();
        }
    };

    const handleMouseEnter = (e: React.MouseEvent) => {
        if (e.buttons > 0 && Tree.is(parent, FourCircles)) {
            parent.trim();
        }
    };

    const size = circleSizeMap.get(props.i.level);

    return (
        <div
            className={`transition-all ease-in-out duration-100 border-2 border-gray-300 border-dashed bg-transparent rounded-full ${size} ${
                mounted ? ' scale-95' : ' scale-75'
            }`}
            onMouseEnter={(e) => handleMouseEnter(e)}
            onClick={(e) => handleClick(e)}
        ></div>
    );
}

export function Explanation(): JSX.Element {
    return (
        <div className="flex flex-col max-w-sm gap-4 justify-left my-8">
            <div className="text-xl bg-black text-white p-4 rounded shadow-md">
                Copy the full URL to another browser tab or send it to someone to see
                that the data is synched between clients.
            </div>
        </div>
    );
}

export function AgainAgain(props: { root: Item }): JSX.Element {
    return (
        <div
            className="transition-all text-lg hover:scale-125 text-center"
            onClick={() => props.root.hydrate()}
        >
            again again
        </div>
    );
}
