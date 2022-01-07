# Migrate your legacy applications 

Up to version 6.0.0, Qooxdoo used/supported a Python v2 based tool called the
Generator (`./generate.py`). Support for the Generator has been removed in
v7.0.0 and been replaced by a javascript-based compiler. The compiler is a
full equivalent as far as compiling is concerned, and much faster and fuller
featured at that; however the generator included features for building and
running test suites, creating API documentation, building distributions,
etc. These features have not been replicated because there are much better
(Javascript) tools available, and you also have the option to customise
the build process [using an API in compile.js](configuration/compile.md).

Since v6.0.0, user code can be migrated to the next breaking versions with `qx
migrate`. However, the upgrade has to be done by hand for pre-v6 applications.

Here is how to migrate your Generator-based application to the Compiler:

- create new desktop or mobile application with `qx create oldName` using the
  information provided in old/Manifest.json
- replace some folders in the new application with the counterparts of the old
  application
  - old/source/class -> new/source/class
  - old/source/resource -> new/source/resource
  - old/source/translation -> new/source/translation
- move old/source/index.html to new/source/boot/index.html
- add this into new/source/boot/index.html just before `</head>`

```html
${preBootJs}
<script type="text/javascript" src="${appPath}boot.js"></script>
```

- find out which libraries are used in the old application. For this have a look
  into `config.json` libraries section. Add all libraries found here with

```bash
qx pkg update
qx pkg list
qx pkg install library
```

Hopefully all needed libraries are converted.

- find used theme in old/config.json and set this in new/compile.json
- run `qx compile` and fix errors
- run `qx serve` to run build in webserver and test it in your browser
  `http://localhost:8080/`

## ES6 Upgrades
The `qx es6ify` command is a tool that aims to help you upgrade your ES5 syntax to ES6 - it 
can't do it as perfectly as you could do it by hand, but it can make a few simple changes to
your code base that can make a big difference to readability.  

Please [check out the documentation](../cli/commands.md#ES6Ify)

