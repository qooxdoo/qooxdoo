### Compiler

To compile a qooxdoo project into a state that can be opened in a browser, use 
`qx compile`. This is the CLI frontend for the [qooxdoo-compiler library](https://github.com/qooxdoo/qooxdoo-compiler/blob/master/README.md). 
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
