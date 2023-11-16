import {
    AllowedUpdateType,
    ProxyNode,
    SchemaBuilder,
    TreeFieldSchema,
    buildTreeConfiguration,
    FieldKinds,
    typeNameSymbol,
} from '@fluid-experimental/tree2';
import { getRandomColor } from './react_app';

const sb = new SchemaBuilder({ scope: '6404be1d-5e53-43f3-ac45-113c96a7c31b' });

export const circle = sb.object('circle', {
    level: sb.number,
    color: sb.string
});

export const fourCircles = sb.objectRecursive('fourCircles', {
    circle1: TreeFieldSchema.createUnsafe(FieldKinds.required, [
        circle,
        () => fourCircles,
    ]),
    circle2: TreeFieldSchema.createUnsafe(FieldKinds.required, [
        circle,
        () => fourCircles,
    ]),
    circle3: TreeFieldSchema.createUnsafe(FieldKinds.required, [
        circle,
        () => fourCircles,
    ]),
    circle4: TreeFieldSchema.createUnsafe(FieldKinds.required, [
        circle,
        () => fourCircles,
    ]),
});

export type Circle = ProxyNode<typeof circle>;
export type FourCircles = ProxyNode<typeof fourCircles>;

export const appSchema = sb.intoSchema(fourCircles);

export const appSchemaConfig = buildTreeConfiguration({
    schema: appSchema,
    initialTree: {
        circle1: {
            level: 1,
            color: getRandomColor(),
            [typeNameSymbol]: '6404be1d-5e53-43f3-ac45-113c96a7c31b.circle',            
        },
        circle2: {
            level: 1,
            color: getRandomColor(),
            [typeNameSymbol]: '6404be1d-5e53-43f3-ac45-113c96a7c31b.circle',
        },
        circle3: {
            level: 1,
            color: getRandomColor(),
            [typeNameSymbol]: '6404be1d-5e53-43f3-ac45-113c96a7c31b.circle',
        },
        circle4: {
            level: 1,
            color: getRandomColor(),
            [typeNameSymbol]: '6404be1d-5e53-43f3-ac45-113c96a7c31b.circle',
        },
    },
    allowedSchemaModifications: AllowedUpdateType.SchemaCompatible,
});
