# Qooxdoo Roadmap

Below is a summary of our plans for v8 and a rough outline of
what we're thinking about for the future; if there is anything
you feel strongly about on either list (or you think that there
is something missing) please feel free to talk to us about it- 
after all, if you don't us what you think, we'll never know!

## v8.0.0

- **Switch to a [semantic release
model](https://github.com/semantic-release/semantic-release)**, which
offers a fully automated release system that is based on formalized commit
messages. It is based on [semantic versioning](https://semver.org/),
which we already use for our package/library dependency management.

- **Standardise JSDOC** - the JSDOC style Qooxdoo has historically used is 
very close to JSDOC standard but not quite the same, we want to switch to
JSDOC and produce a tool to correct the comments in existing code.

- **Weak/Soft References** - add support for Weak, Soft, and On-Demand references, 
with automatic garbage collection of objects that can include destructor and other hooks;

- **Properties**: rewrite the property system so that it is not based on code 
generation (which was ony needed for IE6/7/8) and to add features:
  - Native properties, for example allow `myObj[0]` instead of `getMyObj().getItem(0)`;
  - Allow for getters & setters to be completely redefined, eliminating the need for psuedo-properties to be created by hand;
  - Transparent use of References
  - Better type checking in properties and arrays, with support for parameterised types;
  - Private & protected properties, allowing for member variables to be implemented as properties so that they benefit from type checking and reference support;
  - Immutable and set-once properties

- **Better Arrays, and add Maps** - Add a `qx.data.Map` that works like `qx.data.Array` and add type checking to both

- **Qooxdoo Remote Objects and Persistence**: Another two incubators, these add seamless remote
control of Qooxdoo objects (think "RPC" but for entire objects,
where property changes on the client can be reflected on the
server) and persistently storing objects to disk.  Repos are
[qooxdoo/incubator.qx.io.remote](https://github.com/qooxdoo/incubator.qx.io.remote)
and
[qooxdoo/incubator.qx.io.persistence](https://github.com/qooxdoo/incubator.qx.io.persistence)


## Plans for the future 

Please remember that this list is a rough plan and subject to change.

- **Type Checking** - add automatic type checking based on JSDOC - for example, if a method's JSDOC declares that it has `@param {Integer} myInt` then the compiler can add a type check at the start of the function

- **Virtual Framework** - While there are UI components for lists and trees that support unlimited contents, there should be an infrastructure for very large, sparse, virtual arrays supporting 10's of millions of rows, based on the Soft & On-Demand references in v8.

- **Server framework** - Add a server framework for 100% Javascript, full stack Qooxdoo development, including features for:
   - Database persistence
   - Network I/O with automatically memory managed synchronisation of objects between clients and server
   - CMS with Desktop control panel app
   - CLI
   - Authentication
   - Plugin support
   - Nunjucks-based website theming
   - A replacement for qxWeb for very lightweight HTML UI (currently called "Thin Client")

- **Unified Test, Demo Browser, and Playground** - based on having a server framework, server tests can be integrated, and use the same basic framework required for demo browser and playground

- **qxWeb** Remove qxWeb, which means having an alternative (see server framework and Thin Client)

- **Native Classes** - the Qooxdoo class mechanism offers more features than
standard ES6 classes, but it should be possible to integrate the two - for
example, allow an ES6 `class` to extend from a Qooxdoo class and vice versa.

- **Native Decorators** - Qooxdoo annotations are similar
to Javascript Decorators, and we would like to integrate the
Qooxdoo annotations with the native syntax for decorators

- **Modularisation** - the Qooxdoo framework is part "core" functionality that applies to all platforms, plus modules for Mobile, Desktop, and Node; adding a server framework would add to the namespace and there could be benefits in separating these out into different modules

## Other features

Our issue tracker contains [more features planned for the next
release](https://github.com/qooxdoo/qooxdoo/milestone/66).

