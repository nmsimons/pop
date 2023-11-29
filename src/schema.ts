import {    
    SchemaFactory,
    TreeConfiguration
} from '@fluid-experimental/tree2';
import { getRandomColor } from './utils';
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

export const treeConfiguration = new TreeConfiguration(
    FourCircles,
    () => new FourCircles({
        circle1: {
            id: Guid.create().toString(),
            color: getRandomColor(),            
        },
        circle2: {
            id: Guid.create().toString(),
            color: getRandomColor(),           
        },
        circle3: {
            id: Guid.create().toString(),
            color: getRandomColor(),            
        },
        circle4: {
            id: Guid.create().toString(),
            color: getRandomColor(),            
        },
        level: 1,
    })    
);
