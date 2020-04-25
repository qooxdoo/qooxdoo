# Getting Started

Welcome to Qooxdoo! Qooxdoo is a one-stop JavaScript framework that helps you
write single page web applications in pure JavaScript without touching HTML or
CSS.

Qooxdoo applications are written in JavaScript. The Qooxdoo framework is a
large, well structured class library composed of both graphical and non
graphical elements you can use to build your applications. The following guide
will show how this works in practice.

If you have worked with Qooxdoo and its Python-based tool chain before,
please also have a look at the [our guide to migrate your applications
to the new NodeJS-based tooling](development/compiler/migration.md).

The following introduction to Qooxdoo takes less than 10 minutes to complete.

## Setup

Before you can load a Qooxdoo application in your browser, it has to be
compiled. The compilation step takes includes all of the Qooxdoo classes into
your application that were referenced, either directly or indirectly, from your
code.

The Qooxdoo compiler is called `qx` and runs in NodeJS. Qooxdoo requires
NodeJS version 8 or higher to work.

To check your version, run `node -v` in a terminal/console window.

If you don't have NodeJS installed, or your version is too old, either go to
[nodejs.org](https://nodejs.org) or use the [nvm
system](https://github.com/nvm-sh/nvm) to get up and running.

NodeJS comes with its own package manager called npm which you can now use to
install the Qooxdoo framework and the Qooxdoo compiler. There are two ways to
setup Qooxdoo. You can install it in the same directory as your Qooxdoo project
or you can install it globally.

### Global installation

The following command line installs the Qooxdoo compiler so that it becomes
available anywhere via your path settings.

```bash
$ npm install -g @qooxdoo/compiler
```

To start the Qooxdoo compiler, type

```bash
$ qx
```

### Local Installation

Both the compiler and the Qooxdoo framework are evolving, so if you are writing
a large application which you may have to maintain for months and years to come,
you will probably be better off installing Qooxdoo together with your application
code.

```bash
$ mkdir myapp
$ cd myapp
$ npm init
$ npm install --save-dev @qooxdoo/compiler
$ ls
node_modules package-lock.json package.json
```

To start the Qooxdoo compiler type

```bash
$ npx qx
```

Looking at the myapp directory you find two files: `package.json` and
`package-lock.json` as well as a folder, `node_modules`. Add the `package.json`
and `package-lock.json` to your project files. This will allow you later to
re-install the exact same version of the compiler and of the framework by typing
`npm i` without the need to keep a copy of the `node_modules` folder around.

!> Save some keystrokes by setting an alias for `qx` by setting `alias qx='npx qx'`!

## The First Application

The Qooxdoo compiler is not only a compiler. It can also provide little template
apps and it can act as a webserver so that you can use your browser to access
the application. To get started, lets create a little application and then have
a look at its code. The `create` command in the Qooxdoo compiler lets you
quickly produce a simple skeleton app. The following command line assumes that
you have setup a local copy of the Qooxdoo compiler in the myapp subdirectory.

```bash
$ cd myapp
$ npx qx create myapp --type desktop --noninteractive --out=.
$ npx qx serve
```

The `serve` command will compile the application and then also make it available
on localhost. Use your web browser to open `http://localhost:8080`.

## The Qooxdoo Way

An application which displays a single button? Ok, not all that impressive. A
few lines of HTML and CSS could do that too. So how does Qooxdoo do it? Open
`source/class/myapp/Application.js` and have a look at the application code.
Here is a stripped down version of the code with just the essential lines:

```javascript
qx.Class.define("myapp.Application", {
  extend : qx.application.Standalone,
  members : {
    main : function() {
      this.base(arguments); // call the super class
      let button1 = new qx.ui.form.Button("Click me");
      let doc = this.getRoot();
      doc.add(button1, {left: 100, top: 50});
      button1.addListener("execute", function() {
        alert("Hello World!");
      });
    }
  }
});
```

If you have worked with JavaScript before, you may find that it looks like
JavaScript but also different from most JavaScript you have seen to date. This
is because Qooxdoo introduces both a rich set of widgets as well as class based
object orientation into the language. There is quite a lot of documentation on
these topics in the next few sections.

And yes, this is the complete program, there is neither HTML nor CSS. The
Qooxdoo framework creates all that on the fly as the program is started. There
is also a powerful theming system which lets you write your own themes to give
your application a distinctive look.

Try editing the file a bit. You will notice that the server detects your
modifications and recompiles the application automatically.

If you look at the files that are created by the compiler (in the `compiled/` directory), 
you might notice that the resulting code is quite large in size. This is because even
the tiniest application makes use of Qooxdoo's core classes, and the compiler produces
a large number of artefacts that are needed for quick recompilation, but not for the
functioning of your app. What you will finally deploy is much smaller (in our case, it is
in the `compiled/source/myapp` folder). As your app grows, the size of that folder will grow 
linearly with your new code (and with whatever additional features of Qooxdoo 
your code uses). And in fact, what you are seeing here is what's called the "source version".
When you instead generate the "build" version, all of the source files are combined into a
small number of files, so there there are few to be copied to your final deployment server.
(You'll read more about generating the "build" version as you continue through these documents.)

## Reading on

With the first mini application up and running you are now ready for bigger
things. You can either start reading the theory parts of the
[documentation](contents.md) where we explore in detail how the Qooxdoo class
system works or you can try some more hands-on by working through the
[tutorial](tutorial/).

If you ever get stuck, feel free to open the chat window by pressing the button
in the bottom right hand corner of the documentation.
