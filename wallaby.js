/* eslint-disable */

module.exports = function (wallaby) {
  return {
    files: [
      {pattern: './*.+(js|jsx|json|snap|css|less|sass|scss|jpg|jpeg|gif|png|svg)', load: false},
      {pattern: '!./*.test.js?(x)', load: false},
      './*.snap',
      {pattern: '.eslintrc', load: false},
      './cypress/support/step_definitions/*.js',
      './cypress/integration/*.feature',
    ],

    tests: [
      {pattern: './*.test.js?(x)', load: true}
    ],



    env: {
      type: 'node',
      runner: 'node'
    },

    testFramework: 'jest',

  }
};
