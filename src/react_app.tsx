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
        setVictory(testForEmpty(appRoot));
    }, [invalidations]);

    const classes =
        'flex flex-col gap-3 items-center justify-center mt-6 content-center select-none relative w-full';

    if (victory) {
        return (
            <div className={classes}>
                <div className="absolute animate-bounce text-xl font-semibold">
                    win
                </div>
                <CirclesLayerView l={appRoot} level={1} />
                <Explanation />
            </div>
        );
    } else {
        return (
            <div className={classes}>
                <div className="scale-50 md:scale-75 lg:scale-100">
                    <CirclesLayerView l={appRoot} level={1} />
                </div>
                <Explanation />
            </div>
        );
    }
}

export function FourCirclesView(props: { fc: FourCircles }): JSX.Element {
    if (testForEmpty(props.fc)) {
        const parent = Tree.parent(props.fc);
        if (Tree.is(parent, fourCircles)) {
            const key = Tree.key(props.fc) as keyof typeof parent;
            if (key != 'level') parent[key] = undefined;
            return <Popped level={parent.level} />;
        }
    }

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
    const size = circleSizeMap.get(props.level) + ' invisible';
    return <div className={'border-0 rounded-full scale-95 ' + size}></div>;
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
        circle1: circle.create({ color: getRandomColor() }),
        circle2: circle.create({ color: getRandomColor() }),
        circle3: circle.create({ color: getRandomColor() }),
        circle4: circle.create({ color: getRandomColor() }),
        level: level,
    });
};

export const testForEmpty = (fc: FourCircles) => {
    if (
        fc.circle1 == undefined &&
        fc.circle2 == undefined &&
        fc.circle3 == undefined &&
        fc.circle4 == undefined
    ) return true;
    return false;
};

const circleSizeMap = new Map<number, string>([
    [1, 'w-64 h-64'],
    [2, 'w-32 h-32'],
    [3, 'w-16 h-16'],
    [4, 'w-8 h-8'],
    [5, 'w-4 h-4'],
    [6, 'w-2 h-2'],
]);

export const getRandomColor = (): string => {
    const color = colorMap.get(getRandomInt(5));
    if (typeof color === 'string') {
        return color;
    } else {
        return 'Black';
    }
};

const getRandomInt = (max: number): number => {
    return Math.floor(Math.random() * max);
};

const colorMap = new Map<number, string>([
    [0, 'Red'],
    [1, 'Green'],
    [2, 'Blue'],
    [3, 'Orange'],
    [4, 'Purple'],
]);
