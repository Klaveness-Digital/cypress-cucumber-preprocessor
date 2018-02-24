Feature: Being a plugin

  As a cucumber cypress plugin
  I want to allow people to use gherkin syntax in cypress tests
  So they can create beautiful executable specification for their projects

  Scenario: Basic example
    Given a feature and a matching step definition file
    When I run cypress tests
    Then they run properly

  Scenario: DataTable
    When I add all following numbers:
      | number | another number |
      | 1      | 2              |
      | 3      | 4              |
    Then I verify the datatable result is equal to 10

  Scenario: DocString
    When I use DocString for code like this:
    """
    expect(true).to.equal(true)
    variableToVerify = "hello world"
    """
    Then I ran it and verify that it executes it

  Scenario Outline: Using Scenario Outlines
    When I add <provided number> and <another provided number>
    Then I verify that the result is equal the <provided>

    Examples:
      | provided number | another provided number | provided |
      | 1               | 2                       | 3        |
      | 100             | 200                     | 300      |
