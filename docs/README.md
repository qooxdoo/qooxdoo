# Getting Started

Welcome to Qooxdoo! Qooxdoo is a one-stop javascript framework that helps you
write single page web applications in pure JavaScript without touching HTML or
CSS.

Qooxdoo applications are written in javascript. The qooxdoo framework is a
large, well structured class library composed from both graphical and non
graphical element you can use to build your applications. The following guide
will show how this works in practice.

This guide takes less than 10 minutes to complete.

## Setup

Before you can load a qooxdoo application in your browser, it has to be
compiled. The compilation step takes care including all the qooxdoo classes into
your application that were referenced either directly or indirectly from your
code.

The qooxdoo compiler is called `qx` and runs in nodes.js. Qooxdoo requires
Node.js version 8.x or 10.x. to work.

To check your version, run `node -v` in a terminal/console window.

If you don't have node installed, or your version is too old, either go to
[nodejs.org](https://nodejs.org) or use the [nvm
system](https://github.com/nvm-sh/nvm) to get up and running.

Node comes with its own package manager called npm which you can now use to
install the qooxdoo framework and the qooxdoo compiler. There are two ways to
setup qooxdoo. You can install it in the same directory as your qooxdoo project
or you can install it globally.

### Global installation

The following command line installs the qooxdoo compiler so that it becomes
available via your path settings.

```bash
$ npm install -g @qooxdoo/compiler @qooxdoo/framework
```

To start the qooxdoo compiler type

```bash
$ qx
```

### Local Installation

Both the compiler and the qooxdoo framework are evolving, so if you are writing
a large application which you may have to maintain for months and years to come,
you will probably be better of to install qooxdoo together with the application
code.

```bash
$ mkdir myapp
$ cd myapp
$ npm init
$ npm install --save-dev @qooxdoo/compiler @qooxdoo/framework
$ ls
node_modules      package-lock.json package.json
```

To start the qooxdoo compiler type

```bash
$ npx qx
```

Looking at the myapp directory you find two files: `package.json` and
`package-lock.json` as well as a folder `node_modules`. Add the `package.json`
and `package-lock.json` to your project files. This will allow you later to
re-install the exact same version of the compiler and of the framework by typing
`npm i` without the need to keep a copy of the `node_modules` folder around.

!> Save some keystrokes by setting an alias for `qx` by setting `alias qx='npx qx'`!

## The First Application

The qooxdoo compiler is not only a compiler. It can also provide little template
apps and it can act as a webserver so that you can use your browser to access
the application. To get started, lets create a little application and then have
a look at its code. The `create` command in the qooxdoo compiler lets you
quickly produce a simple skeleton app. The following command line assumes that
you have setup a local copy of the qooxdoo compiler in the myapp subdirectory.

```bash
$ cd myapp
$ npx qx create myapp --type desktop --noninteractive --out=.
$ npx qx serve
```

The `serve` command will compile the application and then also make it available
on localhost. Use your web browser to open `http://localhost:8080`.

## The Qooxdoo Way

An application which displays a single button. Ok, not all that impressive. A
few lines of HTML and CSS could do that too. So how does qooxdoo do it? Open
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

If you have worked with javascript before you may find that it looks like
javascript but also different from most javascript you have seen to date. This
is because qooxdoo introduces both a rich set of widgets as well as class based
object orientation into the language. There is quote a lot of documentation on
these toppics in the next few sections.

And yes, this is the complete program, there is neither HTML nor CSS. The
qooxdoo framework creates all that on the fly as the program is started. There
is also a powerful theming system which lets you write your own themes to give
your application a distinctive look.

Try editing the file a bit. You will notice that the server detects your
modifications and recompiles the application automatically.

## Reading on

With the first mini application up and running you are now ready for bigger
things. You can either start reading the theory parts of the documentation where
we explore in detail how the qooxdoo class system works or you can try some more
hands-on by working through the tutorial.

If you ever get stuck, feel free to open the chat window by pressing the button
in the bottom right hand corner of the documentation.
