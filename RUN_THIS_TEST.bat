@echo off
REM Simple test script to check if camelCase conversion is necessary
REM Run: RUN_THIS_TEST.bat

echo ================================================================================
echo TEST: Is camelCase conversion technically necessary for issue #10808?
echo ================================================================================
echo.
echo This will run the qooxdoo test suite and check the relevant tests.
echo.

REM First, show the analysis
echo --- Step 1: Theoretical Analysis ---
node test_camelcase_necessity.js
echo.
echo Press any key to continue with actual qooxdoo tests, or Ctrl+C to abort...
pause > nul

REM Run the specific test
echo.
echo --- Step 2: Running qooxdoo Tests ---
echo Running: qx.test.data.controller.Form tests
echo.

REM Run the test and capture output
call npm test -- --class qx.test.data.controller.Form > %TEMP%\qx_test_output.txt 2>&1
type %TEMP%\qx_test_output.txt

echo.
echo ================================================================================
echo TEST RESULTS SUMMARY
echo ================================================================================

REM Check for our specific tests
echo.
echo Looking for test: testNoConversionNeeded
findstr /C:"testNoConversionNeeded" %TEMP%\qx_test_output.txt || echo Test not found or not run

echo.
echo Looking for errors related to properties/getters:
findstr /I "getUsername getEmailAddress property binding" %TEMP%\qx_test_output.txt | findstr /N "^"

echo.
echo Overall test status:
findstr /C:"not ok" %TEMP%\qx_test_output.txt | findstr /C:"testNoConversionNeeded" > nul
if %ERRORLEVEL% EQU 0 (
    echo X TEST FAILED - camelCase conversion IS necessary
    echo.
    echo Error details:
    findstr /A:0C /C:"testNoConversionNeeded" %TEMP%\qx_test_output.txt
) else (
    findstr /C:"ok" %TEMP%\qx_test_output.txt | findstr /C:"testNoConversionNeeded" > nul
    if %ERRORLEVEL% EQU 0 (
        echo √ TEST PASSED - camelCase conversion is NOT necessary!
        echo.
        echo This means we can use the simpler approach without conversion.
    ) else (
        echo ? Test status unclear - check full output in %TEMP%\qx_test_output.txt
    )
)

echo.
echo ================================================================================
echo Full test output saved to: %TEMP%\qx_test_output.txt
echo ================================================================================
echo.
pause
