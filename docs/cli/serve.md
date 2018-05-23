### Mini Web Server

Although many applications will run perfectly well when loaded via a `file://` URL, browser security means that some applications *must* use an `http://` url.  The CLI includes the `qx serve` command which operates a mini web server running (by default) on `http://localhost:8080`.  You can customise the port with the `--listenPort=<portnumber>` argument, or by adding `serve: { listenPort: <portnumber> }` to your `compile.json`; the command line option will take precedence over the `compile.json` setting.  

An important feature is that `qx serve` will constantly compile your application in the background, every time you edit the code - this is equivalent to `qx compile --watch` plus the web server.

As an example this will compile your application and start the web server on port 8082 

```
$ qx serve --listenPort=8082
```


```
qx serve [configFile]

Options:
  --target                  Set the target type: source, build, hybrid or class
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

Note that the `qx serve` command supports exactly the same options as `qx compile`, with the exception of `--watch` because that is always enabled; for more details of the options and the compilation process, please see [compiler.md](compiler.md)
 
