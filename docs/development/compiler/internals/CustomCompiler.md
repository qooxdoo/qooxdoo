# Custom Compiler

A custom compiler lets your project replace the stock compiler class
(`qx.tool.compiler.Compiler`) with a subclass of its own. The most common use
is to plug in a **source transformer**, which rewrites the source code of
selected classes before it is handed to Babel. Typical examples:

- generating client-side proxy classes for classes which are shared between a
  Node.js server and a browser client (the server keeps the real
  implementation, the browser gets a generated stub that calls the server);
- implementing a small domain specific language or code generator;
- stripping server-only code out of classes before they reach the browser.

A custom compiler is more powerful than the [`compile.js` Compiler
API](../configuration/api.md): `compile.js` can only listen to events and
change configuration, a custom compiler can change *what code is compiled*.
Both can be used together in the same project.

The short reference for the configuration keys is in
[compile.json](../configuration/compile.md#custom-compiler); this page explains
how the custom compiler works and walks through a complete example.

## How it works

When `compile.json` contains an application of type `"compiler"`, every `qx`
command that compiles (`qx compile`, `qx serve`, `qx test`, `qx deploy`, ...)
runs in two stages:

```
 qx compile --watch                     (stock compiler, "outer" process)
   │
   ├─ 1. compiles ONLY the "compiler" application with the targets that
   │     have "application-types": ["compiler"]
   │     → e.g. compiled/compiler/custom-compiler/index.js
   │
   └─ 2. spawns   node compiled/compiler/custom-compiler/index.js compile --watch
                  (your compiler, "inner" process)
                    │
                    ├─ runs the complete qx CLI (qx.tool.compiler.cli.Application),
                    │  but creates an instance of your "compilerClass"
                    │  instead of qx.tool.compiler.Compiler
                    ├─ compiles all the other applications and targets
                    └─ worker threads are started from the same index.js,
                       so your source transformer runs inside them
```

Some details which are useful to know:

- The outer process forwards all command line arguments to the inner process,
  except `--clean`/`--no-clean` and `--custom-inspect` (see
  [Debugging](#debugging)). The exit code of the inner process becomes the exit
  code of `qx`.
- The inner process knows which class to use from the environment setting
  `qx.tool.compiler.Compiler.compilerClass`, which the outer process compiles
  into the custom compiler. Never compile or start the custom compiler
  yourself - let `qx` do it.
- The inner process locates the Qooxdoo framework via the outer compiler (the
  environment variable `QOOXDOO_PARENT_COMPILER_PATH`), so both stages use the
  same framework.
- Your compiler class must implement `qx.tool.compiler.ICompilerInterface`. The
  easiest way to do that is to extend `qx.tool.compiler.Compiler`.

## Step by step

### 1. Add a compiler application

Add an application with `"type": "compiler"` to the `applications` section of
`compile.json`:

```json5
{
  "type": "compiler",                          // always "compiler"
  "name": "custom-compiler",                   // optional, this is the default
  "compilerClass": "myapp.compiler.Compiler",  // your compiler class
  "deploy": false,
  "include": [
    "myapp.anno.*",                            // annotation classes (see below)
    "myapp.compiler.*",
    "qx.tool.*"
  ],
  "exclude": [
    "qx.ui.*",                                 // keep browser-only code out
    "qx.module.*",
    "qx.bom.Selector",
    "q", "qxWeb"
  ]
}
```

- `class` defaults to `qx.tool.compiler.cli.Application` (the `qx` CLI itself)
  and normally should not be changed.
- `compilerClass` is added to the includes automatically. Everything else that
  the compiler needs at runtime must be reachable by normal dependency analysis
  or be listed in `include` - in particular the classes used in annotations
  that your transformer evaluates (see
  [Annotations](#reading-annotations)).
- If your compiler shares classes with the browser application (e.g. a
  `myapp.shared.*` package), those classes may pull in browser-only framework
  classes; use `exclude` to keep them out of the Node.js based compiler.

### 2. Add targets for the compiler

The compiler is a Node.js application which needs its own targets, so that it
does not overwrite the output of your other applications. Add a `source` and a
`build` target with `"application-types": ["compiler"]`:

```json5
"targets": [
  {
    "type": "source",
    "application-types": ["compiler"],
    "outputPath": "compiled/compiler",
    "environment": { "qx.debug": true },
    "babelOptions": { "targets": { "node": "20" } }
  },
  {
    "type": "build",
    "application-types": ["compiler"],
    "outputPath": "compiled/compiler.build",
    "environment": { "qx.debug": false },
    "babelOptions": { "targets": { "node": "20" } }
  },
  // ... the targets for your other applications
]
```

The outer process picks the compiler target of the same type as the command
(`qx compile` → `source`, `qx compile --target=build` and `qx deploy` →
`build`), so you need both.

Compiler targets are only used for the compiler application, and the compiler
application is only compiled with compiler targets - your other targets do not
need `application-types` for this to work.

### 3. Make the compiler's npm dependencies available

The custom compiler runs from your project directory, so Node.js resolves its
`require()` calls from *your* `node_modules`. All dependencies of the Qooxdoo
compiler (see the `dependencies` in Qooxdoo's `package.json`) must therefore be
installed in your project. You can either copy them into your `package.json`,
or - if you use Qooxdoo from a Git checkout inside your project - declare that
checkout as an npm workspace, which lets npm install its dependencies for you:

```json
{
  "workspaces": ["qx_packages/qooxdoo"]
}
```

If you copy them, `devDependencies` are sufficient: the custom compiler only
runs while you build, never as part of your deployed application. That keeps
the compiler's dependencies out of a production install (`npm ci --omit=dev`),
as long as you do not compile there.

### 4. Write the compiler class

Extend `qx.tool.compiler.Compiler` and override `addMaker`. The CLI calls
`addMaker` once per maker (= once per target) after the maker's applications
and target have been fully configured, so it is the right place to assign a
source transformer:

```js
qx.Class.define("myapp.compiler.Compiler", {
  extend: qx.tool.compiler.Compiler,

  members: {
    /** @override */
    addMaker(maker) {
      let isBrowser = maker.getApplications().some(app => app.getType() === "browser");
      if (isBrowser) {
        maker.setTransformerClass(myapp.compiler.RemoteProxyTransformer.classname);
      }
      super.addMaker(maker);
    }
  }
});
```

Note that `transformerClass` takes the **name** of the class, not the class or
an instance: the transformer is instantiated inside each worker thread, by
name.

### 5. Write the source transformer

A source transformer implements `qx.tool.compiler.ISourceTransformer`:

| Method                              | Purpose |
|-------------------------------------|---------|
| `async initialise()`                | Called once per worker thread, before the first class is transformed. Load templates, get hold of the meta database, etc. |
| `async shouldTransform(sourceInfo)` | Return `true` if the class should be transformed. Called for **every** class compiled by the maker, including framework classes, so keep it fast. |
| `async transform(sourceInfo, source)` | Return the new source code for the class. `source` is the original source code. |

`sourceInfo` is a `qx.tool.compiler.IClassTranspilerApi.TranspileConfiguration`
object; the most useful fields are `classname`, `sourceFilename` (absolute
path of the original file) and `outputFilename`.

The returned source is compiled exactly like a normal class: it is parsed,
checked for dependencies, transpiled by Babel and written to the output
directory. That also means that dependencies of the *original* code (e.g. a
`require("fs")` in server code) no longer exist for the transformed class.

## Example: generated client proxies

This example is modelled on a real project, in which classes are shared
between a Node.js server application and a browser application. On the server
the classes run as written. In the browser build, every class annotated with
`myapp.anno.Remote` is replaced by a generated proxy whose annotated methods
forward the call to the server:

```
 Browser                                   Node.js server
 ────────────────────────────────────      ─────────────────────────────────────
 new myapp.shared.Greeter().greet("Ann")
   │  (generated proxy)
   └─ myapp.client.Rpc.call(...)  ── POST /rpc ──►  myapp.Server
                                                      └─ myapp.server.RpcHandler
                                                           └─ myapp.shared.Greeter
                                                              (original class)
```

### Project layout

```
myapp/
├── compile.json
├── Manifest.json
├── package.json
└── source/class/myapp/
    ├── anno/
    │   ├── Remote.js               annotation: "this class is remote"
    │   └── RemoteMethod.js         annotation: "this method can be called remotely"
    ├── client/
    │   └── Rpc.js                  browser side of the remote call
    ├── compiler/
    │   ├── Compiler.js             the custom compiler
    │   └── RemoteProxyTransformer.js
    ├── server/
    │   └── RpcHandler.js           server side of the remote call
    ├── shared/
    │   └── Greeter.js              a shared class
    ├── Application.js              browser application
    └── Server.js                   Node.js application (web server)
```

### The annotations

```js
/**
 * Class annotation: in browser builds, the class is replaced by a generated proxy
 */
qx.Class.define("myapp.anno.Remote", {
  extend: qx.core.Object
});
```

```js
/**
 * Member annotation: the method is available in the generated proxy
 */
qx.Class.define("myapp.anno.RemoteMethod", {
  extend: qx.core.Object
});
```

### A shared class

```js
qx.Class.define("myapp.shared.Greeter", {
  extend: qx.core.Object,
  "@": [new myapp.anno.Remote()],

  members: {
    "@greet": new myapp.anno.RemoteMethod(),
    async greet(name) {
      const os = require("os");
      return `Hello ${name}, greetings from ${os.hostname()}`;
    },

    /** not annotated - only available on the server */
    getServerOnlyValue() {
      return process.env.SECRET_VALUE;
    }
  }
});
```

The server application uses `myapp.shared.Greeter` as written. The browser
application uses it in exactly the same way - `await new myapp.shared.Greeter().greet("Ann")` -
but gets the proxy, which contains neither `require("os")` nor
`getServerOnlyValue`.

### The source transformer

```js
qx.Class.define("myapp.compiler.RemoteProxyTransformer", {
  extend: qx.core.Object,
  implement: [qx.tool.compiler.ISourceTransformer],

  members: {
    /** @type {qx.tool.compiler.meta.ShadowMetaDatabaseApi} */
    __metaDb: null,

    /** @override */
    async initialise() {
      // The meta database of the worker thread this transformer runs in
      this.__metaDb = qx.tool.worker.WorkerServer.getThisServerInstance().getApi(qx.tool.compiler.meta.IShadowMetaDatabaseApi);
    },

    /** @override */
    async shouldTransform(sourceInfo) {
      let meta = this.__metaDb.getMetaData(sourceInfo.classname);
      if (!meta) {
        return false;
      }
      let annos = qx.tool.compiler.meta.AnnoUtil.getOwnClass(this.__metaDb, sourceInfo.classname, myapp.anno.Remote);
      return annos.length > 0;
    },

    /** @override */
    async transform(sourceInfo, source) {
      const AnnoUtil = qx.tool.compiler.meta.AnnoUtil;
      let classname = sourceInfo.classname;
      let meta = this.__metaDb.getMetaData(classname);

      let methods = Object.keys(meta.members || {}).filter(
        name => AnnoUtil.getMember(this.__metaDb, classname, name, myapp.anno.RemoteMethod).length > 0
      );
      let members = methods
        .map(
          name => `
    async ${name}(...args) {
      return myapp.client.Rpc.call("${classname}", "${name}", args);
    }`
        )
        .join(",");

      return `/**
 * Generated by myapp.compiler.RemoteProxyTransformer from ${sourceInfo.sourceFilename} - do not edit
 */
qx.Class.define("${classname}", {
  extend: qx.core.Object,

  members: {${members}
  }
});
`;
    }
  }
});
```

For larger amounts of generated code, a template is easier to maintain than
string concatenation. Declare the template file as an asset of the
transformer, and load it in `initialise()`:

```js
/**
 * @asset(myapp/compiler/ClientProxy.tmpl)
 */
const fs = require("fs");

qx.Class.define("myapp.compiler.RemoteProxyTransformer", {
  // ...
  members: {
    async initialise() {
      // ...
      let filename = qx.util.ResourceManager.getInstance().toUri("myapp/compiler/ClientProxy.tmpl");
      this.__template = await fs.promises.readFile(filename, "utf8");
    }
  }
});
```

### The remote call: client and server

The generated proxy depends on `myapp.client.Rpc`, a normal class of the
browser application which sends the call to the server:

```js
/**
 * Sends remote calls to the server; used by the generated proxy classes
 *
 * @ignore(fetch)
 */
qx.Class.define("myapp.client.Rpc", {
  type: "static",

  statics: {
    async call(classname, method, args) {
      let response = await fetch("/rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classname, method, args })
      });
      let data = await response.json();
      if (!response.ok) {
        throw new Error(`Remote call ${classname}.${method} failed: ${data.error}`);
      }
      return data.result;
    }
  }
});
```

On the server, `myapp.server.RpcHandler` executes the call. It uses the same
annotations as the transformer, but at runtime via `qx.Annotation`:

```js
/**
 * Executes remote calls sent by `myapp.client.Rpc`.
 *
 * Only methods annotated with `myapp.anno.RemoteMethod` of classes annotated with
 * `myapp.anno.Remote` can be called - everything else is rejected, otherwise any
 * client could call any method of any class on the server.
 */
qx.Class.define("myapp.server.RpcHandler", {
  type: "static",

  statics: {
    /**
     * @param {Object} request the request sent by the client
     * @param {String} request.classname
     * @param {String} request.method
     * @param {Array} request.args
     * @return {Promise<*>} the result of the method
     */
    async handle({ classname, method, args }) {
      let clazz = qx.Class.getByName(classname);
      if (!clazz || qx.Annotation.getClass(clazz, myapp.anno.Remote).length == 0) {
        throw new Error(`${classname} is not a remote class`);
      }
      if (qx.Annotation.getMember(clazz, method, myapp.anno.RemoteMethod).length == 0) {
        throw new Error(`${classname}.${method} is not a remote method`);
      }
      if (!Array.isArray(args)) {
        throw new Error("args must be an array");
      }

      let instance = new clazz();
      try {
        return await instance[method](...args);
      } finally {
        instance.dispose();
      }
    }
  }
});
```

> **Security:** the check of the annotations is essential. Without it, any
> client could call any method of any class on the server, e.g.
> `getServerOnlyValue()` in the example above. Only expose classes and
> methods which are meant to be called by clients, and validate the
> arguments.

`myapp.Server` is the Node.js application. It serves the compiled browser
application from `compiled/client` and passes `POST /rpc` requests to the
`RpcHandler`. A real project would use a web framework such as Express or
Fastify, this example only uses Node.js built-ins:

```js
const http = require("http");
const fs = require("fs");
const path = require("path");

/**
 * Node.js application: serves the compiled browser application and answers
 * remote calls on `POST /rpc`
 */
qx.Class.define("myapp.Server", {
  extend: qx.application.Basic,

  statics: {
    MIME_TYPES: {
      ".html": "text/html",
      ".js": "text/javascript",
      ".json": "application/json",
      ".css": "text/css",
      ".map": "application/json"
    }
  },

  members: {
    async main() {
      let port = parseInt(process.env.PORT || "8080", 10);
      let staticDir = path.resolve(process.env.STATIC_DIR || "compiled/client");

      let server = http.createServer(async (req, res) => {
        try {
          if (req.method === "POST" && req.url === "/rpc") {
            await this.__onRpc(req, res);
          } else if (req.method === "GET") {
            await this.__serveFile(req, res, staticDir);
          } else {
            res.writeHead(405).end();
          }
        } catch (ex) {
          this.error(ex);
          res.writeHead(500).end();
        }
      });
      server.listen(port, () => console.log(`Listening on http://localhost:${port}/myapp/`));
    },

    async __onRpc(req, res) {
      let body = "";
      for await (let chunk of req) {
        body += chunk;
      }

      let status = 200;
      let response;
      try {
        response = { result: await myapp.server.RpcHandler.handle(JSON.parse(body)) };
      } catch (ex) {
        status = 500;
        response = { error: ex.message };
      }
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(response));
    },

    async __serveFile(req, res, staticDir) {
      let urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      let filename = path.join(staticDir, urlPath);
      if (filename !== staticDir && !filename.startsWith(staticDir + path.sep)) {
        res.writeHead(403).end();
        return;
      }

      let stat = await fs.promises.stat(filename).catch(() => null);
      if (stat?.isDirectory()) {
        filename = path.join(filename, "index.html");
        stat = await fs.promises.stat(filename).catch(() => null);
      }
      if (!stat?.isFile()) {
        res.writeHead(404).end();
        return;
      }

      let contentType = myapp.Server.MIME_TYPES[path.extname(filename)] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      fs.createReadStream(filename).pipe(res);
    }
  }
});
```

Finally, the browser application calls the shared class just like the server
would:

```js
/**
 * Browser application: calls the server via the generated proxy
 */
qx.Class.define("myapp.Application", {
  extend: qx.application.Native,

  members: {
    async main() {
      super.main();
      let greeter = new myapp.shared.Greeter();
      document.body.textContent = await greeter.greet("Ann");
    }
  }
});
```

### The compiler class

`myapp.compiler.Compiler` is the class shown in [step 4](#_4-write-the-compiler-class).

### compile.json

Note that the browser and the Node.js applications use **different targets**:
the transformer is assigned per maker, i.e. per target, and the server must
see the original classes. The server application must `include` the shared
classes explicitly, because the `RpcHandler` only refers to them by name.

```json5
{
  "$schema": "https://qooxdoo.org/schema/compile-1-0-0.json",
  "applications": [
    {
      "type": "browser",
      "class": "myapp.Application",
      "name": "myapp",
      "include": ["myapp.shared.*"]
    },
    {
      "type": "node",
      "class": "myapp.Server",
      "name": "server",
      "include": ["myapp.shared.*"]
    },
    {
      "type": "compiler",
      "name": "custom-compiler",
      "compilerClass": "myapp.compiler.Compiler",
      "deploy": false,
      "include": ["myapp.anno.*", "myapp.compiler.*", "qx.tool.*"],
      "exclude": ["q", "qxWeb", "qx.module.*", "qx.ui.*"]
    }
  ],
  "targets": [
    {
      "type": "source",
      "application-types": ["compiler"],
      "outputPath": "compiled/compiler",
      "babelOptions": { "targets": { "node": "20" } }
    },
    {
      "type": "build",
      "application-types": ["compiler"],
      "outputPath": "compiled/compiler.build",
      "babelOptions": { "targets": { "node": "20" } }
    },
    {
      "type": "source",
      "application-types": ["node"],
      "outputPath": "compiled/server",
      "babelOptions": { "targets": { "node": "20" } }
    },
    {
      "type": "build",
      "application-types": ["node"],
      "outputPath": "compiled/server.build",
      "babelOptions": { "targets": { "node": "20" } }
    },
    {
      "type": "source",
      "application-types": ["browser"],
      "outputPath": "compiled/client"
    },
    {
      "type": "build",
      "application-types": ["browser"],
      "outputPath": "compiled/client.build"
    }
  ],
  "defaultTarget": "source",
  "locales": ["en"]
}
```

### Running it

Nothing changes in the way you call `qx`:

```bash
npx qx compile
```

The first lines of the output show the two stages:

```
>>>Custom compiler detected - compiling custom compiler first...
...
>>> Starting compilation of project...
```

After compiling, `compiled/client/transpiled/myapp/shared/Greeter.trans.js`
contains the generated proxy (see [Debugging](#debugging)), while
`compiled/server/transpiled/myapp/shared/Greeter.js` contains the original
class.

Then start the server and open http://localhost:8080/myapp/ - the page shows
the greeting which the browser received from the server:

```bash
node compiled/server/server/index.js
```

You can also call the server directly; calls which are not allowed are
rejected:

```bash
curl -X POST http://localhost:8080/rpc -d '{"classname":"myapp.shared.Greeter","method":"greet","args":["Bob"]}'
# {"result":"Hello Bob, greetings from myhost"}

curl -X POST http://localhost:8080/rpc -d '{"classname":"myapp.shared.Greeter","method":"getServerOnlyValue","args":[]}'
# {"error":"myapp.shared.Greeter.getServerOnlyValue is not a remote method"}
```

`qx compile --watch` works as usual. `qx serve`, however, starts the
compiler's own web server, which knows nothing about `/rpc`. Either run your
own server next to `qx compile --watch` as shown above, or replace the web
server of `qx serve` from a [`compile.js`](../configuration/api.md), e.g. by
overriding `runWebServer` of the `Serve` command in a `changeCommand` listener.

## Reading metadata and annotations

Source transformers run in the compiler's worker threads. Each worker has a
"shadow" copy of the meta database, which you get with:

```js
let metaDb = qx.tool.worker.WorkerServer.getThisServerInstance().getApi(qx.tool.compiler.meta.IShadowMetaDatabaseApi);
```

`metaDb.getMetaData(classname)` returns the raw metadata of a class (or
`undefined`), in the format described in [Metadata](MetaData.md). The fields
most useful for transformers are `type` (`"class"`, `"mixin"`, `"interface"`),
`superClass`, `interfaces`, `mixins`, `statics`, `properties`, `members`,
`events` and `annotation`. Members and statics have `access` (`"public"`,
`"protected"`, `"private"`) and `type` (e.g. `"function"`), properties have
`check`, `init`, `nullable` etc., and every entry which is annotated has an
`annotation` array.

`metaDb.getPackageClasses(packageName)` returns the names of all known classes
in a package.

### Reading annotations

In the metadata, annotations are stored as **source code strings**, e.g.
`"new myapp.anno.Remote()"`. `qx.tool.compiler.meta.AnnoUtil` evaluates them
for you:

- `AnnoUtil.evalAnno(code)` - evaluates one annotation expression and returns
  the object, or `null` if evaluation failed;
- `AnnoUtil.getOwnClass(metaDb, classname, AnnoClass)` - annotations of a class
  which are exact instances of `AnnoClass`, as `{ code, anno }` objects;
- `AnnoUtil.getMember(metaDb, classname, memberName, AnnoClass)` - the same for
  a member, including the member annotations of the super classes.

Because annotations are evaluated *inside the compiler*, the annotation classes
(and everything they use) must be part of the compiler application. If they
are missing, `evalAnno` silently returns `null` and your transformer simply
does nothing - so list them in the compiler application's `include`.

`getOwnClass` and `getMember` compare the constructor exactly; use
`qx.Class.isSubClassOf(anno.constructor, AnnoClass)` on the results of
`evalAnno` if you want to match subclasses as well.

## Using compile.js together with a custom compiler

A [`compile.js`](../configuration/api.md) is loaded by both the outer and the
inner process. Listeners on the command's compiler events (`making`, `made`,
`writtenApplication`, ...) only fire in the inner process, because the outer
process does not relay the events of the compiler stage. Other hooks, such as
`load()` or `changeCommand`, run in both processes. If you need to know in
which process your code runs, check the environment setting:

```js
let isInnerProcess = !!qx.core.Environment.get("qx.tool.compiler.Compiler.compilerClass");
```

## Debugging

- `qx compile --verbose` prints the command line used to start the custom
  compiler.
- `qx compile --custom-inspect=<spec>` starts the custom compiler with the
  Node.js inspector, so that you can attach a debugger. `<spec>` has the form
  `[inspect[-brk]=][host:]port`, e.g. `--custom-inspect=9229` or
  `--custom-inspect=inspect-brk=0.0.0.0:9230` (stop at the first line).
  Source transformers run in worker threads, so make sure that your debugger
  also attaches to the worker threads (VS Code's JavaScript debugger does this
  automatically).
- For every transformed class, the generated source is written next to the
  output file with the extension `.trans.js` (e.g.
  `compiled/client/transpiled/myapp/shared/Greeter.trans.js`). Compilation
  errors and source maps of the transformed class refer to this file.

## Limitations and pitfalls

- **Changing the compiler in watch mode:** the outer process compiles the
  custom compiler once, when `qx` starts. If you change the code of your
  compiler or transformer while `qx compile --watch` or `qx serve` is running,
  stop it (Ctrl+C) and start it again.
- **Outdated transformed classes:** a class is only recompiled when its own
  source file changes. If the output of your transformer also depends on
  something else - another class's metadata, a template, or the transformer
  code itself - classes which have already been compiled are not regenerated.
  In that case delete the output directory of the affected target (e.g.
  `compiled/client`).
- **`--clean` only cleans the compiler:** `--clean` is handled by the outer
  process, which only knows about the compiler targets, and it is not
  forwarded to the inner process (which would otherwise delete its own running
  code). `qx compile --clean` therefore recompiles the custom compiler, but
  does not erase the output directories of your other targets; delete them
  manually if you need a full rebuild.
- **No shared state between workers:** each worker thread creates its own
  transformer instance and calls `initialise()` on it. Do not rely on state
  shared between transformed classes.
- **The transformer applies to the whole target:** `transformerClass` is set
  per maker, i.e. per target. Use separate targets for applications which must
  see the original classes (see the `compile.json` above).
