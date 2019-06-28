# Server Requirements

qooxdoo server is a basic component that runs in many different contexts and
environments, as it has very little dependencies to the underlying runtime. For
use in command-line tools and programs you will need a corresponding JavaScript
interpreter like Node.js or Mozilla Rhino. For use in HTML5 Web Workers you will
need a browser that supports this technology.

# Installation via NPM

```bash
$ npm install @qooxdoo/framework
```

This will install the npm package into your current folder from where you can
include it easily into your applications.

In both cases, to verify the installation use your runtime's loading primitive
to include it in a program, e.g. for Node:

    var qx = require('@qooxdoo/framework')

