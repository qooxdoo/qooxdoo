Here, the deliverables for the qooxdoo component 'server' are being built.
Generator jobs:

build:
Creates the deliverable librarie(s) in script/. Prereq. for other jobs.

test:
The test job creates a basic testrunner script which depends on the qx-oo
library (expected in the script/ folder).
You therefore have to run 'generate.py build' ahead of running the test scripts.
Then:
  cd test
  node node.js
  rhino rhino.js

npm-package-copy:
Copies the relevant files under npm/build, from where they can be published.
Depends on 'build' having run.

npm-package-test:
Tests the structure under npm/build, to be sure it's a valid npm package before
publishing. Depends on 'npm-package-copy' having run. (This creates
test/npm/node_modules).

npm-package-publish:
Publishes the qooxdoo npm module to npmjs.org. Depends on 'npm-package-copy'
having run, and a valid npm user account.
