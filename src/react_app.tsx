import React, { useEffect, useState } from 'react';
import { TreeView } from '@fluid-experimental/tree2';
import { Circle, FourCircles, circle, fourCircles } from './schema';
import { IFluidContainer } from 'fluid-framework';
import { Tree } from '@fluid-experimental/tree2';

const _MaxLevel = 5;

export function ReactApp(props: {
    data: TreeView<FourCircles>;
    container: IFluidContainer;
}): JSX.Element {
    const [invalidations, setInvalidations] = useState(0);
    const [victory, setVictory] = useState(false);
    const appRoot = props.data.root;

    // Register for tree deltas when the component mounts.
    // Any time the tree changes, the app will update
    useEffect(() => {
        // Returns the cleanup function to be invoked when the component unmounts.
        return Tree.on(appRoot, 'afterChange', () => {
            setInvalidations(invalidations + Math.random());
        });
    }, [invalidations]);

    useEffect(() => {
        setVictory(countMaxLevelCircles(appRoot) == 4 ** _MaxLevel);
    }, [invalidations]);

    if (victory) {
        return (
            <div className="flex flex-col gap-3 items-center justify-center content-center m-6 select-none relative">
                <div className="absolute animate-bounce text-xl font-semibold">
                    win
                </div>
                <CirclesLayerView l={appRoot} />
                <Explanation />
            </div>
        );
    } else {
        return (
            <div className="flex flex-col gap-3 items-center justify-center content-center m-6 select-none relative">
                <CirclesLayerView l={appRoot} />
                <Explanation />
            </div>
        );
    }
}

export function FourCirclesView(props: { fc: FourCircles }): JSX.Element {
    return (
        <div className="flex flex-col">
            <div className="flex flex-row">
                <CirclesLayerView l={props.fc.circle1} />
                <CirclesLayerView l={props.fc.circle2} />
            </div>
            <div className="flex flex-row">
                <CirclesLayerView l={props.fc.circle3} />
                <CirclesLayerView l={props.fc.circle4} />
            </div>
        </div>
    );
}

export function CirclesLayerView(props: { l: Circle | FourCircles }): JSX.Element {
    if (Tree.is(props.l, circle)) {
        return <CircleView l={props.l} />;
    } else if (Tree.is(props.l, fourCircles)) {
        return <FourCirclesView fc={props.l} />;
    } else {
        return <></>;
    }
}

export function CircleView(props: { l: Circle }): JSX.Element {
    const popCircle = () => {
        const parent = Tree.parent(props.l);
        if (Tree.is(parent, fourCircles) && props.l.level < _MaxLevel) {
            const fc = createFourCircles(props.l.level + 1);
            const key = Tree.key(props.l) as keyof typeof parent;
            parent[key] = fc;
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
        props.l.level === _MaxLevel
            ? circleSizeMap.get(props.l.level) + ' invisible'
            : circleSizeMap.get(props.l.level);

    return (
        <div
            className={'border-0 rounded-full bg-black ' + size}
            onMouseEnter={(e) => handleMouseEnter(e)}
            onClick={() => handleClick()}
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

export const createFourCircles = (level: number) => {
    return fourCircles.create({
        circle1: circle.create({ level: level }),
        circle2: circle.create({ level: level }),
        circle3: circle.create({ level: level }),
        circle4: circle.create({ level: level }),
    });
};

export const countMaxLevelCircles = (item: FourCircles | Circle): number => {
    if (Tree.is(item, circle)) {
        if (item.level === _MaxLevel) return 1;
    }

    if (Tree.is(item, fourCircles)) {
        return (
            countMaxLevelCircles(item.circle1) +
            countMaxLevelCircles(item.circle2) +
            countMaxLevelCircles(item.circle3) +
            countMaxLevelCircles(item.circle4)
        );
    }
    return 0;
};

const circleSizeMap = new Map<number, string>([
    [1, 'w-64 h-64'],
    [2, 'w-32 h-32'],
    [3, 'w-16 h-16'],
    [4, 'w-8 h-8'],
    [5, 'w-4 h-4'],
    [6, 'w-2 h-2'],
]);
