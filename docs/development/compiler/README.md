# The Qooxdoo Compiler and Command Line Toolchain

Starting with v6, Qooxdoo includes a brand new command line interface called `qx` which automates many of the 
routine tasks involved in creating and managing your application code, including compiling for development or 
release onto production servers.

Using `qx` you quickly and easily perform daily routine tasks, such as:
* Compile your code!
* Serve your code via a built in web server
* Install packages written by yourself or others
* Create skeleton applications

For many people, the easiest way to get started with Qooxdoo is to actually use *just* the `qx` command, rather than
try and download Qooxdoo itself - once you have installed the `qx` command, it knows how to download, install, and
manage Qooxdoo.  

But it's not just Qooxdoo that it can download - if someone writes a reusable "package" (which is 
just a library of code and resources), `qx` can find it on GitHub and then will be able to download and install that
package too.  This is really useful because packages can have dependencies on other packages, so letting `qx` do
the hard work of finding and downloading things isn't just useful for getting started - it can be a crucial tool
in getting reliable compilation, whether that means getting it working for everyone in your team, or just making 
sure that your project is up to date with the latest version of all it's dependencies.

## Installation / Getting Started

The `qx` command is easily installed with `npm` and as it is written in 100% Javascript it is entirely cross 
platform; the only requirement is that you use a currently supported version of NodeJs itself (well - we do *try* to 
support older versions of NodeJs, but it's not guaranteed).

For many people, the easiest way to do this is to install `qx` globally - installing globally is a great solution
if you just want the easy simplicity for getting started with Qooxdoo, or knowing that all your projects are always
on the latest version of Qooxdoo and the compiler.

To install globally, all you need to do is this:

```
npm i -g @qooxdoo/compiler
```

### Creating your first application

Let's create a "skeleton" application and then compile it:

```
qx create myFirstApp --noninteractive
cd myFirstApp
qx compile
```

Now use your favourite web browser to open the `compiled/source/index.html` - that's it, your first
Qooxdoo application is working!

(BTW did you see that first command had `--noninteractive`?  That just means to take the defaults; if you leave it off, then
`qx` will just ask you a series of questions about how you want your new application to look like.  Try it :) ) 

`qx compile` incorporates Babel and will transpile your code from the latest ES6 (or ES7 etc) into ES5 that works across all web 
browsers - this is part of Qooxdoo's commitment to make development truely cross platform and entirely modern.  When it transpiles
your code, the compiler also optimises it so that only the code that is actually needed is loaded by the web browser - you never 
need to use webpack or uglify etc, because Qooxdoo has it all built in.

The only "gotcha" here would be that `qx compile` would have to be run *every single time* that you edit a source file; this would
be a hassle, so there is the fully automatic version that watches for changes; just run this in a spare terminal window:

```
qx compile --watch
```

One more really useful tool is that `qx` includes its own webserver, which also does automatic compilation.  If you're running 
`qx compile` in a terminal window, hit `Ctrl-C` to stop it and then try this instead:

```
qx serve
```

Wait for the message "Web server started, please browse to http://localhost:8080" to appear and then browse to 
http://localhost:8080 - you'll see the same app you saw earlier, just served from HTTP instead of a file.


### Adding packages
One of the great things about having tools to manage your app, is that adding new packages is trivial - even if there is a whole
set of dependencies, the `qx package install` command will simply do it for you.   

Here's an example where we add a couple of packages into your project, and then serve them up:

```
qx package install qooxdoo/qxl.apiviewer
qx package install qooxdoo/qxl.widgetbrowser
qx serve --show-startpage
```

Note how this time we added `--show-startpage`?  What that means is that when you browse to http://localhost:8080 this time
you will see a "start page" where you can choose which application you want to run.  

You have two extra applications now - one is the API viewer and the other the widget browser, and they are all compiled
automatically.  OK, the widgetbrowser may not be something you will find useful on a daily basis, but the API viewer
application is reading your code and turning it into the same easily browsable and searchable API documentation that Qooxdoo
uses.  


### Installing Locally
Sometimes it's more important to stick to a specific version of tools so that you can guarantee repeatable behaviour -
perhaps you work in a team and it's important that you are all using the exact same version of the compiler so that
you're all guaranteed to get exactly the same results as one another; or perhaps you just want to make sure that if
your customer asks you to make a minor change a year after release, that you don't end up on some massive "upgrade"
road trip.

In situations like this, the solution is to install a private version of `@qooxdoo/compiler` inside your project; from 
then on, all you have to do is to use `npx` to execute `qx` commands.

```
mkdir myFirstApp
cd myFirstApp
npm init             # answer npm's questions
npm i -g @qooxdoo/compiler
npx qx create myFirstApp --noninteractive --out=.
npx qx compile
```


## Generator

Previous versions of Qooxdoo used a Python v2 based tool called the Generator (`./generate.py`); the generator is
supported in Qooxdoo v6 but is deprecated and will be removed completely for Qooxdoo v7.  

The compiler is a full equivalent as far as compiling is concerned, and much faster and fuller featured at that;
however the generator included features for building and running test suites, creating API documentation, building 
distributions, etc.  These features have not been replicated because there are much better (Javascript) tools 
available, and you also have the option to customise the build process [using an API in compile.js](configuration/compile.md). 


   