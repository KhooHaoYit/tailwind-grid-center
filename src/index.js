'use strict';

const plugin = require('tailwindcss/plugin');

const generateAllColumn = function* (targetCount) {
  for (let itemCount = 1; itemCount < targetCount; ++itemCount) {
    for (let index = 0; index < itemCount; ++index) {
      yield [itemCount, index];
    }
  }
}

// https://stackoverflow.com/questions/147515/least-common-multiple-for-3-or-more-numbers
const gcd = (a, b) => {
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}
const lcm = (...args) => args.reduce((val, input) => val * input / gcd(val, input));

module.exports = plugin.withOptions((options = {}) => {
  return ({ matchUtilities, theme }) => {
    matchUtilities({
      'grid-cols-start': value => {
        const targetCount = +value;
        if (!Number.isInteger(targetCount)) return {};
        return {
          'grid-template-columns': `repeat(${value}, minmax(0, 1fr))`,
        };
      },
      'grid-cols-center': value => {
        const targetCount = +value;
        if (!Number.isInteger(targetCount)) return {};
        const output = {
          'grid-template-columns': `repeat(${value * 2}, minmax(0, 1fr))`,
          '> *': {
            'grid-column': 'span 2',
          },
        };
        for (const [itemCount, index] of generateAllColumn(targetCount)) {
          output[`> *:nth-last-child(${itemCount - index}):nth-child(${targetCount}n + ${index + 1})`] = {
            'grid-column-end': `${-targetCount - itemCount - 1 + index * 2}`,
          };
        }
        return output;
      },
      'grid-cols-end': value => {
        const targetCount = +value;
        if (!Number.isInteger(targetCount)) return {};
        const output = {
          'grid-template-columns': `repeat(${value}, minmax(0, 1fr))`,
        };
        for (const [itemCount, index] of generateAllColumn(targetCount)) {
          output[`> *:nth-last-child(${itemCount - index}):nth-child(${targetCount}n + ${index + 1})`] = {
            'grid-column-end': `${targetCount + 1 - (itemCount - 1) + index}`,
          };
        }
        return output;
      },
      /** Between visualization
       * |-|-|-|-
       * |- |- |-
       * |-    |-
       * 
       * |||
       * | |
      */
      /** */
      'grid-cols-between': value => {
        const targetCount = +value;
        if (!Number.isInteger(targetCount)) return {};
        const itemSize = lcm(...Array(targetCount - 1).fill().map((_, index) => index + 1)) / (targetCount - 1);
        const output = {
          'grid-template-columns': `repeat(${itemSize * targetCount}, minmax(0, 1fr))`,
          '> *': {
            'grid-column': `span ${itemSize}`,
          },
        };
        for (const [itemCount, index] of generateAllColumn(targetCount)) {
          if (itemCount === 1) continue;
          const leftOffset = itemSize * (targetCount - 1) / (itemCount - 1);
          output[`> *:nth-last-child(${itemCount - index}):nth-child(${targetCount}n + ${index + 1})`] = {
            'grid-column-end': `${leftOffset * index + itemSize + 1}`,
          };
        }
        return output;
      },
      /** Around visualization
       * |---|---|---
       *  |---  |---
       *     |---
       * 
       * |-|-
       *  |-
      */
      /** */
      'grid-cols-around': value => {
        const targetCount = +value;
        if (!Number.isInteger(targetCount)) return {};
        const multiplier = Array(targetCount - 1).fill().map((_, index) => {
          const multiplier = [targetCount - 1 - index, (index + 1) * 2];
          const divideable = gcd(...multiplier);
          multiplier[0] /= divideable;
          multiplier[1] /= divideable;
          return multiplier;
        });
        const itemSize = lcm(...multiplier.map(val => val[1]));
        const output = {
          'grid-template-columns': `repeat(${itemSize * targetCount}, minmax(0, 1fr))`,
          '> *': {
            'grid-column': `span ${itemSize}`,
          },
        };
        for (const [itemCount, index] of generateAllColumn(targetCount)) {
          const currentMultiplier = multiplier.at(itemCount - 1);
          const padSize = itemSize / currentMultiplier[1] * currentMultiplier[0];
          output[`> *:nth-last-child(${itemCount - index}):nth-child(${targetCount}n + ${index + 1})`] = {
            'grid-column-end': `${(padSize * 2 + itemSize) * index + padSize + itemSize + 1}`,
          };
        }
        return output;
      },
      /** Evenly visualization
       * |--|--|--
       *  |-- |--
       *    |--
       * 
       * |-|-
       *  |-
      */
      /** */
      'grid-cols-evenly': value => {
        const targetCount = +value;
        if (!Number.isInteger(targetCount)) return {};
        const multiplier = Array(targetCount - 1).fill().map((_, index) => {
          const multiplier = [targetCount - 1 - index, index + 2];
          const divideable = gcd(...multiplier);
          multiplier[0] /= divideable;
          multiplier[1] /= divideable;
          return multiplier;
        });
        const itemSize = lcm(...multiplier.map(val => val[1]));
        const output = {
          'grid-template-columns': `repeat(${itemSize * targetCount}, minmax(0, 1fr))`,
          '> *': {
            'grid-column': `span ${itemSize}`,
          },
        };
        for (const [itemCount, index] of generateAllColumn(targetCount)) {
          const currentMultiplier = multiplier.at(itemCount - 1);
          const padSize = itemSize / currentMultiplier[1] * currentMultiplier[0];
          output[`> *:nth-last-child(${itemCount - index}):nth-child(${targetCount}n + ${index + 1})`] = {
            'grid-column-end': `${(padSize + itemSize) * (index + 1) + 1}`,
          };
        }
        return output;
      },
    }, { values: theme('gridTemplateColumnsCenter') });
  };
}, () => ({
  theme: {
    gridTemplateColumnsCenter: {
      1: '1',
      2: '2',
      3: '3',
      4: '4',
      5: '5',
      6: '6',
      7: '7',
      8: '8',
      9: '9',
      10: '10',
      11: '11',
      12: '12',
    },
  },
}));
