# Instructions for logging issues

## 1. Read the FAQ

Please [read the FAQ](user-guide/faq.md) before logging new issues, even if you think you have found a bug.

Issues that ask questions answered in the FAQ will be closed without elaboration.

## 2. Search for duplicates

Search the existing issues before logging a new one.

## 3. Do you have a question?

The issue tracker is primarily for **issues**, in other words, bugs and suggestions. User support is generally not provided and if you have a *question*, please use [Stack Overflow](https://stackoverflow.com/questions/tagged/cypress-cucumber-preprocessor), your favorite search engine, or other resources. There *is* a [Gitter](https://gitter.im/cypress-io/cypress) channel for Cypress that you may try, but it doesn't specifically pertain to community-maintained plugins.

## 4. Did you find a bug?

When logging a bug, please be sure to include the following:

 * What version of the preprocessor and Cypress you're using
 * Extended output by running Cypress with `DEBUG=cypress:electron,cypress-configuration,cypress-cucumber-preprocessor`
 * An *isolated* way to reproduce the behavior
 * The behavior you expect to see and the actual behavior

It's impossible to fix an issue that we can't reproduce ourselves and issues lacking enough information to reproduce the behavior will be closed.

You will have much better luck getting a response if you do the maintainers the favor by creating a clonable and minimal repository illustrating the issue.

If you can't be bothered to do that, you're essentially saying your time is more valuable than ours and that simply isn't true, nor does it inspire us to care.

Don't ever post screenshots of errors unless they're also accompanied by text. We're not going to perform OCR on your ticket just to be able to help you.
