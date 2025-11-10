/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011-2019 The authors

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)
     * Christian Boulanger (info@bibliograph.org, @cboulanger)
   

************************************************************************ */
/**
 *  @asset(qx/tool/website/*)
 */
const fs = qx.tool.utils.Promisify.fs;
const process = require("process");
const path = require("upath");

const dot = require("dot");
require("jstransformer-dot");
const metalsmith = require("metalsmith");
const layouts = require("@metalsmith/layouts");
const markdown = require("@metalsmith/markdown");
//const filenames = require("metalsmith-filenames");
//var permalinks = require("metalsmith-permalinks");

// config
dot.templateSettings.strip = false;

qx.Class.define("qx.tool.utils.Website", {
  extend: qx.core.Object,

  statics: {
    APP_NAMESPACE: "apps"
  },

  construct(options = {}) {
    qx.core.Object.apply(this, arguments);
    const self = qx.tool.utils.Website;
    let p = qx.util.ResourceManager.getInstance().toUri("qx/tool/website/.gitignore");
    p = path.dirname(p);
    this.setSourceDir(p);
    this.setTargetDir(path.join(p, "build"));
    this.setAppsNamespace(self.APP_NAMESPACE);

    for (let key of Object.getOwnPropertyNames(options)) {
      this.set(key, options[key]);
    }
  },

  properties: {
    appsNamespace: {
      check: "String",
    },

    sourceDir: {
      check: "String",
    },

    targetDir: {
      check: "String",
    }
  },

  members: {

    /**
     * Metalsmith Plugin that collates a list of pages that are to be included in the site navigation
     * into the metadata, along with their URLs.
     *
     * If the metadata has a `sites.pages`, then it is expected to be an array of URLs which indicates
     * the ordering to be applied; `sites.pages` is replaced with an array of objects, one per page,
     * that contains `url` and `title` properties.
     *
     */
    async getPages(files, metalsmith) {
      var metadata = metalsmith.metadata();

      var pages = [];
      var order = {};
      if (metadata.site.pages) {
        metadata.site.pages.forEach((url, index) =>
          typeof url == "string" ? (order[url] = index) : null
        );
      }
      var unorderedPages = [];

      function addPage(url, title) {
        var page = {
          url: url,
          title: title
        };

        var index = order[url];
        if (index !== undefined) {
          pages[index] = page;
        } else {
          unorderedPages.push(page);
        }
      }

      for (let filename of Object.getOwnPropertyNames(files)) {
        let file = files[filename];
        if (filename === "index.html") {
          addPage("/", file.title || "Home Page");
        } else if (file.permalink || file.navigation) {
          addPage(file.permalink || filename, file.title || "Home Page");
        }
      }

      unorderedPages.forEach(page => pages.push(page));
      metadata.site.pages = pages;
    },

    /**
     * Metalsmith plugin that loads partials and adding them to the metadata.partials map.  Each file
     * is added with its filename, and if it is a .html filename is also added without the .html
     * extension.
     *
     */
    async loadPartials(files, metalsmith) {
      const metadata = metalsmith.metadata();
      const partialsDir = path.join(this.getSourceDir(), "partials");
      files = await fs.readdirAsync(partialsDir, "utf8");
      for (let filename of files) {
        let m = filename.match(/^(.+)\.([^.]+)$/);
        if (!m) {
          continue;
        }
        let [unused, name, ext] = m;
        if (unused) {
          // this is simply to avoid linting errors until https://github.com/qooxdoo/qooxdoo/issues/461 is fixed
        }
        let data = await fs.readFileAsync(
          path.join(partialsDir, filename),
          "utf8"
        );

        let fn;
        try {
          fn = dot.template(data);
        } catch (err) {
          qx.tool.compiler.Console.log(
            "Failed to load partial " + filename + ": " + err
          );

          continue;
        }
        fn.name = filename;
        metadata.partials[filename] = fn;
        if (ext === "html") {
          metadata.partials[name] = fn;
        }
      }
    },

    /**
     * Generates the site with Metalsmith
     * @returns {Promise}
     */
    async generateSite() {
      await new Promise((resolve, reject) => {
        metalsmith(this.getSourceDir())
          .metadata({
            site: {
              title: "Qooxdoo Application Server",
              description: 'Mini website used by "qx serve"',
              email: "info@qooxdoo.org",
              twitter_username: "qooxdoo",
              github_username: "qooxdoo",
              pages: ["/", "/about/"]
            },

            baseurl: "",
            url: "",
            lang: "en",
            partials: {}
          })
          .source(path.join(this.getSourceDir(), "src"))
          .destination(this.getTargetDir())
          .clean(true)
          .use(this.loadPartials.bind(this))
          .use(markdown())
          .use(this.getPages.bind(this))
          .use(
            layouts({
              engine: "dot"
            })
          )
          .build(function (err) {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
      });
    }
  }
});
