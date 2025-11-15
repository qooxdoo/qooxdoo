#!/bin/bash

# Simple test script to check if camelCase conversion is necessary
# Run: bash RUN_THIS_TEST.sh

echo "================================================================================"
echo "TEST: Is camelCase conversion technically necessary for issue #10808?"
echo "================================================================================"
echo ""
echo "This will run the qooxdoo test suite and check the relevant tests."
echo ""

# First, show the analysis
echo "--- Step 1: Theoretical Analysis ---"
node /home/user/qooxdoo/test_camelcase_necessity.js
echo ""
echo "Press Enter to continue with actual qooxdoo tests, or Ctrl+C to abort..."
read

# Run the specific test
echo ""
echo "--- Step 2: Running qooxdoo Tests ---"
echo "Running: qx.test.data.controller.Form tests"
echo ""

cd /home/user/qooxdoo

# Run the test and capture output
npm test -- --class qx.test.data.controller.Form 2>&1 | tee /tmp/qx_test_output.txt

echo ""
echo "================================================================================"
echo "TEST RESULTS SUMMARY"
echo "================================================================================"

# Check for our specific tests
echo ""
echo "Looking for test: testNoConversionNeeded"
grep -A 5 "testNoConversionNeeded" /tmp/qx_test_output.txt || echo "Test not found or not run"

echo ""
echo "Looking for errors related to properties/getters:"
grep -i "getUsername\|getEmailAddress\|property\|binding" /tmp/qx_test_output.txt | head -20

echo ""
echo "Overall test status:"
if grep -q "not ok.*testNoConversionNeeded" /tmp/qx_test_output.txt; then
    echo "❌ TEST FAILED - camelCase conversion IS necessary"
    echo ""
    echo "Error details:"
    grep -A 10 "testNoConversionNeeded" /tmp/qx_test_output.txt
elif grep -q "ok.*testNoConversionNeeded" /tmp/qx_test_output.txt; then
    echo "✓ TEST PASSED - camelCase conversion is NOT necessary!"
    echo ""
    echo "This means we can use the simpler approach without conversion."
else
    echo "⚠ Test status unclear - check full output in /tmp/qx_test_output.txt"
fi

echo ""
echo "================================================================================"
echo "Full test output saved to: /tmp/qx_test_output.txt"
echo "================================================================================"
