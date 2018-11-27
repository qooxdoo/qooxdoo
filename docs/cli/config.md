# Persistent Configuration

Some commands require (or benefit from) having persistent configuration; this is accessed via the `qx config` command and the data is stored in a directory called `.qooxdoo` inside your home directory.

The `qx config` supports the following:

```
qx config <key> [value]

Commands:
  set <key> <value>    Sets a configuration value
  get <key> [options]  Gets a configuration value
  delete <key>         Deletes a configuration value
  list                 Lists all known configuration values

Options:
  --quiet, -q  Suppresses warnings (eg about unknown configuration keys)
                                                                       [boolean]
```

Configuration is based on simple key/value pairs, and while you can access keys with any name you likee, the `qx` command will look for the following special keys:

`github.token` - this is the API token used when connecting to GitHub
`qx.libraryPath` - this is the Qooxdoo library to use when compiling your application

