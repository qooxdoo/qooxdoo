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

- **Qooxdoo Remote Objects and Persistence**: Another two incubators, these add seamless remote
control of Qooxdoo objects (think "RPC" but for entire objects,
where property changes on the client can be reflected on the
server) and persistently storing objects to disk.  Repos are
[qooxdoo/incubator.qx.io.remote](https://github.com/qooxdoo/incubator.qx.io.remote)
and
[qooxdoo/incubator.qx.io.persistence](https://github.com/qooxdoo/incubator.qx.io.persistence)


## Plans for the future 

Please remember that this list is a rough plan and subject to change.

- **Native properties** - currently, Qooxdoo properties have to be
accessed via `.getPropertyValue()`, we would like to change this to
be more javascript and have the same functionality also available via
`.propertyValue`.  This also means mapping `qx.data.Array` accessors,
so that `myArr.getItem(0)` can be rewritten as just `myArr[0]`

- **Native Classes** - the Qooxdoo class mechanism offers more features than
standard ES6 classes, but it should be possible to integrate the two - for
example, allow an ES6 `class` to extend from a Qooxdoo class and vice versa.

- **Native Decorators** - Qooxdoo annotations are similar
to Javascript Decorators, and we would like to integrate the
Qooxdoo annotations with the native syntax for decorators


## Other features

Our issue tracker contains [more features planned for the next
release](https://github.com/qooxdoo/qooxdoo/milestone/66).

