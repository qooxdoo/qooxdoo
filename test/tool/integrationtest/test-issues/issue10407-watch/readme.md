# Issue 10407 - Watch Mode Test Application

This is a clean test application for testing watch mode detection of unresolved symbols.

## Purpose

Unlike the main issue10407 test application, this application starts **without any errors**.
This allows watch mode tests to:
- Start with a clean compilation
- Dynamically add code with unresolved symbols
- Verify that watch mode detects and warns about the newly added unresolved symbols

## Usage

This application is used by integration tests in `test-issues.js` for watch mode testing.
Tests will modify Application.js during execution to add unresolved class references,
then verify that the compiler detects and warns about them in watch mode.
