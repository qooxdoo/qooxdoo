
# Qooxdoo Compiler Release Notes

Qooxdoo Compiler is a BETA RELEASE - at this stage, the compiler is expected to be able to compile production applications (use at your own risk) but still has some ancillary features such as API viewer and TestRunner maker which would be required in order to be a release candidate for Qooxdoo 6.0.


## 0.1.26 (Beta Release)
* fixes #30 qx resources doesn't seem to be copied over
* fixes #31 new resources not copied over after --watch has started
* fixes #32 Generated index.html is always a "skeleton" one
* fixes #35 Does not detect wrong class name


## 0.1.25 (Beta Release)
* fix bug where modified files not always recompiled;
* fix spurious warnings
* fix bugs with anonymous/inner/private classes not being parsed properly; 
* fix bug in detecting classes referred to by properties (eg annotations);
* build target is expensive to run (because of minification) and has been fixed so that it only recompiles if necessary
* improvements in user feedback to allow the host program to control output - eg feedback is now done via events instead of console.log and changes `qxcompiler.Console` to allow for custom writers;
* TypeScript generation is no longer implemented as a separate "target", instead the `qxcompiler.makers.Maker` class supports `outputTypescript` and `outputTypescriptTo` properties that apply for whatever the current target is.  This impacts the `compile.json` of `qx-cli` - see [qx-cli/docs/compile-json.md](https://github.com/qooxdoo/qooxdoo-cli/blob/master/docs/compile-json.md#typescript) 
* Minification of the Build target now supports `none`, `minify`, and `mangle` for progressively severe obfuscation
* removed SelfTestTarget (merged functionality with Target) and added option to output compile-info.json into app directory; this was previously used just for the unit tests, but is refactored so that compiler data can be reused by third party apps generally (see (issue #20)[https://github.com/qooxdoo/qooxdoo-compiler/issues/20]) 
* improved units tests
* added a block which prevents eraseOutputDir from deleting the PWD even if configured to do so

