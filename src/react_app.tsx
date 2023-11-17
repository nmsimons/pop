import React, { useEffect, useState } from 'react';
import { TreeView } from '@fluid-experimental/tree2';
import { Circle, FourCircles, circle, fourCircles } from './schema';
import { IFluidContainer } from 'fluid-framework';
import { Tree } from '@fluid-experimental/tree2';
import { countColors, colorMap, trimTree, createFourCircles, circleSizeMap, testForEmpty, againAgain } from './utils'

const _MaxLevel = 5;

export function ReactApp(props: {
    data: TreeView<FourCircles>;
    container: IFluidContainer;
}): JSX.Element {
    const [invalidations, setInvalidations] = useState(0);

    const appRoot = props.data.root;

    // Register for tree deltas when the component mounts.
    // Any time the tree changes, the app will update
    useEffect(() => {
        // Returns the cleanup function to be invoked when the component unmounts.
        return Tree.on(appRoot, 'afterChange', () => {
            setInvalidations(invalidations + Math.random());
        });
    }, [invalidations]);

    const classes =
        'flex flex-col gap-3 items-center justify-center mt-6 content-center select-none relative w-full';

    const counter = new Map<string, number>();
    countColors(appRoot, counter);

    return (
        <div className={classes}>
            <div className="scale-75 md:scale-100">
                <CirclesLayerView l={appRoot} level={1} />
            </div>
            <Explanation />
            <ColorCount colorCount={counter} />
            <AgainAgain fc={appRoot} />
            <div className="h-16" />
        </div>
    );
}

export function ColorCount(props: { colorCount: Map<string, number> }): JSX.Element {
    return (
        <div className="flex flex-row max-w-sm justify-between w-full">
            {[...colorMap.values()].map((k) => (
                <CircleWithCount
                    key={k}
                    color={k}
                    count={props.colorCount.get(k) ?? 0}
                />
            ))}
        </div>
    );
}

export function CircleWithCount(props: {
    count: number;
    color: string;
}): JSX.Element {
    const color = { background: props.color };

    return (
        <div
            style={color}
            className={
                'flex items-center justify-center font-bold text-lg text-white border-0 rounded-full scale-95 w-14 h-14'
            }
        >
            {props.count}
        </div>
    );
}

export function FourCirclesView(props: { fc: FourCircles }): JSX.Element {
    return (
        <div className="flex flex-col">
            <div className="flex flex-row">
                <CirclesLayerView l={props.fc.circle1} level={props.fc.level} />
                <CirclesLayerView l={props.fc.circle2} level={props.fc.level} />
            </div>
            <div className="flex flex-row">
                <CirclesLayerView l={props.fc.circle3} level={props.fc.level} />
                <CirclesLayerView l={props.fc.circle4} level={props.fc.level} />
            </div>
        </div>
    );
}

export function CirclesLayerView(props: {
    l: Circle | FourCircles | undefined;
    level: number;
}): JSX.Element {
    if (Tree.is(props.l, circle)) {
        return <CircleView c={props.l} level={props.level} />;
    } else if (Tree.is(props.l, fourCircles)) {        
        return <FourCirclesView fc={props.l} />;
    } else {
        return <Popped level={props.level} />;
    }
}

export function CircleView(props: { c: Circle; level: number }): JSX.Element {
    const popCircle = () => {
        const parent = Tree.parent(props.c);
        if (Tree.is(parent, fourCircles) && props.level == _MaxLevel - 1) {
            const key = Tree.key(props.c) as keyof typeof parent;
            if (key != 'level') parent[key] = undefined;
            trimTree(parent);            
        } else if (Tree.is(parent, fourCircles) && props.level < _MaxLevel) {
            const fc = createFourCircles(props.level + 1);
            const key = Tree.key(props.c) as keyof typeof parent;
            if (key != 'level') parent[key] = fc;
        }
    };

    const handleClick = () => {
        popCircle();
    };

    const handleMouseEnter = (e: React.MouseEvent) => {
        if (e.buttons > 0) {
            popCircle();
        }
    };

    const size =
        props.level === _MaxLevel
            ? circleSizeMap.get(props.level) + ' invisible'
            : circleSizeMap.get(props.level);

    const color = { background: props.c.color };

    return (
        <div
            style={color}
            className={
                'transition-all duration-500 ease-in-out border-0 rounded-full scale-95 hover:scale-100 shadow-md ' +
                size
            }
            onMouseEnter={(e) => handleMouseEnter(e)}
            onClick={() => handleClick()}
        ></div>
    );
}

export function Popped(props: { level: number }): JSX.Element {
    const size = circleSizeMap.get(props.level) + ' ';
    return (
        <div
            className={
                'border-2 border-gray-300 border-dashed bg-transparent rounded-full scale-95 ' +
                size
            }
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

export function AgainAgain(props: { fc: FourCircles }): JSX.Element {
    if (testForEmpty(props.fc)) {
        return (
            <div
                className="transition-all text-lg hover:scale-125"
                onClick={() => againAgain(props.fc)}
            >
                again again
            </div>
        );
    }
    return <></>;
}


