'use strict';

const plugin = require('tailwindcss/plugin');

module.exports = plugin.withOptions((options = {}) => {
  return ({ matchUtilities, theme }) => {
    matchUtilities({
      'grid-cols-center': (value) => {
        const targetCount = +value;
        if (!Number.isInteger(targetCount)) return {};
        const output = {
          'grid-template-columns': `repeat(${value * 2}, minmax(0, 1fr))`,
          '> *': {
            'grid-column': 'span 2',
          },
        };
        const centerOffset = -targetCount;
        for (let fillableCount = 1; fillableCount < targetCount; ++fillableCount) {
          for (let itemCount = 0; itemCount < fillableCount; ++itemCount) {
            for (let index = 0; index <= itemCount; ++index) {
              output[`> *:nth-last-child(${itemCount + 1 - index}):nth-child(${targetCount}n + ${index + 1})`] = {
                'grid-column-end': `${centerOffset - itemCount + index * 2}`,
              };
            }
          }
        }
        return output;
      },
    }, {
      values: (() => {
        const output = {};
        for (const key in theme('gridTemplateColumns')) {
          if (!Number.isInteger(+key)) continue;
          output[key] = key;
        }
        return output;
      })(),
    });
  };
});
