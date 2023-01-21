# SASS compilation

The Qooxdoo Compiler (`qx compile`) includes a built-in SASS compiler which will
automatically compile any .scss file into a .css file in the target output
directory's resources folder.

## SASS Compilation for v6

The SASS compilation in v6 has some additional features on top of the standard,
vanilla SASS, where it will translate all `url()` clauses so that they are
relative to the .scss file where the `url()` statement is written, and also
supports a syntax for `@import "..."` and `url(...)` paths where the path can be
prefixed with the namespace of the library, for example
`url(qx:qx/icon/somefile.png)` or `@import "mylibrary:path/to/file"`.

Interpreting `url(...)` paths as relative to the file in which the `url(...)`
statement originally occurred is a notable change from standard SASS, and is
important because the browser interprets the path in `url(...)` as relative to
the css file it appears in (i.e. the output file for the SASS compiler), meaning
that the url path no longer works if the output directory is different from all
of the source files.

Crucially, this makes it possible to incorporate libraries of styles and assets
without requiring a consensus on file locations.

This feature isn't just to make writing mobile scss files easier, but Qooxdoo is
useful as a framework for building "ordinary" websites where there has to
browser based javascript for things like basic form validation, animations, etc.
(ie use the compiler to build an application which does not use qx.ui.* and
which can be included on web pages). This addition makes it possible to
incorporate .scss files which are built without any consideration for the
Qooxdoo app, or file structure, and which share resources and assets with the
"full-blown" desktop style apps.

### Enabling the new v6 Compilation

By default, these new features are disabled unless you set `sass.compiler` in
`compile.json` to "latest", e.g.:

```json5
  "sass": {
    "compiler": "latest"
  }
}
```

If you do not set `sass.compiler`, you will see a deprecated warning indicating
that the old method is being used by default; note that the old form is
deprecated and will be removed in v7.x.

## Backwards compatibility

The previous SASS compilation was only intended for mobile apps and only
compiles .scss files; this compilation output to the resource source directory
(see #47), renaming any folders called "scss" to "css" (ie
`source/theme/myapp/scss/style.scss` will be converted to
`source/resource/myapp/css/style.css`).

There is one difference however - the SCSS files are now compiled directly into
the target output directory's `resource/` folder - this means that you can
delete the previously generated `css` files from your source and will no longer
have git reporting changes just because you ran a compilation.

## External Resources

If you use `Manifest.json` to cause CSS files to be loaded via the
`externalResources`, you need to use the original `.scss` filename and _not_
the `.css` that was generated. For example:

```json5
"externalResources": {
    "script": [],
    "css": [
      "qxl/mobileshowcase/scss/custom.scss"
    ]
  },
```

This will be translated so that the stylesheet file which is _actually_ loaded
by the browser is `qxl/mobileshowcase/css/custom.css`
