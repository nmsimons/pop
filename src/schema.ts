import {
    SchemaFactory,
    Tree,
    TreeViewConfiguration,
    ValidateRecursiveSchema,
} from 'fluid-framework';
import { maxLevel } from './index.js';

const sf = new SchemaFactory('6404be1d-5e53-43f3-ac45-113c96a7c31b');

let _counter = 0;

export const _defaultMaxLevel = 4;

export class Item extends sf.objectRecursive('Item', {
    shape: sf.optionalRecursive([sf.boolean, () => FourCircles]),    
    color: sf.string,    
}) {
    public readonly id = _counter++;

    public hydrate = () => {
        // Reset the counter when the tree is hydrated
        if (this.level === 0) {
            _counter = 0;
        }
        this.shape = true;
        this.color = getRandomColor();
    }

    public pop = () => {
        if (maxLevel === this.level) {
            this.shape = undefined;
            this.trim();
        } else {
            this.shape = createFourCircles();
        }
    }

    public get level(): number {
        const parent = Tree.parent(this);
        if (Tree.is(parent, FourCircles))
            return parent.level;
        else return 0;
    }

    public get isEmpty() {
        return undefined === this.shape;
    }

    public trim = () => {
        if (this.isEmpty) {
            const parent = Tree.parent(this);
            if (parent instanceof FourCircles) {
                parent.trim();
            }
        }
    }
}

export class FourCircles extends sf.object('FourCircles', {
    circle1: Item,
    circle2: Item,
    circle3: Item,
    circle4: Item,
}) {
    public trim = () => {
        if (this.isEmpty()) {
            const parent = Tree.parent(this);
            if (parent instanceof Item) {
                parent.shape = undefined;
                parent.trim();
            }
        }
    }

    // if two or more circles are removed concurrently, this test will fail
    // because it will return false in both clients and won't run again
    // this is mitigated by code that manually removes empty circles but
    // is a limitation of SharedTree currently
    private isEmpty() {
        if (
            this.circle1.isEmpty &&
            this.circle2.isEmpty &&
            this.circle3.isEmpty &&
            this.circle4.isEmpty
        )
            return true;
        return false;
    }

    public get level(): number {
        const parent = Tree.parent(this);
        if (Tree.is(parent, Item)) return parent.level + 1;
        else return 0;
    }
}

export class Pop extends sf.object('Pop', {
    item: Item,
    maxLevel: sf.number,
}) {}

const getRandomColor = (): string => {
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

const createFourCircles = (): FourCircles => {
    return new FourCircles({
        circle1: createCircleItem(),
        circle2: createCircleItem(),
        circle3: createCircleItem(),
        circle4: createCircleItem(),
    });
};

export const createCircleItem = (): Item => {
    return new Item({              
        shape: true,
        color: getRandomColor(),
    });
};

{
    // Due to limitations of TypeScript, recursive schema may not produce type errors when declared incorrectly.
    // Using ValidateRecursiveSchema helps ensure that mistakes made in the definition of a recursive schema (like `Items`)
    // will introduce a compile error.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type _check = ValidateRecursiveSchema<typeof Item>;
}

export const treeConfiguration = new TreeViewConfiguration({schema: Pop})