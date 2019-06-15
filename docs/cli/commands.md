### CLI Commands

The qooxdoo CLI commands allow to conveniently create, modify, compile, testand publish
and publish your qooxdoo project. To see the main available commands, type
`qx` without any further parameters.

```
Typical usage:
  qx <commands> [options]

Type qx <command> --help for options and subcommands.

Commands:
  add <command> [options]                   adds new elements to an existing
                                            qooxdoo application/library
  clean                                     cleans generated files and caches.
  compile [configFile]                      compiles the current application,
                                            using compile.json
  config <key> [value]                      gets/sets persistent configuration
  contrib <command> [options]               manages qooxdoo contrib libraries
  create <application namespace> [options]  creates a new qooxdoo project.
  lint [files...]                           runs eslint on the current
                                            application or as set of single
                                            files.
  serve [configFile]                        runs a webserver to run the current
                                            application with continuous
                                            compilation, using compile.json
  upgrade [options]                         upgrades a qooxdoo application
````

To see the subcommands parameters and options, just type in `qx <command>`.

# Persistent Configuration

Some commands require (or benefit from) having persistent configuration; this is
accessed via the `qx config` command and the data is stored in a directory
called `.qooxdoo` inside your home directory.

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

Configuration is based on simple key/value pairs, and while you can access keys
with any name you likee, the `qx` command will look for the following special
keys:

`github.token` - this is the API token used when connecting to GitHub
`qx.libraryPath` - this is the Qooxdoo library to use when compiling your application

### Create a new project

You can create new project skeletons by using the `qx create` command` It has the following options:
```
  --type, -t            Type of the application to create.              [string]
  --out, -o             Output directory for the application content.
  --namespace, -s       Top-level namespace.
  --name, -n            Name of application/library (defaults to namespace).
  --qxpath              Path to the folder containing the qooxdoo framework.
  --theme               The name of the theme to be used.    [default: "indigo"]
  --icontheme           The name of the icon theme to be used.
                                                             [default: "Oxygen"]
  --noninteractive, -I  Do not prompt for missing values
  --verbose, -v         Verbose logging
```

The fastest way to create a new project is to execute `qx create foo -I`. This will create a new application with the namespace "foo", using default values. However, in most cases you wamt to customize the generated application skeleton. `qx create foo` will interactively ask you all information it needs, providing default values where possible. If you are in the top-level folder of the application and want to put the application content into it without creating a subfolder (for example, in a top-level folder of a cloned empty GitHub project), use `--out=.`. 


### Compiler

To compile a qooxdoo project into a state that can be opened in a browser, use 
`qx compile`. This is the CLI frontend for the [@qooxdoo/compiler library](https://github.com/qooxdoo/@qooxdoo/compiler/blob/master/README.md). 
The command has the following options: 

```
qx compile [options] [configFile]

Options:
  --target                  Set the target type: source or build or class
                            name                    [string] [default: "source"]
  --output-path             Base path for output                        [string]
  --locale                  Compile for a given locale                   [array]
  --write-all-translations  enables output of all translations, not just those
                            that are explicitly referenced             [boolean]
  --set                     sets an environment value                    [array]
			    key="value" (with value getting evaluated as js)
  --app-class               sets the application class                  [string]
  --app-theme               sets the theme class for the current application
                                                                        [string]
  --app-name                sets the name of the current application    [string]
  --library                 adds a library                               [array]
  --watch                   enables continuous compilation             [boolean]
  --verbose                 enables additional progress output to console
                                                                       [boolean]
```
The compiler relies on the information contained in `compile.json`. Documentation for the `compile.json` format is [here](compile-json.md).

### Lint

To check your project with eslint you can use `qx lint`.
The command has the following options:

```
qx lint [files...]

Options:
  --fix              runs eslint with --fix
  --cache            operate only on changed files (default: `false`).
  --warnAsError, -w  handle warnings as error
  --config, -c       prints the eslint configuration
  --format, -f       format of the output (default: `codeframe`, options: `codeframe`, `checkstyle`)
  --outputFile, -o   output the results to the specified file
  --verbose, -v      enables additional progress output to console

```

Configuration is done in the `compile.json` file, see here [here](compile-json.md).

If no special lint configuration is given in `compile.json` the configuration
`@qooxdoo/qx/browser` from
[eslint-qx-rules](https://github.com/qooxdoo/eslint-qx-rules/blob/master/README.md)
is used.

If `compile.json` does not exist, `qx lint` tries to use `.eslintrc`.

### Mini Web Server

Although many applications will run perfectly well when loaded via a `file://`
URL, browser security means that some applications *must* use an `http://` url. 
The CLI includes the `qx serve` command which operates a mini web server running
(by default) on `http://localhost:8080`. An additional advantage of this command
is that if you have several applications in your project, a start page is generated
which lets you choose the application that you want to run.  
  
You can customise the port with the `--listenPort=<portnumber>` argument, or by
adding `serve: { listenPort: <portnumber> }` to your `compile.json`; the command
line option will take precedence over the `compile.json` setting.

An important feature is that `qx serve` will constantly compile your application
in the background, every time you edit the code - this is equivalent to `qx
compile --watch` plus the web server.

As an example this will compile your application and start the web server on port 8082 

```
$ qx serve --listenPort=8082
```


```
qx serve [configFile]

Options:
  --target                  Set the target type: source or build or class
                            name                    [string] [default: "source"]
  --output-path             Base path for output                        [string]
  --locale                  Compile for a given locale                   [array]
  --write-all-translations  enables output of all translations, not just those
                            that are explicitly referenced             [boolean]
  --set                     sets an environment value                    [array]
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
  --typescript              Outputs typescript definitions in qooxdoo.d.ts
                                                                       [boolean]
  --add-created-at          Adds code to populate object's $$createdAt [boolean]
  --clean                   Deletes the target dir before compile      [boolean]
  --listenPort              The port for the web browser to listen on

```

Note that the `qx serve` command supports exactly the same options as `qx
compile`, with the exception of `--watch` because that is always enabled; for
more details of the options and the compilation process, please see
[compiler.md](compiler.md)

