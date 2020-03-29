# Contributing to Qooxdoo: bug fixes and extensions

Qooxdoo is an Open Source project with an active developer team amd a
lively community. Anybody can participate and make the framework better.
In the following, we list a few ways in which you can contribute.

## Report and (even better:) fix bugs that you observe

If you notice a malfunction of qooxdoo, and it hasn't been
reported yet, we suggest you create a bug report. See [this
guide on creating helpful bug reports](reporting_bugs.md).

Since the time of the core developers is limited, we would be
very much obliged if you could take the time to try to fix it
yourself and provide a Pull Request to the [Qooxdoo repository on
GitHub](https://github.com/qooxdoo/qooxdoo). If you need help with this, do not
hesitate to ask on [our Gitter chat room](https://gitter.im/qooxdoo/qooxdoo).

## Improve the documentation

Good documentation is vital for a great development experience. Therefore
we welcome your thoughts on what could be improved in this documentation.
Better still, you can improve them right away by clicking on the "Edit
document on GithHub" button which is at the bottom of every page.

If you plan on editing several pages or add new ones, it makes sense
to check out a clone of the [current master branch of the qooxdoo
repository](https://github.com/qooxdoo/qooxdoo) , make the edits in a new branch
of your clone, and create a Pull Request. Please run `./.travis/markdown-lint`
first, this will catch MarkDown-related errors and save you a lot of time. 

## Feature requests amd incubators

If you think Qooxdoo needs improvement in a particular
area, you can [create a feature request issue in the Qooxdoo
repository](https://github.com/qooxdoo/qooxdoo/issues/new?template=Feature_request.md).

If a feature can be realized with relatively little effort, there
is a good chance that the core developers can take care of it.
However, this being an Open Source project, it is likely that the
feature will have to be implemented by you or another Qooxdoo user, using a Pull Request.

If the feature is more complex, there is a good chance that it does not need
to become part of the main framework. In fact, the core developers will only
accept code that they will be able and willing to maintain themselves. For
other cases, a [library package](cli/packages.md) is the way to go. Features
or functionalities that are considered to be essential, such as our [API
Viewer](https://github.com/qooxdoo/qxl.apiviewer) might be accepted as a `qxl`
package after a thorough review. In most cases, we will ask you to maintain
the package yourself and to offer it to the community via our package system.

Features or functionalities which are candidates to become part of the
core library are called "incubators" and live in repositories which are
prefixed by `incubator`. They are usually maintained by the core developers.

## Running framework tests

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
