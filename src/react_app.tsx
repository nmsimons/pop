import React, { useEffect, useState } from 'react';
import { TreeView } from '@fluidframework/tree';
import { Circle, FourCircles, Item } from './schema';
import { ConnectionState, IFluidContainer } from 'fluid-framework';
import { Tree } from '@fluidframework/tree';
import { circleSizeMap } from './utils';
import useSound from 'use-sound';
import pop from './pop.mp3';
import { AzureContainerServices } from '@fluidframework/azure-client';

export function ReactApp(props: {
    data: TreeView<typeof Item>;
    container: IFluidContainer;
    services: AzureContainerServices
}): JSX.Element {
    
    const [users, setUsers] = useState(props.services.audience.getMembers().size);
    const [connectionState, setConnectionState] = useState("");
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
    }, []);

    // Save the state of the app when the container is saved
    useEffect(() => {        
        props.container.on('saved', () => setSavedState(!props.container.isDirty));
        props.container.on('dirty', () => setSavedState(!props.container.isDirty));        
    }, []);

    const updateConnectionState = () => {
        if (props.container.connectionState === ConnectionState.Connected) {
            setConnectionState("connected");
        } else if (props.container.connectionState === ConnectionState.Disconnected) {
            setConnectionState("disconnected");
        } else if (props.container.connectionState === ConnectionState.EstablishingConnection) {
            setConnectionState("connecting");
        } else if (props.container.connectionState === ConnectionState.CatchingUp) {
            setConnectionState("catching up");
        }
    };
    
    

    const classes =
        'flex flex-col gap-3 items-center justify-center mt-6 content-center select-none relative w-full';

    return (
        <div className={classes}>
            <div className="scale-75 md:scale-100">
                <CirclesLayerView i={props.data.root} />
            </div>
            <Explanation />
            <AgainAgain root={props.data.root} />
            <div className="text-lg">Users: {users} </div>
            <div className='text-lg'>Connection State: {connectionState} </div>
            <div className='text-lg'>Saved: {savedState.toString()} </div> 
            <div className="h-16" />
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
    // Any time the tree changes, the app will update
    useEffect(() => {
        const unsubscribe = Tree.on(props.i, 'nodeChanged', () => {
            setInvalidations(invalidations + Math.random());
        });
        return unsubscribe;
    }, []);

    if (props.i.shape === undefined) {
        return <Popped i={props.i} />;
    } else if (props.i.shape instanceof Circle) {
        return <CircleView circle={props.i.shape} />;
    } else if (props.i.shape instanceof FourCircles) {
        return <FourCirclesView fc={props.i.shape} />;
    } else {
        return <Popped i={props.i} />;
    }
}

export function CircleView(props: { circle: Circle }): JSX.Element {
    const [mounted, setMounted] = useState(false);
    const [playPop] = useSound(pop, { volume: 0.1 });

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
        props.circle.level === Item.MaxLevel + 1
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
            className="transition-all text-lg hover:scale-125"
            onClick={() => props.root.hydrate()}
        >
            again again
        </div>
    );
}
