Feature: Using Before and After

# After is implicitly tested by resetting the counter.

Scenario: With Before only
    Given I do something
    And Something else
    Then Before was called once

@withTaggedBefore
Scenario: With tagged Before only
    Given I do something
    And Something else
    Then Before with tag was called once

Scenario: With After only
    Given I do something
    And Something else

@withTaggedAfter
Scenario: With tagged After only
    Given I do something
    And Something else

Scenario: With Before and After
    Given I do something
    And Something else
    Then Before was called once

@withTaggedBefore
@withTaggedAfter
Scenario: With tagged After only
    Given I do something
    And Something else
    Then Before with tag was called once