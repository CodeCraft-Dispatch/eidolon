Feature: Git pre-commit hook enforcement

  Scenario: Pre-commit hook is defined
    Given the use of git and github actions
    Then a pre-commit git hook should exist in the repository

  Scenario: Pre-commit hook enforces desired checks
    Given the pre-commit hook is defined
    Then the pre-commit hook should contain the required validation logic
