import React, { useEffect, useState } from 'react';
import { TreeView } from '@fluidframework/tree';
import { Circle, FourCircles, Item } from './schema';
import { IFluidContainer } from 'fluid-framework';
import { Tree } from '@fluidframework/tree';
import { circleSizeMap } from './utils';
import useSound from 'use-sound';
import pop from './pop.mp3';

export function ReactApp(props: {
    data: TreeView<typeof Item>;
    container: IFluidContainer;
}): JSX.Element {
    const [invalidations, setInvalidations] = useState(0);

    // Register for tree deltas when the component mounts.
    // Any time the tree changes, the app will update
    useEffect(() => {
        const unsubscribe = Tree.on(props.data.root, 'treeChanged', () => {
            setInvalidations(invalidations + Math.random());
        });
        return unsubscribe;
    }, []);

    const classes =
        'flex flex-col gap-3 items-center justify-center mt-6 content-center select-none relative w-full';

    return (
        <div className={classes}>
            <div className="scale-75 md:scale-100">
                <CirclesLayerView i={props.data.root} parent={undefined} />
            </div>
            <Explanation />
            <AgainAgain root={props.data.root} />
            <div className="h-16" />
        </div>
    );
}

export function FourCirclesView(props: { fc: FourCircles }): JSX.Element {
    return (
        <div className="flex flex-col">
            <div className="flex flex-row">
                <CirclesLayerView i={props.fc.circle1} parent={props.fc} />
                <CirclesLayerView i={props.fc.circle2} parent={props.fc} />
            </div>
            <div className="flex flex-row">
                <CirclesLayerView i={props.fc.circle3} parent={props.fc} />
                <CirclesLayerView i={props.fc.circle4} parent={props.fc} />
            </div>
        </div>
    );
}

export function CirclesLayerView(props: {
    i: Item;
    parent: FourCircles | undefined;
}): JSX.Element {
    if (props.i.shape === undefined) {
        return <Popped i={props.i} />;
    } else if (props.i.shape instanceof Circle) {
        return <CircleView item={props.i} />;
    } else if (props.i.shape instanceof FourCircles) {
        return <FourCirclesView fc={props.i.shape} />;
    } else {
        return <Popped i={props.i} />;
    }
}

export function CircleView(props: { item: Item }): JSX.Element {
    const [mounted, setMounted] = useState(false);
    const [playPop] = useSound(pop, { volume: 0.1 });

    if (Tree.is(props.item.shape, Circle)) {
        useEffect(() => {
            setMounted(true);
        }, []);

        const handleClick = (e: React.MouseEvent) => {
            if (e.button === 0) {
                playPop();
                props.item.pop();
            }
        };

        const handleMouseEnter = (e: React.MouseEvent) => {
            if (e.buttons > 0) {
                playPop();
                props.item.pop();
            }
        };

        const size =
            props.item.level === Item._MaxLevel + 1
                ? circleSizeMap.get(props.item.level) + ' invisible'
                : circleSizeMap.get(props.item.level);

        const color = { background: props.item.shape.color };

        return (
            <div
                key={props.item.shape.id}
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
    } else {
        return <></>;
    }
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

export function AgainAgain(props: { root: FourCircles | Item }): JSX.Element {
    return (
        <div
            className="transition-all text-lg hover:scale-125"
            onClick={() => props.root.hydrate()}
        >
            again again
        </div>
    );
}
