Feature: Continuous Integration with GitHub Actions

  Scenario: Automatic build and test on code push
    Given the use of GitHub Actions
    When I push code to the repository
    Then the code is automatically built and tested
