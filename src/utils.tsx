import { Circle, FourCircles, getRandomColor } from './schema';
import { Tree } from '@fluid-experimental/tree2';
import { Guid } from 'guid-typescript';

export const trimTree = (fc: FourCircles) => {
    if (testForEmpty(fc)) {
        const parent = Tree.parent(fc);
        if (parent instanceof FourCircles) {
            const key = Tree.key(fc) as keyof FourCircles;
            if (key != 'level') setCircle(parent, key, undefined);
            trimTree(parent);
        }
    }
};

export const createFourCircles = (level: number) => {
    return new FourCircles({
        circle1: new Circle({ id: Guid.create().toString(), color: getRandomColor() }),
        circle2: new Circle({ id: Guid.create().toString(), color: getRandomColor() }),
        circle3: new Circle({ id: Guid.create().toString(), color: getRandomColor() }),
        circle4: new Circle({ id: Guid.create().toString(), color: getRandomColor() }),
        level: level,
    });
};

export const againAgain = (fc: FourCircles) => {
    if (testForEmpty(fc)) {
        fc.circle1 = new Circle({id: Guid.create().toString(), color: getRandomColor() });
        fc.circle2 = new Circle({id: Guid.create().toString(), color: getRandomColor() });
        fc.circle3 = new Circle({id: Guid.create().toString(), color: getRandomColor() });
        fc.circle4 = new Circle({id: Guid.create().toString(), color: getRandomColor() });
    }
};

export const testForEmpty = (fc: FourCircles) => {
    if (fc.circle1 == undefined &&
        fc.circle2 == undefined &&
        fc.circle3 == undefined &&
        fc.circle4 == undefined)
        return true;
    return false;
};
export const circleSizeMap = new Map<number, string>([
    [1, 'w-64 h-64'],
    [2, 'w-32 h-32'],
    [3, 'w-16 h-16'],
    [4, 'w-8 h-8'],
    [5, 'w-4 h-4'],
    [6, 'w-2 h-2'],
]);


// TODO: why does factoring this logic into this function fix the build?
export function setCircle(circles: FourCircles, key: Exclude<keyof FourCircles, "level">, value: FourCircles | Circle | undefined) {
    circles[key] = value;
}