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
        if (Tree.is(parent, fourCircles) && props.l.level < 5) {
            const fc = createFourCircles(props.l.level + 1);
            const key = Tree.key(props.l) as keyof typeof parent;
            parent[key] = fc;
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        popCircle();
    }

    const handleMouseEnter = (e: React.MouseEvent) => {
        if (e.ctrlKey || e.shiftKey) {
            popCircle();
        }
    }

    let size = 'w-64';

    switch (props.l.level) {
        case 1: {
            size = 'w-64 h-64';
            break;
        }
        case 2: {
            size = 'w-32 h-32';
            break;
        }
        case 3: {
            size = 'w-16 h-16';
            break;
        }
        case 4: {
            size = 'w-8 h-8';
            break;
        }
        // case 5: {
        //     size = 'w-4 h-4';
        //     break;
        // }        
        default: {
            size = 'w-4 h-4 invisible';
            break;
        }        
    }

    return (
        <div
            className={'transition-all border-0 rounded-full bg-black ' + size}
            onMouseEnter={(e) => handleMouseEnter(e)} onClick={(e) => handleClick(e)}
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
