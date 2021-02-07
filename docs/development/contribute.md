# Contributing to Qooxdoo: bug fixes and extensions

Qooxdoo is an Open Source project with an active developer team amd a lively
community. Anybody can participate and make the framework better. In the
following, we list a few ways in which you can contribute.

## Report and (even better:) fix bugs that you observe

If you notice a malfunction of Qooxdoo, and it hasn't been reported yet, we
suggest you create a [bug report](https://github.com/qooxdoo/qooxdoo/issues/new?assignees=&labels=&template=Bug_report.md).

Since the time of the core developers is limited, we would be very much obliged
if you could take the time to try to fix it yourself and provide a Pull Request
to the [Qooxdoo repository on GitHub](https://github.com/qooxdoo/qooxdoo) . If
you need help with this, do not hesitate to ask on
[our Gitter chat room](https://gitter.im/qooxdoo/qooxdoo).

## Improve the documentation

Good documentation is vital for a great development experience. Therefore we
welcome your thoughts on what could be improved in this documentation. Better
still, you can improve them right away by clicking on the "Edit document on
GithHub" button which is at the bottom of every page. If you want to change more
than one page or add new pages, please fork the [documentation repository](https://qooxdoo.org/documentation)
and create a pull request with your changes.

## Feature requests amd incubators

If you think Qooxdoo needs improvement in a particular area, you can  
[create a feature request issue in the Qooxdoo repository](https://github.com/qooxdoo/qooxdoo/issues/new?template=Feature_request.md)
.

If a feature can be realized with relatively little effort, there is a good
chance that the core developers can take care of it. However, this being an Open
Source project, it is likely that the feature will have to be implemented by you
or another Qooxdoo user, using a Pull Request.

If the feature is more complex, there is a good chance that it does not need to
become part of the main framework. In fact, the core developers will only accept
code that they will be able and willing to maintain themselves. For other cases,
a [library package](cli/packages.md) is the way to go. Features or
functionalities that are considered to be essential, such as our
[API Viewer](https://github.com/qooxdoo/qxl.apiviewer) might be accepted as a
`qxl` package after a thorough review. In most cases, we will ask you to
maintain the package yourself and to offer it to the community via our package
system.

Features or functionalities which are candidates to become part of the core
library are called "incubators" and live in repositories which are prefixed by
`incubator`. They are usually maintained by the core developers.

## Checking out the framework repository for development

If you want to work on the framework itself, create and checkout a fork of the 
[repository](https://github.com/qooxdoo/qooxdoo). In order for the compiler to
pick up the forked framework code instead of the npm version, execute 

```bash
npx qx config set qx.library <path to the forked repo>/framework
```

## Running framework tests

If you want to add to the Qooxdoo framework (i.e. the `qx` namespace), or alter
its behavior somehow (including bug fixes), we ask you to provide a unit test
that expresses in code how the new feature or the changed behavior is expected
to work. This proves that the PR work as intended and also helps to prevent
regressions.

After you have added your test classes/methods, navigate to folder containing
your fork, and execute the following steps:

```bash
cd test/framework
npm install --no-save --no-package-lock @qooxdoo/compiler
npx qx lint <path(s) to the file(s) you changed/added, including the test class>
npx qx test --class=<the class you added your test cases to>
```

If all tests pass, your code is ready for review!
