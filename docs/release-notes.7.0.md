# Qooxdoo Release Notes

## New feature for v7.9.0
   - Add the possibility to use native promises instead of Bluebird (##10766)

For a full list of changes see https://github.com/qooxdoo/qooxdoo/commits/master?branch=master&qualified_name=refs%2Fheads%2Fmaster&since=2025-01-29&until=2025-05-15

## Fixes and optimizations for v7.8.0
In this release we did some optimizations:
   - Feature: Add a cache for label size to speed up the calculation (#10732)
   - Feature: Use Map instead of Array to register event listeners, this gives a huge Performance update searching the event listeners (#10736)
   - Fix: Prevent .placeToWidget(..., true) from eating cpu (#10722)
   - Feature: Allow runtime environment mutations for testing by setting environment settint "qx.environment.allowRuntimeMutations"=true  (implements #10747) (#10749)
   - Fix: qx.io.jsonrpc.Client throws uncatchable error on server-side error (#10739) 
   - Feature: Browserify options in compile.json (#10733)

For a full list of changes see https://github.com/qooxdoo/qooxdoo/commits/master?branch=master&qualified_name=refs%2Fheads%2Fmaster&since=2024-07-23&until=2025-01-28

## Fixes for v7.7.2
For a full list of changes see https://github.com/qooxdoo/qooxdoo/commits/master?branch=master&qualified_name=refs%2Fheads%2Fmaster&since=2024-05-03&until=2024-07-22

## Fixes for v7.7.1
For a full list of changes see https://github.com/qooxdoo/qooxdoo/commits/master?branch=master&qualified_name=refs%2Fheads%2Fmaster&since=2024-04-13&until=2024-05-02

## New features in v7.7
   - Better Typescript generation:
   Previously, the compiler only output typescript definitions as it compiled, but this caused problems because not all targets support all javascript files (eg browser vs node code)
   Now the meta data collection is moved into a separate parser which can scan every class file in every library, and generate meta data and typescript, see https://github.com/qooxdoo/qooxdoo/pull/10646
   
   - privateArtifacts property in compile.json:
   This adds a privateArtifacts option to compile.json to allow all urls to be locked within an application directory, see https://github.com/qooxdoo/qooxdoo/pull/10681
   
   - Enhance Jsx: The Jsx system now has custom elements, slots, and several other useful pieces of functionality. There is also a setup for <qx:* /> special elements to be added in future for any purposes, which reserves the qx: namespace in the meantime, see https://github.com/qooxdoo/qooxdoo/pull/10637
   
   - Add cycle behaviour to ToggleButton, see https://github.com/qooxdoo/qooxdoo/pull/10655

   - Implement cached objects top-level section, see https://github.com/qooxdoo/qooxdoo/issues/10641 and https://github.com/qooxdoo/qooxdoo/pull/10645

   - add stack trace to $$createdAt, see https://github.com/qooxdoo/qooxdoo/pull/10683
   
For a full list of changes see https://github.com/qooxdoo/qooxdoo/commits/master?branch=master&qualified_name=refs%2Fheads%2Fmaster&since=2023-12-07&until=2024-04-12


## Fixes for v7.6.3
For a full list of changes see https://github.com/qooxdoo/qooxdoo/commits/master?branch=master&qualified_name=refs%2Fheads%2Fmaster&since=2023-10-05&until=2023-12-06

## Fixes for v7.6.2
For a full list of changes see https://github.com/qooxdoo/qooxdoo/commits/master?branch=master&qualified_name=refs%2Fheads%2Fmaster&since=2023-07-29&until=2023-10-04

## Fixes for v7.6.1
For a full list of changes see https://github.com/qooxdoo/qooxdoo/commits/master?branch=master&qualified_name=refs%2Fheads%2Fmaster&since=2023-04-13&until=2023-07-28

## New features in v7.6
improved support for webfonts:

- Manifest.json's `provides.webfonts` is deprecated and now `provides.fonts` is preferred
- The entries in `provides.fonts` are declaring available font "IDs", which could be reusable private names (eg `qx.theme.monospace`) or ones which follow the well-known name (eg `MaterialIcons`)
- Classes declare that they need a font by using `@usefont(FontIdFromManifest)`
- The font can be defined with URLs (for use with a CDN) and/or with sources
- The compiler decides which font files (if any) to include in the application build, and the user can decide whether to use the CDN or compile fonts into the app (via command line and `compile.json` configuration)
- Glyphs are manually extracted via `qx export-glyphs`, instead of on every compile

The benefits of all this is faster compiles, with smaller build targets - and no space consumed by the `materialicon` fonts if they are not used (as this was the case in the earlier 7.x releases).

For a full list of changes see https://github.com/qooxdoo/qooxdoo/commits/master?branch=master&qualified_name=refs%2Fheads%2Fmaster&since=2023-02-21&until=2023-04-13


## Fixes for v7.5.1
For a full list of changes see https://github.com/qooxdoo/qooxdoo/commits/master?branch=master&qualified_name=refs%2Fheads%2Fmaster&since=2023-01-17&until=2023-02-20

## New features in v7.5
- add Indigo dark theme to qooxdoo
For a full list of changes see https://github.com/qooxdoo/qooxdoo/commits/master?branch=master&qualified_name=refs%2Fheads%2Fmaster&since=2022-11-27&until=2023-01-16

## New features in v7.4
- compile.json: localModules can now be used in the root of the file. So you can address the modules for all applications.
                Application modules will be merged with global ones.
- browserifying the npm modules: Browserify of the used npm modules is a time-consuming process. Now it's checked whether it's really necessary.
It's necessary when:
    - commonjs-browserify.js does not exits
    - The list of modules has changed
    - One or more of the localModules are newer compared to the last run                

- localModules are now detected by the watch process    
For a full list of changes see https://github.com/qooxdoo/qooxdoo/commits/master?branch=master&qualified_name=refs%2Fheads%2Fmaster&since=2022-10-26&until=2022-11-26
 
## New features in v7.3
- Core: add min and max values to DateChooser  (#10462)
- Core: allows toolbars to be given a different layout (#10452)
- Core: allows tabview pages to be scrollable (adds ScrollablePage) (#10448)

- Compiler: adding support for proxy classes (#10446)

For a full list of changes see https://github.com/qooxdoo/qooxdoo/commits/master?branch=master&qualified_name=refs%2Fheads%2Fmaster&since=2022-07-11&until=2022-10-26


## Notable changes in v7.2
 - To supplement the ability to bundle CommonJS modules that was added
in v7.1, it is now additionally possible to bundle local (in the local
tree vs. in `node_modules`) CommonJS or ES6 modules as well, as
documented [here](development/compiler/configuration/README.md).
 - We introduce 2 new widgets: `qx.ui.form.FileSelectorButton` and `qx.ui.toolbar.FileSelectorButton`.
 


## New features and fixes in v7.1
 - Browser-based applications may now make Node-style requests to `require` a CommonJS module, and the compiler will automatically create a bundle containing the required modules and inject it into the application so those modules are available for use. Documentation is found [here](development/compiler/configuration/README.md).




## Notable changes and new features in v7.0
 - qx es6ify
 - allow super()
 - new High-Level-Communication API, including support for JSON-RPC and GraphQL (experimental). Documentation is found [here](communication/README.md)
 - Accessibility is an important topic in modern web development in order to allow assistive technologies to better help people with disabilities. Qooxdoo now supports better integration of [WAI-ARIA](https://www.w3.org/TR/wai-aria-1.1/) and more keyboard accessibility.
Documentation is found [here](development/howto/accessibility.md)




## Breaking changes in v7.0

- The `qx.library` config setting is no longer used by the
compiler. If you want to override the path to the framework
source, add the path to `compile.json`'s `libraries` array.

- `qx.ui.form.Slider` now works correctly in vertical orientation.
The maximum value is at the top of the slider and the minimal value
at the bottom. Before that, the 2 values were reversed 

- all flash supporting classes are removed - flash is dead since January 2020.

- `qx.ui.command.Group` fixed a bug where new `qx.ui.command.Command` added did
not set the `active` status of the group, thus staying active even if the group
was inactive.

-  Namespace `qx.io.remote` has  been removed from the framework and put into 
the package [`deprecated.qx.io.remote`](https://github.com/qooxdoo/deprecated.qx.io.remote).
You can reinstall it by executing `npx qx pkg install qooxdoo/deprecated.qx.io.remote`.
  

## Licensing and Open Source Ownership

As a team, we are a small group of experienced developers based around the world who use
Qooxdoo every day and have a vested interest in maintaining the project and keeping it strong.

All code is available at GitHub [https://github.com/qooxdoo](https://github.com/qooxdoo),
where we have published policies and rules on contributing; We actively encourage anyone to
submit Pull Requests to contribute to the project.

We chat in public on [Gitter](https://gitter.im/qooxdoo/qooxdoo) and answer questions
on [Stack Overflow](https://stackoverflow.com/questions/tagged/qooxdoo).

And we have [exciting plans for the future](http://qooxdoo.org/documentation/#/roadmap)!

[Documentation](https://qooxdoo.org/documentation/#/development/contribute)



