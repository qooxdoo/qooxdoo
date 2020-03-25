# Server Requirements

Qooxdoo server is a basic component that runs in many different contexts
and environments, as it has very few dependencies to the underlying
runtime. For use in command-line tools and programs you will need a
corresponding JavaScript interpreter like NodeJS. It is also possible to use
Qooxdoo in HTML5 Web Workers.

# Installation via NPM

```bash
$ npm install @qooxdoo/framework
```

This will install the npm package into your current folder from where you can
include it easily into your applications.

In both cases, to verify the installation use your runtime's loading primitive
to include it in a program, e.g. for Node:

    var qx = require('@qooxdoo/framework')

