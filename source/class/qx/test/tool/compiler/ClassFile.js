/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Henner Kollmann

************************************************************************ */

/**
 * Tests `qx.tool.compiler.ClassFile`'s scope / symbol analysis: various JavaScript
 * constructs (ES6 shorthand methods in `delegate` objects, labelled loops, array and
 * object-rest destructuring, external super classes, calls to undeclared functions)
 * must NOT be reported as "unresolved" symbols.
 *
 * The fixtures live in `test/tool/unittest/compiler/` and are compiled directly (not
 * through the full compiler / worker pool). `ClassFile` only needs two synchronous
 * methods from the meta database - `getSymbolType()` and `getPackageClasses()` - so a
 * lightweight stand-in is used instead of a real `ShadowMetaDatabaseApi`.
 *
 * @ignore(require)
 */
qx.Class.define("qx.test.tool.compiler.ClassFile", {
  extend: qx.dev.unit.TestCase,

  members: {
    /**
     * Builds a minimal `ClassFileConfig` sufficient for scope analysis.
     * @returns {qx.tool.compiler.ClassFileConfig}
     */
    __createConfig() {
      const CF = qx.tool.compiler.ClassFile;
      let config = new qx.tool.compiler.ClassFileConfig();
      config.setBabelConfig({});
      config.setEnvironment({});
      config.setApplicationTypes(["node"]);
      config.setManglePrivates("off");
      config.setSymbols([...CF.QX_GLOBALS, ...CF.COMMON_GLOBALS, ...CF.BROWSER_GLOBALS]);
      return config;
    },

    /**
     * A stand-in for the shadow meta database.  `ClassFile` only calls `getSymbolType()`
     * and `getPackageClasses()` (both synchronous).  The classes referenced by the
     * fixtures are seeded so that only genuinely unknown symbols remain unresolved.
     * @returns {Object}
     */
    __createMetaDb() {
      const knownClasses = ["qx.Class", "qx.core.Object", "qx.data.Array", "qx.application.Standalone", "qx.ui.container.Composite", "my.application.control.EditableList", "some.Class"];
      const known = {};
      const packages = {};
      for (let cls of knownClasses) {
        known[cls] = true;
        let segs = cls.split(".");
        for (let i = 1; i < segs.length; i++) {
          packages[segs.slice(0, i).join(".")] = true;
        }
      }
      return {
        getSymbolType(name) {
          if (known[name]) {
            return { symbolType: "class", className: name, name };
          }
          if (packages[name]) {
            return { symbolType: "package", className: null, name };
          }
          let segs = name.split(".");
          while (segs.length > 1) {
            segs.pop();
            let container = segs.join(".");
            if (known[container]) {
              return { symbolType: "member", className: container, name };
            }
          }
          return null;
        },
        getPackageClasses(packageName) {
          return Object.keys(known).filter(cls => cls.startsWith(packageName + "."));
        }
      };
    },

    /**
     * Compiles a fixture class and returns the names of its unresolved symbols.
     * @param {String} className the fixture class name (also its filename stem)
     * @returns {String[]}
     */
    __unresolvedSymbolsFor(className) {
      const fs = require("fs");
      const path = require("path");
      let filename = path.join("unittest", "compiler", className + ".js");
      let src = fs.readFileSync(filename, "utf8");
      let classFile = new qx.tool.compiler.ClassFile(this.__createMetaDb(), this.__createConfig(), className, "");
      let result = classFile.compile(src, filename);
      let unresolved = (result && result.dbClassInfo && result.dbClassInfo.unresolved) || [];
      return unresolved.map(item => item.name);
    },

    /**
     * Asserts that the given fixture compiles without any unresolved symbols.
     * @param {String} className
     */
    __assertNoUnresolved(className) {
      let names = this.__unresolvedSymbolsFor(className);
      this.assertEquals(0, names.length, className + " should have no unresolved symbols, but got: " + JSON.stringify(names));
    },

    // ES6 shorthand methods in a `delegate` object (e.g. `get(property) {}`) must not
    // leave their parameters unresolved - GitHub issue #10591.
    "test delegate shorthand method parameters resolve (#10591)"() {
      this.__assertNoUnresolved("delegateShorthandMethods");
    },

    // Extending an external / unknown super class must not be flagged as unresolved -
    // GitHub issue #633.
    "test external super class resolves (#633)"() {
      this.__assertNoUnresolved("externalSuperClass");
    },

    // A labelled `for` loop with `continue label` must not treat the label as an
    // unresolved symbol - GitHub issue #519.
    "test labelled for loop resolves (#519)"() {
      this.__assertNoUnresolved("labelledForLoop");
    },

    // Labels used with `break`/`continue` across `for` and `while` loops (including a
    // `$`-prefixed label) must not be flagged as unresolved - GitHub issue #10727.
    "test labelled break/continue resolve (#10727)"() {
      this.__assertNoUnresolved("labelledBreakContinue");
    },

    // A call to an undeclared function must not crash the analyser - GitHub issue #524.
    "test call to undeclared function (#524)"() {
      this.__assertNoUnresolved("callToUndeclaredFunction");
    },

    // Array destructuring (`let [a, b] = ...`) must declare its bindings so they are not
    // unresolved - GitHub issue #726.
    "test array destructuring resolves (#726)"() {
      this.__assertNoUnresolved("arrayDestructuring");
    },

    // Object rest destructuring (`{ a, ...rest }`) in parameters and variable
    // declarations must declare its bindings - GitHub issue #10623.
    "test object rest destructuring resolves (#10623)"() {
      this.__assertNoUnresolved("objectRestDestructuring");
    },

    /**
     * Guards the test harness itself: a class referencing a genuinely unknown symbol
     * must be reported as unresolved - otherwise the assertions above would be
     * meaningless.
     */
    "test genuinely unknown symbol is reported unresolved"() {
      let src = 'qx.Class.define("badClass", { members: { main() { return new foo.bar.DoesNotExist(); } } });';
      let classFile = new qx.tool.compiler.ClassFile(this.__createMetaDb(), this.__createConfig(), "badClass", "");
      let result = classFile.compile(src, "badClass.js");
      let names = ((result.dbClassInfo && result.dbClassInfo.unresolved) || []).map(item => item.name);
      this.assert(names.indexOf("foo.bar.DoesNotExist") >= 0, "expected foo.bar.DoesNotExist to be unresolved, got: " + JSON.stringify(names));
    }
  }
});
