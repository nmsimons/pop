import {
    AllowedUpdateType,
    TypedNode,
    SchemaBuilder,
    TreeFieldSchema,
    buildTreeConfiguration,
    FieldKinds,
    typeNameSymbol,
} from '@fluid-experimental/tree2';
import { getRandomColor } from './utils';

const sb = new SchemaBuilder({ scope: '6404be1d-5e53-43f3-ac45-113c96a7c31b' });

export const circle = sb.object('circle', {
    color: sb.string,
});

export const fourCircles = sb.objectRecursive('fourCircles', {
    circle1: TreeFieldSchema.createUnsafe(FieldKinds.optional, [
        circle,
        () => fourCircles,
    ]),
    circle2: TreeFieldSchema.createUnsafe(FieldKinds.optional, [
        circle,
        () => fourCircles,
    ]),
    circle3: TreeFieldSchema.createUnsafe(FieldKinds.optional, [
        circle,
        () => fourCircles,
    ]),
    circle4: TreeFieldSchema.createUnsafe(FieldKinds.optional, [
        circle,
        () => fourCircles,
    ]),
    level: TreeFieldSchema.createUnsafe(FieldKinds.required, [sb.number]),
});

export type Circle = TypedNode<typeof circle>;
export type FourCircles = TypedNode<typeof fourCircles>;

export const appSchema = sb.intoSchema(fourCircles);

export const appSchemaConfig = buildTreeConfiguration({
    schema: appSchema,
    initialTree: {
        circle1: {
            color: getRandomColor(),
            [typeNameSymbol]: '6404be1d-5e53-43f3-ac45-113c96a7c31b.circle',
        },
        circle2: {
            color: getRandomColor(),
            [typeNameSymbol]: '6404be1d-5e53-43f3-ac45-113c96a7c31b.circle',
        },
        circle3: {
            color: getRandomColor(),
            [typeNameSymbol]: '6404be1d-5e53-43f3-ac45-113c96a7c31b.circle',
        },
        circle4: {
            color: getRandomColor(),
            [typeNameSymbol]: '6404be1d-5e53-43f3-ac45-113c96a7c31b.circle',
        },
        level: 1,
    },
    allowedSchemaModifications: AllowedUpdateType.SchemaCompatible,
});
