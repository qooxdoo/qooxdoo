# Contribute to & Support Qooxdoo

You can help to make Qooxdoo better by [contributing code or documentation](development/contribute.md)
or by supporting the project financially:

- Donate via [Liberapay](https://liberapay.com/qooxdoo.org/donate).

## Coding the Framework

Since the release of 6.0.0, we have integrated the compiler into the
framework repo at GitHub which simplifies the steps needed to get started.

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
$ ./bootstrap/qx config set qx.library `pwd`
```

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

By default, the compiler compiles all the applications, but if you
are only working on the compiler you can speed this up by adding
`--app-name=compiler` so that only the compiler is compiled.

If you are only working on the framework, then you do not need to constantly
compile the compiler with the bootstrap, unless you want to check the impact
that your changes have on the compiler.  IE if you are developing browser-based
changes, then you just need to use the `./bin/source/qx` in your test app.


## Testing

Before you submit a PR, you should check that your code passes
the lint tests by running `npm test` in the framework repo
directory; this will automatically run lint against the codebase and do compiler
and framework tests.
`npm test` will run `bootstrap-compiler` automatically.
                              
If you want to test the framework seperatly run:
```bash
cd test/framework
../../bin/source/qx test
```

For the compiler run:
```bash
cd test/cli
../../bin/source/qx test
```

Requirement for this is that `bootstrap-compiler` has run once.



                                                                                                                                          
