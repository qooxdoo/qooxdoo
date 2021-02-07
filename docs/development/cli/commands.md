# CLI Commands

The Qooxdoo CLI commands allow to conveniently create, modify, compile, test and
publish your Qooxdoo project. To see the main available commands, type `qx`
without any further parameters. Here's an abridged version of the output:

```
  add <command> [options]                   adds new elements to an existing
                                            Qooxdoo application/library
  clean                                     cleans generated files and caches.
  compile [configFile]                      compiles the current application,
                                            using compile.json
  config <key> [value]                      gets/sets persistent configuration
  deploy [options]                          deploys qooxdoo application(s)
  package <command> [options]               manages qooxdoo packages
  pkg <command> [options]                   alias for 'qx package'.
  create <application namespace> [options]  creates a new Qooxdoo project.
  lint [files...]                           runs eslint on the current
                                            application or as set of single
                                            files.
  serve [configFile]                        runs a webserver to run the current
                                            application with continuous
                                            compilation, using compile.json
  upgrade [options]                         upgrades a Qooxdoo application
```

To see the subcommands parameters and options, just type in
`qx <command> --help`.

## Persistent Configuration

Some commands require (or benefit from) having persistent configuration; this is
accessed via the `qx config` command and the data is stored in a directory
called `.Qooxdoo` inside your home directory.

The `qx config` supports the following:

```bash
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

Configuration is based on simple key/value pairs, and while you can access keys
with any name you likee, the `qx` command will look for the following special
keys:

`github.token` - this is the API token used when connecting to GitHub
`qx.library` - this is the Qooxdoo library to use when compiling your
application

## Create a new project

You can create new project skeletons by using the `qx create` command It has the
following options:

```
  --type, -t            Type of the application to create.              [string]
  --out, -o             Output directory for the application content.
  --namespace, -s       Top-level namespace.
  --name, -n            Name of application/library (defaults to namespace).
  --qxpath              Path to the folder containing the Qooxdoo framework.
  --theme               The name of the theme to be used.    [default: "indigo"]
  --icontheme           The name of the icon theme to be used.
                                                             [default: "Oxygen"]
  --noninteractive, -I  Do not prompt for missing values
  --verbose, -v         Verbose logging
```

The fastest way to create a new project is to execute `qx create foo -I`. This
will create a new application with the namespace "foo", using default values.
However, in most cases you wamt to customize the generated application skeleton.
`qx create foo` will interactively ask you all information it needs, providing
default values where possible. If you are in the top-level folder of the
application and want to put the application content into it without creating a
subfolder (for example, in a top-level folder of a cloned empty GitHub project),
use `--out=.`.

## Compile

To compile a Qooxdoo project into a state that can be opened in a browser, use
`qx compile`. This is the CLI frontend for the  
[@qooxdoo/compiler library](https://github.com/qooxdoo/qooxdoo-compiler/blob/master/README.md)
. The command has the following options:

```bash
qx compile [options]

Options:
  --target                  Set the target type: source or build or class
                            name                    [string] [default: "source"]
  --output-path             Base path for output                        [string]
  --locale                  Compile for a given locale                  [array]
  --write-all-translations  enables output of all translations, not just those
                              that are explicitly referenced            [boolean]
  --set                     sets an environment value for the compilation
                            key="value" (with value getting evaluated as js)
                                                                        [array]
  --set-env                 sets an environment value for the application
                                                                        [array]
  --app-class               sets the application class                  [string]
  --app-theme               sets the theme class for the current application
                                                                        [string]
  --app-name                sets the name of the current application    [string]
  --library                 adds a library                               [array]
  --watch                   enables continuous compilation              [boolean]
  --verbose                 enables additional progress output to console
                                                                        [boolean]
```

The compiler relies on the information contained in `compile.json`.
Documentation for the `compile.json` format is
[here](../compiler/configuration/compile.md) .

## Lint

To check your project with eslint you can use `qx lint`. The command has the
following options:

```bash
qx lint [files...]

Options:
  --fix              runs eslint with --fix
  --cache            operate only on changed files (default: `false`).
  --warnAsError, -w  handle warnings as error
  --print-config, -p prints the eslint configuration
  --format, -f       format of the output (default: `codeframe`, options: `codeframe`, `checkstyle`)
  --outputFile, -o   output the results to the specified file
  --verbose, -v      enables additional progress output to console

```

Configuration is done in the `compile.json` file, see here
[here](../compiler/configuration/compile.md) .

If no special lint configuration is given in `compile.json` the configuration
`@qooxdoo/qx/browser` from
[eslint-qx-rules](https://github.com/qooxdoo/eslint-qx-rules/blob/master/README.md)
is used.

If `compile.json` does not exist, `qx lint` tries to use `.eslintrc`.

If you need to turn off a rule (generally discouraged but sometimes necessary),
use the following comments in your code:

`// eslint-disable-line <name of rule>` in the same line or

`// eslint-disable-next-line <name of rule>` to turn off linting for the next
line.

## Mini Web Server

Although many applications will run perfectly well when loaded via a `file://`
URL, browser security means that some applications _must_ use an `http://` url.
The CLI includes the `qx serve` command which operates a mini web server running
(by default) on `http://localhost:8080`. An additional advantage of this command
is that if you have several applications in your project, a start page is
generated which lets you choose the application that you want to run.

You can customise the port with the `--listenPort=<portnumber>` argument, or by
adding `serve: { listenPort: <portnumber> }` to your `compile.json`; the command
line option will take precedence over the `compile.json` setting.

An important feature is that `qx serve` will constantly compile your application
in the background, every time you edit the code - this is equivalent to
`qx compile --watch` plus the web server.

As an example this will compile your application and start the web server on
port 8082

```
$ qx serve --listenPort=8082
```

```bash
qx serve [configFile]

Options:
  --target                  Set the target type: source or build or class
                            name                    [string] [default: "source"]
  --output-path             Base path for output                       [string]
  --locale                  Compile for a given locale                   [array]
  --write-all-translations  enables output of all translations, not just those
                            that are explicitly referenced             [boolean]
  --set                     sets an environment value for the compilation
                            key="value" (with value getting evaluated as js)
                                                                       [array]
  --set-env                 sets an environment value for the application
                                                                       [array]
                            key="value" (with value getting evaluated as js)
  --machine-readable        output compiler messages in machine-readable format
                                                                       [boolean]
  --verbose, -v             enables additional progress output to console
                                                                       [boolean]
  --minify                  disables minification (for build targets only)
            [choices: "off", "minify", "mangle", "beautify"] [default: "mangle"]
  --save-unminified         Saves a copy of the unminified version of output
                            files (build target only) [boolean] [default: false]
  --erase                   Enabled automatic deletion of the output directory
                            when compiler version changes
                                                       [boolean] [default: true]
  --typescript              Outputs typescript definitions in Qooxdoo.d.ts
                                                                       [boolean]
  --add-created-at          Adds code to populate object's $$createdAt [boolean]
  --clean                   Deletes the target dir before compile      [boolean]
  --listenPort              The port for the web browser to listen on

```

Note that the `qx serve` command supports exactly the same options as
`qx compile`, with the exception of `--watch` because that is always enabled;
for more details of the options and the compilation process, please see
[here](../compiler/configuration/compile.md)

## Building for Production and Deployment

When you compile your application using `qx compile`, you'll notice that there's
quite a lot of files generated and the total application size is quite large;
most of these files are temporary files needed only during development, either
because they speed up compilation to keep them around or because it's easier for
you to debug.

By using `qx compile --target=build`, the compiler will produce a completely
seperate compilation with all debug code automatically removed and where the
Javascript source code is minified and reduced to as small a number of files as
possible.

This "build target" compilation is the version you can do final testing on
before publishing it to your users; but while this is minified and stripped
down, there are still a number of temporary files which you do not want to copy
onto your webserver.

When you're ready to distribute the application(s) to your web server, use
`qx deploy`, EG:

```
  $ qx deploy --out=/var/www --source-maps
```

Note that by default source maps are not copied - this is to make sure that
information is about filing systems is not leaked, but this will make it hard to
debug any problems when in production. If you want to include source maps, use
the `--source-maps` parameter.
