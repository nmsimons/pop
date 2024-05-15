import {
    SchemaFactory,
    Tree,
    TreeConfiguration,
    ValidateRecursiveSchema,    
} from '@fluidframework/tree';
import { Guid } from 'guid-typescript';

const sf = new SchemaFactory('6404be1d-5e53-43f3-ac45-113c96a7c31b');

export class Circle extends sf.object('Circle', {
    id: sf.string,
    color: sf.string,    
}) {
    public pop() {
        const parent = Tree.parent(this);
        if (Tree.is(parent, Item)) parent.pop();
    }

    public get level(): number {
        const parent = Tree.parent(this);
        if (Tree.is(parent, Item))
            return parent.level
        else return 0;
    }
}

export class Item extends sf.objectRecursive('Item', {
    shape: sf.optionalRecursive([Circle, () => FourCircles]),
    level: sf.number,
}) {
    public static MaxLevel = 4;

    public hydrate() {
        this.shape = new Circle({
            id: Guid.create().toString(),
            color: getRandomColor(),            
        });
    }

    public pop() {
        if (Item.MaxLevel === this.level) {
            this.shape = undefined;
            this.trim();
        } else {
            this.shape = createFourCircles(this.level + 1);
        }
    }

    public get isEmpty() {
        return undefined === this.shape;
    }

    public trim() {
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

    public trim() {
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
        if (Tree.is(parent, Item))
            return parent.level + 1
        else return 0;
    }
}

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

const createFourCircles = (level: number): FourCircles => {
    return new FourCircles({
        circle1: createCircle(level),
        circle2: createCircle(level),
        circle3: createCircle(level),
        circle4: createCircle(level),        
    });
}

const createCircle = (level: number): Item => {
    return new Item({            
        level: level,
        shape: new Circle({
            id: Guid.create().toString(),
            color: getRandomColor(),                
        }),
    });
}    

{
    // Due to limitations of TypeScript, recursive schema may not produce type errors when declared incorrectly.
    // Using ValidateRecursiveSchema helps ensure that mistakes made in the definition of a recursive schema (like `Items`)
    // will introduce a compile error.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type _check = ValidateRecursiveSchema<typeof Item>;
}

export const treeConfiguration = new TreeConfiguration(
    Item,
    () =>
        new Item({
            level: 0,
            shape: new Circle({               
                id: Guid.create().toString(),
                color: getRandomColor(),
            }),
        })
);
