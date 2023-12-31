import {    
    SchemaFactory,
    TreeConfiguration
} from '@fluidframework/tree';
import { Guid } from 'guid-typescript';

const sb = new SchemaFactory('6404be1d-5e53-43f3-ac45-113c96a7c31b');

export class Circle extends sb.object('Circle', {
    id: sb.string,
    color: sb.string,
}) {}

const fourCirclesReference = () => FourCircles;
sb.fixRecursiveReference(fourCirclesReference);
export class FourCircles extends sb.object('FourCircles', {
    circle1: sb.optional([
        Circle,
        fourCirclesReference,
    ]),
    circle2: sb.optional([
        Circle,
        fourCirclesReference,
    ]),
    circle3: sb.optional([
        Circle,
        fourCirclesReference,
    ]),
    circle4: sb.optional([
        Circle,
        fourCirclesReference,
    ]),
    level: sb.number,
}) {}

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
export const colorMap = new Map<number, string>([
    [0, 'Red'],
    [1, 'Green'],
    [2, 'Blue'],
    [3, 'Orange'],
    [4, 'Purple'],
]);

export const treeConfiguration = new TreeConfiguration(
    FourCircles,
    () => new FourCircles({
        circle1: new Circle({
            id: Guid.create().toString(),
            color: getRandomColor(),            
        }),
        circle2: new Circle({
            id: Guid.create().toString(),
            color: getRandomColor(),            
        }),
        circle3: new Circle({
            id: Guid.create().toString(),
            color: getRandomColor(),            
        }),
        circle4: new Circle({
            id: Guid.create().toString(),
            color: getRandomColor(),            
        }),
        level: 1,
    })    
);
