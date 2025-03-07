// Definition of utility functions and constants
import pop from './pop.mp3';

// function to play the pop sound
export const playPop = () => {
    const popSound = new Audio(pop);
    popSound.volume = 0.1;
    popSound.play();
};

export const circleSizeMap = new Map<number, string>([
    [0, 'w-[32rem] h-[32rem]'],
    [1, 'w-64 h-64'],
    [2, 'w-32 h-32'],
    [3, 'w-16 h-16'],
    [4, 'w-8 h-8'],
    [5, 'w-4 h-4'],
    [6, 'w-2 h-2'],
    [7, 'w-1 h-1'],
]);
