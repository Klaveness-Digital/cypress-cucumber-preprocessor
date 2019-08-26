Feature: Using And and But
  Scenario: With an And everything is fine
    Given I do something
    And Something else
    Then I happily work

  Scenario: With a But
    Given I dont do something
    And it is sunday
    Then I stream on twitch
    But only when not tired
