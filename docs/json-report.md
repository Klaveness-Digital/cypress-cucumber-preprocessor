# JSON reports

JSON reports can be enabled using the `json.enabled` property. The preprocessor uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig), which means you can place configuration options in EG. `.cypress-cucumber-preprocessorrc.json` or `package.json`. An example configuration is shown below.

```json
{
  "json": {
    "enabled": true
  }
}
```

This **requires** you to have downloaded and installed the [cucumber-json-formatter](https://github.com/cucumber/common/tree/main/json-formatter) **yourself**. Arch Linux users can install it from [AUR](https://aur.archlinux.org/packages/cucumber-json-formatter).

The location of the executable is configurable through the `json.formatter` property, but it will by default search for `cucumber-json-formatter` in your `PATH`.

The report is outputted to `cucumber-report.json` in the project directory, but can be configured through the `json.output` property.
