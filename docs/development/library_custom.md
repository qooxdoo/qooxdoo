# Custom Libraries

Once your application has grown beyond a certain size, or when you start a
second application that could re-use some of the code of the first, you start
thinking about factoring code out into separately manageable units. This is when
you create dedicated libraries. This is also the precondition for
[publishing your code in a package](cli/packages.md#publish-new-versions-of-packages)
for others to use.

In Qooxdoo all code is organized in [libraries](code_organisation.md). Also, the
code tree that holds your application's main class is, conceptually, a library.
So even in the simplest skeleton you are already working **in** a library (the
skeleton), **with** a library (the framework classes). Creating and using
further libraries is only a repetition of that.

## Creating a Custom Library

Run `npx qx create --type=X`, X being any of `desktop`, `mobile`, `package`, or
`server`, according to the type of library that you want to create. Usually,
you will choose "desktop" (if you omit the type, this is the default). If you
have existing code that you want to put into the library, just move the files
over to their new location under the `source/class/(namespace)` path. Don't
forget to adapt the class name as given in the call to e.g. `qx.Class.define`.
The name passed in this call has to match the path suffix of the class file,
like `"(namespace).Foo"`.

If your library is intended to be included in other applications, no
`Application.js` file is needed. However, we suggest that you include a small
demo application in your library which can be compiled and run standalone, in
order to showcase what the library does and to give an example that others can
build on when they use the library.

## Using the Library

In an existing application, to use your new library you have to do two things.

### Make it known to the Compiler

You need to make the new library known to the existing application, so it knows
where to look for resources. You can do this in two ways:

1.  Add the path to the directory containing the library manually to the
    `libraries` array of the [`compile.json`](compiler/configuration/compile.md)
    configuration file of the application in which you want to use the library.
    This is good enough for local development, but is not ideal if you plan on
    using the code in several environments or to share the code with others.

2.  The more scalable solution is to treat the library as a
    [package](cli/packages.md) and to use the CLI to add it to the
    [`qx-lock.json`](cli/packages.md#lockfile-qx-lockjson) file.

```
-   Create a new GitHub repo locally and on GitHub and add a "local"
    package by executing `npx qx pkg install --from-path path/to/dir`.

-   Once your code is stable enough, push your code to GitHub and
    [publish the first version of the package](cli/packages.md#publish-new-versions-of-packages).

-   Before you publish the first version of the **application** that uses
    the library, replace the local package with the published one by
    executing `npx qx pkg install <yourGitHubName>/<libraryRepoName>`. You
    might need to run `npx qx pkg update --search` first to get the latest
    version of your library.
```

### Use it in your Code

Now all you have to do is just to reference resources from the new library, e.g.
a library class, in your code:

```javascript
const foo = new mylib.Foo();
```

## Sharing a Namespace

You can share a common namespace prefix across libraries. This is especially
interesting if you split up a large application into multiple libraries that can
be developed independently. But it is important that every library has its own,
individual namespace.

Let's illustrate that with an example. Imagine you have been developing your
application to quite some size. You have already organized the classes in
subdirectories of the namespace root, e.g. like this:

```text
source/class/myapp
   /model
     Foo.js
   /view
     Bar.js
   Application.js
```

Now you want to factor out the `model` and `view` components into their own
libraries. In a suitable path you create two new skeletons:

```bash
$ npx qx create myapp.model
$ npx qx create myapp.view
```

Now you can move `Foo.js` to the first library, into its
`source/class/myapp/model/` path, and `Bar.js` to the second, into its
`source/class/myapp/view/` path. So together with your initial application you
now have three libraries, with namespaces `myapp`, `myapp.model` and
`myapp.view`, respectively. The namespaces are all distinct, but share the
common prefix `myapp`.

Mind that in the original situation `Foo`'s class id was `myapp.model.Foo`. This
hasn't changed! The class id is the same in the new library, so you don't have
to edit the class itself (i.e. its call to `qx.Class.define`), nor do you have
to adapt any location referencing `Foo` in other code (like in
`"const foo = new myapp.model.Foo();"`). But strictly speaking the class was
formerly allocated in a namespace `myapp` with a path of `model/Foo.js`, while
now it is allocated in a namespace `myapp.model` with a path of `Foo.js`.
