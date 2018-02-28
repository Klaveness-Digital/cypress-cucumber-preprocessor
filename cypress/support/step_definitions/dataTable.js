/* global then, when */

// you can have external state, and also require things!
let sum = 0;

when("I add all following numbers:", dataTable => {
  // console.log("a, ", dataTable.rawTable.slice(1))
  sum = dataTable.rawTable
    .slice(1)
    .reduce(
      (rowA, rowB) =>
        rowA.reduce((a, b) => parseInt(a, 10) + parseInt(b, 10)) +
        rowB.reduce((a, b) => parseInt(a, 10) + parseInt(b, 10))
    );
});

then("I verify the datatable result is equal to {int}", result => {
  expect(sum).to.equal(result);
});
