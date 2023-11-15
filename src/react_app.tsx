import React, { useEffect, useState } from 'react';
import { TreeView } from '@fluid-experimental/tree2';
import { Circle, FourCircles, circle, fourCircles } from './schema';
import { IFluidContainer } from 'fluid-framework';
import { Tree } from '@fluid-experimental/tree2';

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

    return (
        <div className="flex flex-col gap-3 items-center justify-center content-center m-6">
            <CirclesLayerView l={appRoot} />
            <Explanation />
        </div>
    );
}

export function FourCirclesView(props: { fc: FourCircles }): JSX.Element {
    return (
        <>
            <CirclesLayerView l={props.fc.circle1} />
            <CirclesLayerView l={props.fc.circle2} />
            <CirclesLayerView l={props.fc.circle3} />
            <CirclesLayerView l={props.fc.circle4} />
        </>
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
    const handleClick = () => {
        const parent = Tree.parent(props.l) as FourCircles;
        const fc = createFourCircles(props.l.level + 1);
        const key = Tree.key(props.l) as string;
        parent[key] = fc;
    };

    return <div onClick={() => handleClick()}>{props.l.level}</div>;
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
