Feature: Being a plugin handling Scenario Outline

  As a cucumber cypress plugin which handles Scenario Outline
  I want to allow people to write Scenatio Outline tests and run it in cypress

  Scenario Outline: Using Scenario Outlines
    When I add <provided number> and <another provided number>
    Then I verify that the result is equal the <provided>

    Examples:
      | provided number | another provided number | provided |
      | 1               | 2                       | 3        |
      | 100             | 200                     | 300      |

  Scenario Outline: Search the details of a phone
    Given a list of phones on phones store
    When I search the phone <brand> in search input
    Then <brand> <model> appears on the screen

    Examples:
      | brand   | model |
      | iPhone  | 6s    |
      | Samsung | S8    |
