# Testing

Qooxdoo provides an integrated testing infrastructure
with several strategies to test your code:

1) A [Unit Testing](unit_testing.md) framework (based on the Sinon
library), with a [testrunner](https://github.com/qooxdoo/qxl.testtapper)
which runs as a separate Qooxdoo application alongside your own app.
The runner can be opened in a browser or is executed from the command
line using `qx test` (which uses a headless browser to run the tests).

2) Support for [Automated GUI testing](gui_testing.md) using tools like
[Puppeteer](https://pptr.dev/), [PlayWright](https://playwright.dev/),
[TestCafé](https://devexpress.github.io/testcafe/), etc.  
 
3) Support for testing Qooxdoo server applications,
which works like [Automated GUI testing](gui_testing.md) except that you do not 
need the headless browser libraries. 

