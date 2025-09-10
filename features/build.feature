Feature: TypeScript Build

  Scenario: Compile TypeScript to JavaScript
    Given the use of typescript
    When I run `npm run build`
    Then I should see the compiled javascript files in the `dist` directory
