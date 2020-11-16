import DataTable from "@cucumber/cucumber/lib/models/data_table";

import {
  Given,
  When,
  Then,
  Step,
  defineParameterType,
  Before,
  After,
} from "../methods";

Given("foo", function (foo, bar: number, baz: string) {
  this; // $ExpectType Context
  foo; // $ExpectType unknown
  bar; // $ExpectType number
  baz; // $ExpectType string
});

Given(/foo/, function (foo, bar: number, baz: string) {
  this; // $ExpectType Context
  foo; // $ExpectType unknown
  bar; // $ExpectType number
  baz; // $ExpectType string
});

When("foo", function (foo, bar: number, baz: string) {
  this; // $ExpectType Context
  foo; // $ExpectType unknown
  bar; // $ExpectType number
  baz; // $ExpectType string
});

When(/foo/, function (foo, bar: number, baz: string) {
  this; // $ExpectType Context
  foo; // $ExpectType unknown
  bar; // $ExpectType number
  baz; // $ExpectType string
});

Then("foo", function (foo, bar: number, baz: string) {
  this; // $ExpectType Context
  foo; // $ExpectType unknown
  bar; // $ExpectType number
  baz; // $ExpectType string
});

Then(/foo/, function (foo, bar: number, baz: string) {
  this; // $ExpectType Context
  foo; // $ExpectType unknown
  bar; // $ExpectType number
  baz; // $ExpectType string
});

declare const table: DataTable;

Then("foo", function () {
  // Step should consume Mocha.Context.
  Step(this, "foo");
});

Then("foo", function () {
  // Step should consume DataTable's.
  Step(this, "foo", table);
});

Then("foo", function () {
  // Step should consume doc strings.
  Step(this, "foo", "bar");
});

defineParameterType({
  name: "foo",
  regexp: /foo/,
  transformer(foo, bar, baz) {
    this; // $ExpectType Context
    foo; // $ExpectType string
    bar; // $ExpectType string
    baz; // $ExpectType string
  },
});

Before(function () {
  this; // $ExpectType Context
});

Before({}, function () {
  this; // $ExpectType Context
});

Before({ tags: "foo" }, function () {
  this; // $ExpectType Context
});

After(function () {
  this; // $ExpectType Context
});

After({}, function () {
  this; // $ExpectType Context
});

After({ tags: "foo" }, function () {
  this; // $ExpectType Context
});
