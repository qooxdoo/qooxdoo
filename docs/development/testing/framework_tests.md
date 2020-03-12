# Run tests on the core framework

If you want to add to the qooxdoo framework (i.e. the `qx` namespace), or alter 
its behavior somehow (including bug fixes), we ask you to provide a unit test that
expresses in code how the new feature or the changed behavior is expected to work.
This proves that the PR work as intended and also helps to prevent regressions. 

After you have added your test classes/methods, navigate to folder containing your
fork, and execute the following steps:

```bash
npm install --no-save --no-package-lock @qooxdoo/compiler 
npx qx lint <path(s) to the file(s) you changed/added, including the test class>
npx qx test --class=<the class you added your test cases to> 
```

If all tests pass, your code is ready for review!
