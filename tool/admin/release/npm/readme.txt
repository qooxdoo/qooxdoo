Publishing qxoo to npm
----------------------

This file explains how to publish the qxoo package to npm.

* make sure node [1] and npm [2] is installed
* build the new qxoo script
  * run "./generate.px qxoo-build" in the framework folder
  * copy the script in "framework/build/script/qx-oo.js" to the build folder ("tool/admin/release/npm/build")
* link the npm package (run npm link in the build folder)
* update the version number in the package.json manifest
* go to the test folder ("tool/admin/release/npm/test")
* install the npm package with "npm install ../build/"
* run the test (node test.js) --> prints "ok"
* change to the build folder again ("tool/admin/release/npm/build")
* run "npm publish" to push the package to the server (needs the qooxdoo user account)
* Check if it worked in the online registry [3]


More details can be found in the npm documentation [4].

Links
-----

[1] http://nodejs.org/
[2] http://npmjs.org/
[3] http://search.npmjs.org/
[4] https://github.com/isaacs/npm/blob/master/doc/developers.md 