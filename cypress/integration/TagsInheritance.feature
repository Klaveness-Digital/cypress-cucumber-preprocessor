@inherited-tag
Feature: Tags Implementation

  As a cucumber user I can use tag expression using both feature and scenario tags

  @own-tag
  Scenario: This scenario should run if @inherited-tag and @own-tag is present in env
    Given '@inherited-tag and @own-tag' is in current TAGS environmental variable
    Then this should run
