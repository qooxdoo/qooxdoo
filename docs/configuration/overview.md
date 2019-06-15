# Configuration Overview

## Configuration Files
The qooxdoo tooling and package management systems rely on these configuration
files:

- [`Manifest.json`](Manifest.md): This mandatory file contains basic information
  on the library, such as name, namespace, version, dependencies, etc. 
- [`compile.json` / `compile.js`](compile.md): These files configure the compiler
  and are responsible how the build of a project will be structured and what
  it will contain. 
- [`qooxdoo.json`](../cli/packages.md#multi-library-repositories): serves as a 
  registry of libraries in a package
- [`qx-lock.json`](../cli/packages.md#lockfile-qx-lockjson): This is a library's
  lockfile which contains information on the version of the dependencies
  
`Manifest.json`, `compile.json` and `qooxdoo.json`are validated against [JSON-schemas](../../source/resource/qx/tool/schema).
In contrast, `qx-lock.json` is not, and you should not code against the 
lockfile's structure, since it can change any time.

You should not read or write the configuration files directly, but use the API
instead. This ensures that all the toolchain can automatically validate, and,
if necessary and possible, migrate the content automatically. 

In the following, this is demonstrated using `qx.tool.config.Manifest`. The other
classes are `qx.tool.config.Compile`, `qx.tool.config.Registry` (for `qooxdoo.json`) 
and `qx.tool.config.Lockfile`.

1. Load the model for the configuration file like so:
   `const manifestModel = await (qx.tool.config.Manifest.getInstance()).load();`
   This can be done from anywhere in the code. In non-async code, you need to use
   `qx.tool.config.Manifest.getInstance().load().then(manifestModel => {...});`
2. Read properties using the `getValue()` method and manipulate the data using 
   the `setValue`, `transform()` and `unset()` methods. If you change a value
   outside this API (such as an array item or a subkey of a reference), you must
   call the `validate()` method afterwards to ensure that the data is correct.
3. At the end of the script, check if the model content has changed and, if yes,
   store the file's content to disk:
   `if (manifestModel.isDirty() { manifestModel.save() };`
   
This API is not only useful for qooxdoo purposes. In fact, you can use it for 
your own applications by extending `qx.tool.config.Abstract` to write your [own
config file models](../../source/class/qx/tool/config/).


## CLI Configuration API
While the configuration is typically read from `compile.json`, an API is exposed
by the CLI which allows the configuration to be manipulated before it is processed 
and to interact with the compiler as it works.

See [api.md](api.md) for more details.


