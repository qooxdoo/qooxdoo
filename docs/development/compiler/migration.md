# Migrate your application from Qooxdoo 5.0 to Qooxdoo 6.0 toolchain

Previous versions of Qooxdoo used a Python v2 based tool called the Generator
(`./generate.py`); the generator is supported in Qooxdoo v6 but is deprecated
and will be removed completely for Qooxdoo v7.

The compiler is a full equivalent as far as compiling is concerned, and much
faster and fuller featured at that; however the generator included features for
building and running test suites, creating API documentation, building
distributions, etc. These features have not been replicated because there are
much better (Javascript) tools available, and you also have the option to
customise the build process
[using an API in compile.js](configuration/compile.md).

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
