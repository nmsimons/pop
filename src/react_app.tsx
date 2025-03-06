import React, { useEffect, useLayoutEffect, useState } from 'react';
import { FourCircles, Item } from './schema.js';
import { ConnectionState, IFluidContainer, IMember, Tree } from 'fluid-framework';
import { circleSizeMap } from './utils.js';
import { playPop } from './utils.js';
import { AzureContainerServices } from '@fluidframework/azure-client';
import { maxLevel } from './index.js';

type Circle = {
    id: number;
    level: number;
    color: string;
    pop: () => void;
};

export function ReactApp(props: {
    rootItem: Item;
    container: IFluidContainer;
    services: AzureContainerServices;
}): JSX.Element {
    return (
        <div className="flex flex-col bg-transparent h-[calc(100vh-48px)] w-full overflow-hidden overscroll-none">
            <ConnectionStatus {...props} />
            <RootItemView root={props.rootItem} />
            <Footer root={props.rootItem} />
        </div>
    );
}

export function RootItemView(props: { root: Item }): JSX.Element {
    return (
        <div className="flex flex-row h-full justify-center items-center overflow-x-hidden overflow-y-auto">
            <div className="scale-75 sm:scale-100 md:scale-125 lg:scale-150">
                <ItemView item={props.root} />
            </div>
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
    const [users, setUsers] = useState(
        props.services.audience.getMembers().values()
    );
    const [connectionState, setConnectionState] = useState(
        getConnectionStateAsString(props.container.connectionState)
    );
    const [savedState, setSavedState] = useState(!props.container.isDirty);

    useEffect(() => {
        const audience = props.services.audience;
        const handleAudienceChange = () => {
            setUsers(audience.getMembers().values());
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
        <Header
            clientId="clientId"
            connectionState={connectionState}
            fluidMembers={Array.from(users) as IMember[]}
            saved={savedState}
        />
    );
}

type ItemType = 'circle' | 'fourCircles' | 'popped';

const getItemType = (item: Item): ItemType => {
    if (item.shape === undefined) {
        return 'popped';
    } else if (item.shape instanceof FourCircles) {
        return 'fourCircles';
    } else if (item.shape) {
        return 'circle';
    }
    return 'circle';
};

export function ItemView(props: { item: Item }): JSX.Element {
    const [itemType, setItemType] = useState(getItemType(props.item));

    // Register for tree deltas when the component mounts.
    // Any time this Item changes, the component will update
    useLayoutEffect(() => {
        const unsubscribe = Tree.on(props.item, 'nodeChanged', () =>
            setItemType(getItemType(props.item))
        );
        return unsubscribe;
    }, []);

    const i = props.item;

    switch (itemType) {
        case 'circle':
            return (
                <CircleView
                    circle={{
                        id: i.id,
                        level: i.level,
                        color: i.color,
                        pop: () => i.pop(),
                    }}
                />
            );
        case 'fourCircles':
            if (Tree.is(i.shape, FourCircles)) {
                return (
                    <div className="flex flex-col">
                        <div className="flex flex-row">
                            <ItemView item={i.shape.circle1} />
                            <ItemView item={i.shape.circle2} />
                        </div>
                        <div className="flex flex-row">
                            <ItemView item={i.shape.circle3} />
                            <ItemView item={i.shape.circle4} />
                        </div>
                    </div>
                );
            } else {
                return <></>;
            }
        case 'popped':
            return <Popped trim={i.trim} level={i.level} />;
    }
}

export function CircleView(props: { circle: Circle }): JSX.Element {
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

export function Popped(props: { trim: () => void; level: number }): JSX.Element {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleClick = (e: React.MouseEvent) => {
        if (e.button === 0) {
            props.trim();
        }
    };

    const handleMouseEnter = (e: React.MouseEvent) => {
        if (e.buttons > 0) {
            props.trim();
        }
    };

    const size = circleSizeMap.get(props.level);

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

export function Footer(props: { root: Item }): JSX.Element {
    const { root } = props;

    return (
        <div className="fixed bottom-0 left-0 flex flex-row w-full h-[48px] bg-gray-600 text-white text-lg justify-center z-40 items-center">
            <AgainAgain root={root} />
        </div>
    );
}

export function AgainAgain(props: { root: Item }): JSX.Element {
    return (
        <div
            className="transition-all text-lg hover:scale-125 text-center cursor-pointer"
            onClick={() => props.root.hydrate()}
        >
            again again
        </div>
    );
}

export function Header(props: {
    saved: boolean;
    connectionState: string;
    fluidMembers: IMember[];
    clientId: string;
}): JSX.Element {
    return (
        <div className="h-[48px] flex shrink-0 flex-row items-center justify-between bg-black text-base text-white z-40 w-full">
            <div className="flex m-2">Pop</div>
            <div className="flex m-2 ">
                {props.saved ? 'saved' : 'not saved'} | {props.connectionState} |
                users: {props.fluidMembers.length}
            </div>
        </div>
    );
}
