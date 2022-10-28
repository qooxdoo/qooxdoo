# Development Tools

This is an incomplete list of tools for Qooxdoo development. Please use the
"Edit Document on GitHub" button below to add information on any other tool with
Qooxdoo support that you know of.

## IDEs and Code editors

Currently, the following IDEs and editors that specifically support Qooxdoo
development natively or with a plug-in:

- [JetBrains IDEs](https://www.jetbrains.com//products.html) (PHPStorm, Webstorm
  IntelliJ IDEA): Code analysis and navigation (including auto-generated
  methods), auto-complete.

- [VSCode](https://code.visualstudio.com/) VSCode has lots of plugins and is a great
  fit for Qooxdoo development (as well as other platforms).  You can configure VSCode
  with lots of nice features, including automatic reformat on save with Prettier.IO

## Add type support to VSCode
 - Generate the qooxdoo.d.ts file, see here and move it where you want
 - Create an additional types.d.ts file, filename is irrelevant, and move it where you want. Mine is at project root level
 
```
export {};
import { qx as _qx } from "./qooxdoo"; // path to qooxdoo.d.ts
declare global {
  interface qx extends _qx {}
  //** Global reference for qooxdoo
  var qx: typeof _qx; 
}
```
- if you don't have it yet, create an jsconfig.json or the typescript version f it in the project root and include your created types.d.ts
```
{
   "compilerOptions": {
     "target": "ES6",
     "module": "commonjs",
  },
  "include": [
   "**/*.js", // Apply jsconfig to every .js File
   "./types.d.ts" // path to types.d.ts
  ]
}
```
- Restart VSCode
Now VSCode knows that qx is a global variable and knows it's type. You'll need to declare a global variable for every reference you use. For example: If you add the qxl.dialog package and want type support, all you have to todo is modify the types.d.ts and add the part for qxl. qooxdoo.d.ts is automatically updated by the compiler when you regenerate the file.
Maybe the compiler could integrate a global block in every module definition when creating the qooxdoo.d.ts file and you wouldn't need the extra types.d.tsfile, but that would require extra testing and work. I am fine with this solution and it seems to be working great!!

Sources:
 - [Idea Marking variable as global](https://stackoverflow.com/questions/69604913/jsdoc-how-to-specify-the-type-of-an-implicit-global-variable-for-a-js-code-snip)
 - [Idea Import definition files](https://stackoverflow.com/questions/39040108/import-class-in-definition-file-d-ts)
 - [Example url.d.ts , which grants type support for the global URLSearchParams in VSCode](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node/url.d.ts)

## Translation: `.po` -file editors

- [PoEdit](https://poedit.net/)
