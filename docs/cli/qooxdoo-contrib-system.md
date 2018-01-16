### qooxdoo-contrib system

qooxdoo's "plugin architecture" is called "qooxdoo-contrib"  (short for "contributions"). It does not only allow to extend one's own application with useful functionality such as file uploads, dialog widgets, vector graphics and much more, qooxdoo-contrib will also host components that have previously shipped with the framework, such as the API viewer or the playground. The CLI supports the use, creation and mainenance of contributions with the `qx contrib` subcommands. 

```
qx contrib <command> [options]

Commands:
  install [repository]  installs the latest compatible release of a contrib
                        library (as per Manifest.json). Use "-r <release tag>"
                        to install a particular release.
  list [repository]     if no repository name is given, lists all available
                        contribs that are compatible with the project's qooxdoo
                        version ("--all" lists incompatible ones as well).
                        Otherwise, list all compatible contrib libraries.
  publish               publishes a new release of the contrib on GitHub.
                        Requires a GitHub access token. By default, makes a
                        patch release.
  remove [repository]   removes a contrib library from the configuration.
  update [repository]   updates information on contrib libraries from github.
                        Has to be called before the other commands.

```

Please see the detailed documentation [here](contrib.md).
