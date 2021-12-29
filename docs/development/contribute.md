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

## Coding the framework

Since v7, we have integrated the compiler into the framework
repo at GitHub which simplifies the steps needed to get started.

If you're going to contribute code, documentation updates, or any kind
of changes to Qooxdoo, you need to submit those changes as Pull Requests
("PRs") - there's lots of documentation on the web and on GitHub on what
these are if you're not familiar with them already.  The key thing is that
you would use GitHub to fork the Qooxdoo repo into your own user account
at GitHub and then clone that onto your workstation to start development.
This means that you would be cloning a repo called something like
"git@github.com:myusernamegoeshere/qooxdoo.git" - however, in the example
below we're going to use the main Qooxdoo repo, just to show you how to get
started.  It's fine to do this on your computer, just be aware that if you
do not use your own repo name, you will not be able to submit PRs to us.

Something to think about quickly before you start is that the framework
and the compiler are both compiled with the compiler - yes, that is a
recursive dependency!  This practice is sometimes called [Eating your own dog
food](https://en.wikipedia.org/wiki/Eating_your_own_dog_food), and is something
that we do to allow us to use the Qooxdoo framework inside the compiler
and also gives us an extra chance to test the compiler before releasing it.

So if you don't have a compiler, how do you compile the compiler?
Well, there is a special bootstrap process that will take
care of this for you; these commands will get you started:

```
$ git clone https://github.com/qooxdoo/qooxdoo.git
$ cd qooxdoo
$ npm ci
$ ./bootstrap-compiler
```

> Note that this process creates an environment that is specific to the node
> version. If you upgrade your node version, you need to recompile the compiler
> after deleting downloaded dependencies with 
> ```
> $ rm -rf ./node_modules
> $ rm -rf ./known-good/node_modules
> $ npm ci
> $ ./bootstrap-compiler
> ```

Once that's completed, you will have a bootstrap compiler in
`./bootstrap/qx` and two versions of the compiler that were compiled
using the bootstrap compiler - one compiled as a `source` target (in
`./bin/source/qx`) and one compiled as a `build` target (in `./bin/build/qx`).

Next, add `./bin/source/qx` into your PATH, either as a symlink or
by modifying the PATH environment variable; your goal here is to
make sure that any of the test scripts can run your new compiler. Alternatively,
you can create a shortcut in the repository root with `ln -s ./bin/source/qx .`

If you are editing the compiler code, you'll need to recompile it in order
to test the new compiled code; you can do this at any time with this command:

```
$ ./bootstrap/qx compile --watch
```

You can leave that command running and it will constantly recompile the
`source` target of the compiler in `./bin/source/qx` (the bootstrap compiler
is a full version of the compiler, so you can use the `--target=build`
command line option if you would prefer, but if you do, just remember to
put the `./bin/build/qx` on the PATH instead of the `./bin/source/qx`).

By default, the compiler compiles all the applications:

- **compiler**: The compiler CLI that is accessible via `./bin/(source|build)/qx`
- **compilerLibrary**: a node module containing a subset of the qooxdoo framework.
  It includes mainly the `qx.tool` namespace, but also other classes which work 
  on the server. It can be imported via
  `const qx = require('./compiled/node/(source|build)/compilerLibrary)`
- **qx_server**: The ["qooxdoo" node module](https://www.npmjs.com/package/qooxdoo) 
  which provides Qooxdoo's OO-features to NodeJS and which can be imported via 
  `const qx = require('./compiled/node/(source|build)/qx_server)`

If you are only working on one of the application, i.e. just on the compiler, 
you can speed this up by adding `--app-name=compiler` so that only the compiler
is compiled. For a list of classes which are compiled into each application,
see the [`compile.json` file](https://github.com/qooxdoo/qooxdoo/blob/master/compile.json#L67)
in the repository root. 

If you are only working on the framework, then you do not need to constantly
compile the compiler with the bootstrap, unless you want to check the impact
that your changes have on the compiler.  IE if you are developing browser-based
changes, then you just need to use the `./bin/source/qx` in your test app.

## Running framework tests

Before you submit a PR, you should check that your code passes the
lint tests by running `npm test` in the framework repo directory;
this will automatically run lint against the codebase and do compiler
and framework tests. `npm test` will run `bootstrap-compiler`
automatically. 

Running the whole test suite takes quite a while.

If you want to test the framework separatly run:

```bash
cd test/framework
../../bin/source/qx test
```

For the compiler and CLI tests, run:
```bash
cd test/tool
../../bin/source/qx test
```

Requirement for this is that `bootstrap-compiler` has run once.

## Writing new tests

If you add a new feature, we ask you to provide a unit test that
expresses in code how the new feature is expected to work. This proves
that the PR work as intended and also helps to prevent regressions.

### Framework tests

Framework tests are written as normal qooxdoo classes and
placed in the `qx.test` namespace. For now, please refer
to the code in that namespace for examples on how to write
a test. More detailed documentation will be added later.

### Tooling-related tests

Tests for the compiler or the CLI are NodeJS scripts in the
`test/tool/integrationtest` subdirectory. They use vanilla NodeJs
Javascript or the "tape" testing framework to produce output that conforms
to the [Test-Anything Protocol (TAP)](https://testanything.org/). 
