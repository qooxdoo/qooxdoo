/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * Tests how the resource manager and the SCSS compiler find the library of
 * an absolute filename when library directories are nested, like the
 * application and the libraries in its `qx_packages/` directory.
 *
 * @ignore(require)
 */
qx.Class.define("qx.test.compiler.LibraryForFile", {
  extend: qx.dev.unit.TestCase,

  members: {
    __path: null,
    __root: null,
    __libraries: null,

    setUp() {
      this.__path = require("upath");
      this.__root = this.__path.resolve("/work/app");

      // The application library is listed first, as the compiler does
      this.__libraries = [
        this.__createLibrary("app", "."),
        this.__createLibrary("pkg", "qx_packages/pkg"),
        this.__createLibrary("pkg2", "qx_packages/pkg2")
      ];
    },

    __createLibrary(namespace, rootDir) {
      let library = new qx.tool.compiler.app.Library();
      library.set({
        namespace: namespace,
        rootDir: this.__path.join(this.__root, rootDir),
        resourcePath: "source/resource",
        themePath: "source/theme"
      });

      return library;
    },

    __createAnalyser() {
      let libraries = this.__libraries;
      return {
        getResDbFilename: () => null,
        getLibraries: () => libraries
      };
    },

    __findForResource(filename) {
      let manager = new qx.tool.compiler.resources.Manager(this.__createAnalyser());

      return manager.findLibrariesForResource(this.__path.join(this.__root, filename)).map(library => library.getNamespace());
    },

    __analyseScssUrl(url, currentFilename) {
      let analyser = this.__createAnalyser();
      let scssFile = new qx.tool.compiler.resources.ScssFile({ getAnalyser: () => analyser }, this.__libraries[0], "unused.scss");

      return scssFile._analyseFilename(url, this.__path.join(this.__root, currentFilename));
    },

    testResourceInApplication() {
      this.assertArrayEquals(["app"], this.__findForResource("source/resource/app/logo.png"));
    },

    testResourceInPackage() {
      this.assertArrayEquals(["pkg"], this.__findForResource("qx_packages/pkg/source/resource/pkg/logo.png"));
    },

    testResourceInPackageWithSharedPrefix() {
      this.assertArrayEquals(["pkg2"], this.__findForResource("qx_packages/pkg2/source/resource/pkg2/logo.png"));
    },

    testResourceOutsideLibraries() {
      this.assertArrayEquals([], this.__findForResource("../other/source/resource/logo.png"));
    },

    testResourceInDirectoryWithSharedPrefix() {
      this.assertArrayEquals([], this.__findForResource("../application/source/resource/logo.png"));
    },

    testScssImportInApplication() {
      let result = this.__analyseScssUrl("_colors.scss", "source/resource/app/scss/main.scss");

      this.assertEquals("app", result.namespace);
      this.assertEquals("app/scss/_colors.scss", result.filename);
    },

    testScssImportInPackage() {
      let result = this.__analyseScssUrl("_colors.scss", "qx_packages/pkg/source/resource/pkg/scss/main.scss");

      this.assertEquals("pkg", result.namespace);
      this.assertEquals("pkg/scss/_colors.scss", result.filename);
    }
  }
});
