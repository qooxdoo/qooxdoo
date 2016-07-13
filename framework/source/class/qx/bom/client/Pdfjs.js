/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

   ======================================================================

   This class contains code based on the following work:

   * PluginDetect Library 0.8.7

     Homepage:
       http://www.pinlady.net/PluginDetect
       http://www.pinlady.net/PluginDetect/PDFjs/

     Copyright:
       (c) 2014, Eric Gerds

     License:
       MIT: http://www.pinlady.net/PluginDetect/license/

************************************************************************ */

/**
 * Exposes PluginDetect_PDFjs to qooxdoo.
 *
 * Contains detection for PDF.js which is a Portable Document Format (PDF)
 * viewer that is built with HTML5. PDF.js is built into Firefox 19+ and
 * used as default viewer there. You can enable/disable it via "about:config"
 * and "pdfjs.disabled" (true/false).
 *
 * As soon as there is an official way to detect this, which seems to be
 * worked on [1][2], we should switch.
 *
 * [1] https://bugzilla.mozilla.org/show_bug.cgi?id=840439
 * [2] https://bugzilla.mozilla.org/show_bug.cgi?id=558184
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 * @asset(qx/static/empty.pdf)
 */
qx.Bootstrap.define("qx.bom.client.Pdfjs",
{
  statics:
  {
    /**
     * Checks if PDF.js is available.
     *
     * @param callback {Function} The callback function which should be called.
     * @param context {Object} The context object for the callback function.
     * @internal
     */
    getPdfjs: function(callback, context) {
      qx.bom.client.Pdfjs.__isAvailable(callback, context);
    },

    /**
     * Internal helper for checking the availability of PDF.js.
     *
     * @param callback {Function} The callback function which should be called.
     * @param context {Object} The context object for the callback function.
     */
    __isAvailable: function(callback, context) {
      var resManager = qx.util.ResourceManager.getInstance();
      var urlToPdf = resManager.toUri("qx/static/empty.pdf");
      var pluginDetect = qx.bom.client.Pdfjs.__getPluginDetect();
      var pluginDetectCallback = function(PluginDetect) {
        var result = (pluginDetect.isMinVersion('PDFjs', 0) === 0);
        callback.call(context, result);
      };
      pluginDetect.onDetectionDone('PDFjs', pluginDetectCallback, urlToPdf);
    },

    /**
     * Returns the original (third-party) PluginDetect object.
     *
     * @return {Object} The PluginDetect object
     */
    __getPluginDetect: null
  },

  /**
   * Register PDF.js detection asynchronously.
   */
  defer : function(statics) {
    qx.core.Environment.addAsync("plugin.pdfjs", statics.getPdfjs);
  }
});

/**
 * @lint ignoreUnused(a, b, c, d, e, f, g, h, i, j)
 * @lint ignoreDeprecated(eval)
 */
(function() {

/**
 * Below is the original minified PluginDetect code with some minor changes:
 *
 * - beautified with http://jsbeautifier.org/
 * - wrapped code as closure to prevent leaking PluginDetect in global namespace
 * - renamed all catch vars to 'ex' because of lint warnings:
 *   - "Shadowing scoped var with catch parameter (bug#1207)"
 */
/**
 * PluginDetect v0.8.7
 * www.pinlady.net/PluginDetect/license/
 * [ getVersion isMinVersion hasMimeType onDetectionDone ]
 * [ PDF.js ]
 */
var PluginDetect = {
  version: "0.8.7",
  name: "PluginDetect",
  openTag: "<",
  hasOwnProperty: ({}).constructor.prototype.hasOwnProperty,
  hasOwn: function (c, d) {
    var a;
    try {
      a = this.hasOwnProperty.call(c, d);
    } catch (ex) {}
    return !!a;
  },
  rgx: {
    str: /string/i,
    num: /number/i,
    fun: /function/i,
    arr: /array/i,
    any: /Boolean|String|Number|Function|Array|Date|RegExp|Error/i
  },
  toString: ({}).constructor.prototype.toString,
  isPlainObject: function (c) {
    var a = this;
    if (!c || a.rgx.any.test(a.toString.call(c)) || c.window == c || a.rgx.num.test(a.toString.call(c.nodeType))) {
      return 0;
    }
    try {
      if (!a.hasOwn(c, "constructor") && !a.hasOwn(c.constructor.prototype, "isPrototypeOf")) {
        return 0;
      }
    } catch (ex) {
      return 0;
    }
    return 1;
  },
  isDefined: function (b) {
    return typeof b != "undefined";
  },
  isArray: function (b) {
    return this.rgx.arr.test(this.toString.call(b));
  },
  isString: function (b) {
    return this.rgx.str.test(this.toString.call(b));
  },
  isNum: function (b) {
    return this.rgx.num.test(this.toString.call(b));
  },
  isStrNum: function (b) {
    return this.isString(b) && (/\d/).test(b);
  },
  isFunc: function (b) {
    return this.rgx.fun.test(this.toString.call(b));
  },
  getNumRegx: /[\d][\d\.\_,\-]*/,
  splitNumRegx: /[\.\_,\-]/g,
  getNum: function (b, c) {
    var d = this,
      a = d.isStrNum(b) ? (d.isDefined(c) ? new RegExp(c) : d.getNumRegx).exec(b) : null;
    return a ? a[0] : null;
  },
  compareNums: function (h, f, d) {
    var e = this,
      c, b, a, g = parseInt;
    if (e.isStrNum(h) && e.isStrNum(f)) {
      if (e.isDefined(d) && d.compareNums) {
        return d.compareNums(h, f);
      }
      c = h.split(e.splitNumRegx);
      b = f.split(e.splitNumRegx);
      for (a = 0; a < Math.min(c.length, b.length); a++) {
        if (g(c[a], 10) > g(b[a], 10)) {
          return 1;
        }
        if (g(c[a], 10) < g(b[a], 10)) {
          return -1;
        }
      }
    }
    return 0;
  },
  formatNum: function (b, c) {
    var d = this,
      a, e;
    if (!d.isStrNum(b)) {
      return null;
    }
    if (!d.isNum(c)) {
      c = 4;
    }
    c--;
    e = b.replace(/\s/g, "").split(d.splitNumRegx).concat(["0", "0", "0", "0"]);
    for (a = 0; a < 4; a++) {
      if (/^(0+)(.+)$/.test(e[a])) {
        e[a] = RegExp.$2;
      }
      if (a > c || !(/\d/).test(e[a])) {
        e[a] = "0";
      }
    }
    return e.slice(0, 4).join(",");
  },
  getPROP: function (d, b, a) {
    try {
      if (d) {
        a = d[b];
      }
    } catch (ex) {}
    return a;
  },
  findNavPlugin: function (h) {
    if (h.dbug) {
      return h.dbug;
    }
    if (window.navigator) {
      var d = this,
        n = {
          Find: d.isString(h.find) ? new RegExp(h.find, "i") : h.find,
          Find2: d.isString(h.find2) ? new RegExp(h.find2, "i") : h.find2,
          Avoid: h.avoid ? (d.isString(h.avoid) ? new RegExp(h.avoid, "i") : h.avoid) : 0,
          Num: h.num ? /\d/ : 0
        }, f, c, g, j, m, l, b, a = navigator.mimeTypes,
        k = navigator.plugins,
        o = null;
      if (h.mimes && a) {
        m = d.isArray(h.mimes) ? [].concat(h.mimes) : (d.isString(h.mimes) ? [h.mimes] : []);
        for (f = 0; f < m.length; f++) {
          c = 0;
          try {
            if (d.isString(m[f]) && /[^\s]/.test(m[f])) {
              c = a[m[f]].enabledPlugin;
            }
          } catch (ex) {}
          if (c) {
            g = d.findNavPlugin_(c, n);
            if (g.obj) {
              o = g.obj;
            };
            if (o && !d.dbug) {
              return o;
            }
          }
        }
      }
      if (h.plugins && k) {
        l = d.isArray(h.plugins) ? [].concat(h.plugins) : (d.isString(h.plugins) ? [h.plugins] : []);
        for (f = 0; f < l.length; f++) {
          c = 0;
          try {
            if (l[f] && d.isString(l[f])) {
              c = k[l[f]];
            }
          } catch (ex) {}
          if (c) {
            g = d.findNavPlugin_(c, n);
            if (g.obj) {
              o = g.obj;
            };
            if (o && !d.dbug) {
              return o;
            }
          }
        }
        b = k.length;
        if (d.isNum(b)) {
          for (f = 0; f < b; f++) {
            c = 0;
            try {
              c = k[f];
            } catch (ex) {}
            if (c) {
              g = d.findNavPlugin_(c, n);
              if (g.obj) {
                o = g.obj;
              };
              if (o && !d.dbug) {
                return o;
              }
            }
          }
        }
      }
    }
    return o;
  },
  findNavPlugin_: function (f, d) {
    var e = this,
      c = f.description || "",
      b = f.name || "",
      a = {};
    if ((d.Find.test(c) && (!d.Find2 || d.Find2.test(b)) && (!d.Num || d.Num.test(RegExp.leftContext + RegExp.rightContext))) || (d.Find.test(b) && (!d.Find2 || d.Find2.test(c)) && (!d.Num || d.Num.test(RegExp.leftContext + RegExp.rightContext)))) {
      if (!d.Avoid || !(d.Avoid.test(c) || d.Avoid.test(b))) {
        a.obj = f;
      }
    }
    return a;
  },
  getVersionDelimiter: ",",
  findPlugin: function (d) {
    var c = this,
      b, d, a = {
        status: -3,
        plugin: 0
      };
    if (!c.isString(d)) {
      return a;
    }
    if (d.length == 1) {
      c.getVersionDelimiter = d;
      return a;
    }
    d = d.toLowerCase().replace(/\s/g, "");
    b = c.Plugins[d];
    if (!b || !b.getVersion) {
      return a;
    }
    a.plugin = b;
    a.status = 1;
    return a;
  },
  AXO: (function () {
    var b, a;
    try {
      b = new window.ActiveXObject();
    } catch (ex) {}
    return b ? null : window.ActiveXObject;
  })(),
  getAXO: function (a) {
    var d = null,
      c, b = this;
    try {
      d = new b.AXO(a);
    } catch (ex) {};
    if (d) {
      b.browser.ActiveXEnabled = !0
    }
    return d
  },
  browser: {},
  INIT: function () {
    this.init.library(this)
  },
  init: {
    $: 1,
    hasRun: 0,
    objProperties: function (d, e, c) {
      var a, b = {};
      if (e && c) {
        if (e[c[0]] === 1 && d.hasOwn(e, c[0]) && d.isPlainObject(e)) {
          for (a = 0; a < c.length; a = a + 2) {
            e[c[a]] = c[a + 1];
            b[c[a]] = 1
          }
        }
        for (a in e) {
          if (e[a] && e[a][c[0]] === 1 && d.hasOwn(e, a) && !d.hasOwn(b, a)) {
            this.objProperties(d, e[a], c)
          }
        }
      }
    },
    plugin: function (a, c) {
      var d = this,
        b = d.$;
      if (b.isPlainObject(a) && b.isFunc(a.getVersion)) {
        if (!b.isDefined(a.getVersionDone)) {
          a.installed = null;
          a.version = null;
          a.version0 = null;
          a.getVersionDone = null;
          a.pluginName = c
        }
        d.objProperties(b, a, ["$", b, "$$", a])
      }
    },
    detectIE: function () {
      var init = this,
        $ = init.$,
        browser = $.browser,
        doc = document,
        e, x, tmp, userAgent = window.navigator ? navigator.userAgent || "" : "",
        progid, progid1, progid2;
      browser.ActiveXFilteringEnabled = !1;
      browser.ActiveXEnabled = !1;
      try {
        browser.ActiveXFilteringEnabled = !! window.external.msActiveXFilteringEnabled()
      } catch (ex) {}
      progid1 = ["Msxml2.XMLHTTP", "Msxml2.DOMDocument", "Microsoft.XMLDOM", "TDCCtl.TDCCtl", "Shell.UIHelper", "HtmlDlgSafeHelper.HtmlDlgSafeHelper", "Scripting.Dictionary"];
      progid2 = ["WMPlayer.OCX", "ShockwaveFlash.ShockwaveFlash", "AgControl.AgControl"];
      progid = progid1.concat(progid2);
      for (x = 0; x < progid.length; x++) {
        if ($.getAXO(progid[x]) && !$.dbug) {
          break
        }
      }
      if (browser.ActiveXEnabled && browser.ActiveXFilteringEnabled) {
        for (x = 0; x < progid2.length; x++) {
          if ($.getAXO(progid2[x])) {
            browser.ActiveXFilteringEnabled = !1;
            break
          }
        }
      };
      tmp = doc.documentMode;
      try {
        doc.documentMode = ""
      } catch (ex) {}
      browser.isIE = browser.ActiveXEnabled || $.isNum(doc.documentMode) || eval("/*@cc_on!@*/!1");
      try {
        doc.documentMode = tmp
      } catch (ex) {};
      browser.verIE = null;
      if (browser.isIE) {
        browser.verIE = ($.isNum(doc.documentMode) && doc.documentMode >= 7 ? doc.documentMode : 0) || ((/^(?:.*?[^a-zA-Z])??(?:MSIE|rv\s*\:)\s*(\d+\.?\d*)/i).test(userAgent) ? parseFloat(RegExp.$1, 10) : 7)
      }
    },
    detectNonIE: function () {
      var f = this,
        d = this.$,
        a = d.browser,
        e = window.navigator ? navigator : {}, c = a.isIE ? "" : e.userAgent || "",
        g = e.vendor || "",
        b = e.product || "";
      a.isGecko = (/Gecko/i).test(b) && (/Gecko\s*\/\s*\d/i).test(c);
      a.verGecko = a.isGecko ? d.formatNum((/rv\s*\:\s*([\.\,\d]+)/i).test(c) ? RegExp.$1 : "0.9") : null;
      a.isChrome = (/(Chrome|CriOS)\s*\/\s*(\d[\d\.]*)/i).test(c);
      a.verChrome = a.isChrome ? d.formatNum(RegExp.$2) : null;
      a.isSafari = !a.isChrome && ((/Apple/i).test(g) || !g) && (/Safari\s*\/\s*(\d[\d\.]*)/i).test(c);
      a.verSafari = a.isSafari && (/Version\s*\/\s*(\d[\d\.]*)/i).test(c) ? d.formatNum(RegExp.$1) : null;
      a.isOpera = (/Opera\s*[\/]?\s*(\d+\.?\d*)/i).test(c);
      a.verOpera = a.isOpera && ((/Version\s*\/\s*(\d+\.?\d*)/i).test(c) || 1) ? parseFloat(RegExp.$1, 10) : null
    },
    detectPlatform: function () {
      var e = this,
        d = e.$,
        b, a = window.navigator ? navigator.platform || "" : "";
      d.OS = 100;
      if (a) {
        var c = ["Win", 1, "Mac", 2, "Linux", 3, "FreeBSD", 4, "iPhone", 21.1, "iPod", 21.2, "iPad", 21.3, "Win.*CE", 22.1, "Win.*Mobile", 22.2, "Pocket\\s*PC", 22.3, "", 100];
        for (b = c.length - 2; b >= 0; b = b - 2) {
          if (c[b] && new RegExp(c[b], "i").test(a)) {
            d.OS = c[b + 1];
            break
          }
        }
      }
    },
    library: function (b) {
      var d = this,
        c = document,
        a;
      d.objProperties(b, b, ["$", b]);
      for (a in b.Plugins) {
        if (b.hasOwn(b.Plugins, a)) {
          d.plugin(b.Plugins[a], a)
        }
      };
      b.PUBLIC.init();
      b.win.init();
      b.head = c.getElementsByTagName("head")[0] || c.getElementsByTagName("body")[0] || c.body || null;
      d.detectPlatform();
      d.detectIE();
      d.detectNonIE();
      d.hasRun = 1
    }
  },
  ev: {
    $: 1,
    handler: function (d, c, b, a) {
      return function () {
        d(c, b, a)
      }
    },
    fPush: function (b, a) {
      var c = this,
        d = c.$;
      if (d.isArray(a) && (d.isFunc(b) || (d.isArray(b) && b.length > 0 && d.isFunc(b[0])))) {
        a.push(b)
      }
    },
    call0: function (d) {
      var b = this,
        c = b.$,
        a = c.isArray(d) ? d.length : -1;
      if (a > 0 && c.isFunc(d[0])) {
        d[0](c, a > 1 ? d[1] : 0, a > 2 ? d[2] : 0, a > 3 ? d[3] : 0)
      } else {
        if (c.isFunc(d)) {
          d(c)
        }
      }
    },
    callArray0: function (a) {
      var b = this,
        d = b.$,
        c;
      if (d.isArray(a)) {
        while (a.length) {
          c = a[0];
          a.splice(0, 1);
          b.call0(c)
        }
      }
    },
    call: function (b) {
      var a = this;
      a.call0(b);
      a.ifDetectDoneCallHndlrs()
    },
    callArray: function (a) {
      var b = this;
      b.callArray0(a);
      b.ifDetectDoneCallHndlrs()
    },
    allDoneHndlrs: [],
    ifDetectDoneCallHndlrs: function () {
      var c = this,
        d = c.$,
        a, b;
      if (!c.allDoneHndlrs.length) {
        return
      }
      if (d.win) {
        if (!d.win.loaded || d.win.loadPrvtHndlrs.length || d.win.loadPblcHndlrs.length) {
          return
        }
      }
      if (d.Plugins) {
        for (a in d.Plugins) {
          b = d.Plugins[a];
          if (d.hasOwn(d.Plugins, a) && b && d.isFunc(b.getVersion)) {
            if (b.OTF == 3 || (b.DoneHndlrs && b.DoneHndlrs.length)) {
              return
            }
          }
        }
      };
      c.callArray0(c.allDoneHndlrs)
    }
  },
  PUBLIC: {
    $: 1,
    init: function () {
      var c = this,
        b = c.$,
        a;
      for (a in c) {
        if (a !== "init" && b.hasOwn(c, a) && b.isFunc(c[a])) {
          b[a] = c[a](b)
        }
      }
    },
    isMinVersion: function (b) {
      var a = function (j, h, e, d) {
        var f = b.findPlugin(j),
          g, c = -1;
        if (f.status < 0) {
          return f.status
        }
        g = f.plugin;
        h = b.formatNum(b.isNum(h) ? h.toString() : (b.isStrNum(h) ? b.getNum(h) : "0"));
        if (g.getVersionDone != 1) {
          g.getVersion(h, e, d);
          if (g.getVersionDone === null) {
            g.getVersionDone = 1
          }
        }
        if (g.installed !== null) {
          c = g.installed <= 0.5 ? g.installed : (g.installed == 0.7 ? 1 : (g.version === null ? 0 : (b.compareNums(g.version, h, g) >= 0 ? 1 : -0.1)))
        };
        return c
      };
      return a
    },
    getVersion: function (b) {
      var a = function (h, e, d) {
        var f = b.findPlugin(h),
          g, c;
        if (f.status < 0) {
          return null
        };
        g = f.plugin;
        if (g.getVersionDone != 1) {
          g.getVersion(null, e, d);
          if (g.getVersionDone === null) {
            g.getVersionDone = 1
          }
        }
        c = (g.version || g.version0);
        c = c ? c.replace(b.splitNumRegx, b.getVersionDelimiter) : c;
        return c
      };
      return a
    },
    onDetectionDone: function (b) {
      var a = function (j, h, d, c) {
        var e = b.findPlugin(j),
          k, g;
        if (e.status == -3) {
          return -1
        }
        g = e.plugin;
        if (!b.isArray(g.DoneHndlrs)) {
          g.DoneHndlrs = []
        };
        if (g.getVersionDone != 1) {
          k = b.getVersion ? b.getVersion(j, d, c) : b.isMinVersion(j, "0", d, c)
        }
        if (g.installed != -0.5 && g.installed != 0.5) {
          b.ev.call(h);
          return 1
        }
        b.ev.fPush(h, g.DoneHndlrs);
        return 0
      };
      return a
    },
    hasMimeType: function (b) {
      var a = function (h) {
        if (h && window.navigator && navigator.mimeTypes) {
          var l, k, d, j, g, c = navigator.mimeTypes,
            f = b.isArray(h) ? [].concat(h) : (b.isString(h) ? [h] : []);
          g = f.length;
          for (d = 0; d < g; d++) {
            l = 0;
            try {
              if (b.isString(f[d]) && /[^\s]/.test(f[d])) {
                l = c[f[d]]
              }
            } catch (ex) {}
            k = l ? l.enabledPlugin : 0;
            if (k && (k.name || k.description)) {
              return l
            }
          }
        };
        return null
      };
      return a
    },
    z: 0
  },
  win: {
    $: 1,
    loaded: false,
    hasRun: 0,
    init: function () {
      var b = this,
        a = b.$;
      if (!b.hasRun) {
        b.hasRun = 1;
        b.onLoad = a.ev.handler(b.$$onLoad, a);
        b.onUnload = a.ev.handler(b.$$onUnload, a);
        b.addEvent("load", b.onLoad);
        b.addEvent("unload", b.onUnload)
      }
    },
    addEvent: function (c, b) {
      var e = this,
        d = e.$,
        a = window;
      if (d.isFunc(b)) {
        if (a.addEventListener) {
          a.addEventListener(c, b, false)
        } else {
          if (a.attachEvent) {
            a.attachEvent("on" + c, b)
          } else {
            a["on" + c] = e.concatFn(b, a["on" + c])
          }
        }
      }
    },
    concatFn: function (d, c) {
      return function () {
        d();
        if (typeof c == "function") {
          c()
        }
      }
    },
    loadPrvtHndlrs: [],
    loadPblcHndlrs: [],
    unloadHndlrs: [],
    $$onUnload: function (b) {
      if (b && b.win) {
        b.ev.callArray(b.win.unloadHndlrs);
        for (var a in b) {
          b[a] = 0
        }
        b = 0
      }
    },
    count: 0,
    countMax: 1,
    intervalLength: 10,
    $$onLoad: function (a) {
      if (!a || a.win.loaded) {
        return
      }
      var b = a.win;
      if (b.count < b.countMax && b.loadPrvtHndlrs.length) {
        setTimeout(b.onLoad, b.intervalLength)
      } else {
        b.loaded = true;
        a.ev.callArray(b.loadPrvtHndlrs);
        a.ev.callArray(b.loadPblcHndlrs)
      }
      b.count++
    }
  },
  DOM: {
    $: 1,
    isEnabled: {
      $: 1,
      objectTag: function () {
        var a = this.$;
        return a.browser.isIE ? a.browser.ActiveXEnabled : 1
      },
      objectTagUsingActiveX: function () {
        return this.$.browser.ActiveXEnabled
      },
      objectProperty: function () {
        var a = this.$;
        return a.browser.isIE && a.browser.verIE >= 7 ? 1 : 0
      }
    },
    div: null,
    divID: "plugindetect",
    divWidth: 300,
    getDiv: function () {
      var a = this;
      return a.div || document.getElementById(a.divID) || null
    },
    initDiv: function () {
      var b = this,
        c = b.$,
        a;
      if (!b.div) {
        a = b.getDiv();
        if (a) {
          b.div = a
        } else {
          b.div = document.createElement("div");
          b.div.id = b.divID;
          b.setStyle(b.div, b.getStyle.div());
          b.insertDivInBody(b.div)
        }
        c.ev.fPush([b.onWinUnloadEmptyDiv, b], c.win.unloadHndlrs)
      }
    },
    pluginSize: 1,
    altHTML: "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",
    emptyNode: function (c) {
      var b = this,
        d = b.$,
        a;
      if (c && (/div|span/i).test(c.tagName || "")) {
        if (d.browser.isIE) {
          b.setStyle(c, ["display", "none"])
        }
        try {
          c.innerHTML = ""
        } catch (ex) {}
      }
    },
    onWinUnloadEmptyDiv: function (f, d) {
      var b = d.getDiv(),
        a, c;
      if (b) {
        if (b.childNodes) {
          for (a = b.childNodes.length - 1; a >= 0; a--) {
            c = b.childNodes[a];
            d.emptyNode(c)
          }
          try {
            b.innerHTML = ""
          } catch (ex) {}
        }
        if (b.parentNode) {
          try {
            b.parentNode.removeChild(b)
          } catch (ex) {}
          b = null;
          d.div = null
        }
      }
    },
    width: function () {
      var g = this,
        e = g.DOM,
        f = e.$,
        d = g.span,
        b, c, a = -1;
      b = d && f.isNum(d.scrollWidth) ? d.scrollWidth : a;
      c = d && f.isNum(d.offsetWidth) ? d.offsetWidth : a;
      return c > 0 ? c : (b > 0 ? b : Math.max(c, b))
    },
    obj: function (b) {
      var d = this,
        c = d.span,
        a = c && c.firstChild ? c.firstChild : null;
      return a
    },
    readyState: function () {
      var b = this,
        a = b.DOM.$;
      return a.browser.isIE && a.isDefined(a.getPROP(b.span, "readyState")) ? a.getPROP(b.obj(), "readyState") : b.undefined
    },
    objectProperty: function () {
      var d = this,
        b = d.DOM,
        c = b.$,
        a;
      if (b.isEnabled.objectProperty()) {
        a = c.getPROP(d.obj(), "object")
      }
      return a
    },
    getTagStatus: function (b, m, r, p, f, h) {
      var s = this,
        d = s.$;
      if (!b || !b.span) {
        return -2
      }
      var k = b.width(),
        c = b.readyState(),
        a = b.objectProperty();
      if (a) {
        return 1.5
      }
      var g = /clsid\s*\:/i,
        o = r && g.test(r.outerHTML || "") ? r : (p && g.test(p.outerHTML || "") ? p : 0),
        i = r && !g.test(r.outerHTML || "") ? r : (p && !g.test(p.outerHTML || "") ? p : 0),
        l = b && g.test(b.outerHTML || "") ? o : i;
      if (!m || !m.span || !l || !l.span) {
        return 0
      }
      var j = l.width(),
        n = m.width(),
        t = l.readyState();
      if (k < 0 || j < 0 || n <= s.pluginSize) {
        return 0
      }
      if (h && !b.pi && d.isDefined(a) && d.browser.isIE && b.tagName == l.tagName && b.time <= l.time && k === j && c === 0 && t !== 0) {
        b.pi = 1
      }
      if (j < n) {
        return b.pi ? -0.1 : 0
      }
      if (k >= n) {
        if (!b.winLoaded && d.win.loaded) {
          return b.pi ? -0.5 : -1
        }
        if (d.isNum(f)) {
          if (!d.isNum(b.count2)) {
            b.count2 = f
          }
          if (f - b.count2 > 0) {
            return b.pi ? -0.5 : -1
          }
        }
      }
      try {
        if (k == s.pluginSize && (!d.browser.isIE || c === 4)) {
          if (!b.winLoaded && d.win.loaded) {
            return 1
          }
          if (b.winLoaded && d.isNum(f)) {
            if (!d.isNum(b.count)) {
              b.count = f
            }
            if (f - b.count >= 5) {
              return 1
            }
          }
        }
      } catch (ex) {}
      return b.pi ? -0.1 : 0
    },
    setStyle: function (b, h) {
      var c = this,
        d = c.$,
        g = b.style,
        a;
      if (g && h) {
        for (a = 0; a < h.length; a = a + 2) {
          try {
            g[h[a]] = h[a + 1]
          } catch (ex) {}
        }
      }
    },
    getStyle: {
      $: 1,
      span: function () {
        var a = this.$.DOM;
        return [].concat(this.Default).concat(["display", "inline", "fontSize", (a.pluginSize + 3) + "px", "lineHeight", (a.pluginSize + 3) + "px"])
      },
      div: function () {
        var a = this.$.DOM;
        return [].concat(this.Default).concat(["display", "block", "width", a.divWidth + "px", "height", (a.pluginSize + 3) + "px", "fontSize", (a.pluginSize + 3) + "px", "lineHeight", (a.pluginSize + 3) + "px", "position", "absolute", "right", "9999px", "top", "-9999px"])
      },
      plugin: function (b) {
        var a = this.$.DOM;
        return "background-color:transparent;background-image:none;vertical-align:baseline;outline-style:none;border-style:none;padding:0px;margin:0px;visibility:" + (b ? "hidden;" : "visible;") + "display:inline;font-size:" + (a.pluginSize + 3) + "px;line-height:" + (a.pluginSize + 3) + "px;"
      },
      Default: ["backgroundColor", "transparent", "backgroundImage", "none", "verticalAlign", "baseline", "outlineStyle", "none", "borderStyle", "none", "padding", "0px", "margin", "0px", "visibility", "visible"]
    },
    insertDivInBody: function (a, h) {
      var j = this,
        d = j.$,
        b = "pd33993399",
        c = null,
        i = h ? window.top.document : window.document,
        f = i.getElementsByTagName("body")[0] || i.body;
      if (!f) {
        try {
          i.write('<div id="' + b + '">.' + d.openTag + "/div>");
          c = i.getElementById(b)
        } catch (ex) {}
      }
      f = i.getElementsByTagName("body")[0] || i.body;
      if (f) {
        f.insertBefore(a, f.firstChild);
        if (c) {
          f.removeChild(c)
        }
      }
    },
    insert: function (b, i, g, h, c, p, n) {
      var r = this,
        f = r.$,
        s = document,
        u, l, o = s.createElement("span"),
        j, a;
      if (!f.isDefined(h)) {
        h = ""
      }
      if (f.isString(b) && (/[^\s]/).test(b)) {
        b = b.toLowerCase().replace(/\s/g, "");
        u = f.openTag + b + " ";
        u += 'style="' + r.getStyle.plugin(p) + '" ';
        var k = 1,
          t = 1;
        for (j = 0; j < i.length; j = j + 2) {
          if (/[^\s]/.test(i[j + 1])) {
            u += i[j] + '="' + i[j + 1] + '" '
          }
          if ((/width/i).test(i[j])) {
            k = 0
          }
          if ((/height/i).test(i[j])) {
            t = 0
          }
        }
        u += (k ? 'width="' + r.pluginSize + '" ' : "") + (t ? 'height="' + r.pluginSize + '" ' : "");
        u += ">";
        for (j = 0; j < g.length; j = j + 2) {
          if (/[^\s]/.test(g[j + 1])) {
            u += f.openTag + 'param name="' + g[j] + '" value="' + g[j + 1] + '" />'
          }
        }
        u += h + f.openTag + "/" + b + ">"
      } else {
        b = "";
        u = h
      } if (!n) {
        r.initDiv()
      }
      var m = n || r.getDiv();
      l = {
        span: null,
        winLoaded: f.win.loaded,
        tagName: b,
        outerHTML: u,
        DOM: r,
        time: new Date().getTime(),
        width: r.width,
        obj: r.obj,
        readyState: r.readyState,
        objectProperty: r.objectProperty
      };
      if (m && m.parentNode) {
        r.setStyle(o, r.getStyle.span());
        m.appendChild(o);
        try {
          o.innerHTML = u
        } catch (ex) {};
        l.span = o;
        l.winLoaded = f.win.loaded
      }
      return l
    }
  },
  file: {
    $: 1,
    any: "fileStorageAny999",
    valid: "fileStorageValid999",
    save: function (d, f, c) {
      var b = this,
        e = b.$,
        a;
      if (d && e.isDefined(c)) {
        if (!d[b.any]) {
          d[b.any] = []
        }
        if (!d[b.valid]) {
          d[b.valid] = []
        }
        d[b.any].push(c);
        a = b.split(f, c);
        if (a) {
          d[b.valid].push(a)
        }
      }
    },
    getValidLength: function (a) {
      return a && a[this.valid] ? a[this.valid].length : 0
    },
    getAnyLength: function (a) {
      return a && a[this.any] ? a[this.any].length : 0
    },
    getValid: function (c, a) {
      var b = this;
      return c && c[b.valid] ? b.get(c[b.valid], a) : null
    },
    getAny: function (c, a) {
      var b = this;
      return c && c[b.any] ? b.get(c[b.any], a) : null
    },
    get: function (d, a) {
      var c = d.length - 1,
        b = this.$.isNum(a) ? a : c;
      return (b < 0 || b > c) ? null : d[b]
    },
    split: function (g, c) {
      var b = this,
        e = b.$,
        f = null,
        a, d;
      g = g ? g.replace(".", "\\.") : "";
      d = new RegExp("^(.*[^\\/])(" + g + "\\s*)$");
      if (e.isString(c) && d.test(c)) {
        a = (RegExp.$1).split("/");
        f = {
          name: a[a.length - 1],
          ext: RegExp.$2,
          full: c
        };
        a[a.length - 1] = "";
        f.path = a.join("/")
      }
      return f
    },
    z: 0
  },
  Plugins: {
    pdfjs: {
      $: 1,
      OTF: null,
      setPluginStatus: function () {
        var b = this,
          c = b.$,
          d = b.doc.result,
          a = b.OTF;
        b.version = null;
        if (a == 3) {
          b.installed = -0.5
        } else {
          b.installed = d > 0 ? 0 : -1
        } if (b.verify && b.verify.isEnabled()) {
          b.getVersionDone = 0
        } else {
          if (b.getVersionDone != 1) {
            b.getVersionDone = (b.installed == -0.5 || (b.installed == -1 && b.doc.isDisabled() < 2)) ? 0 : 1
          }
        }
      },
      getVersion: function (c, b) {
        var d = this,
          e = d.$,
          a = false,
          g = d.verify,
          h = d.NOTF,
          f = d.doc;
        if (d.getVersionDone === null) {
          d.OTF = 0;
          if (g) {
            g.init()
          }
        }
        e.file.save(d, ".pdf", b);
        if (d.getVersionDone === 0) {
          if (g && g.isEnabled() && e.isNum(d.installed) && d.installed >= 0) {
            return
          }
        }
        if ((!a || e.dbug) && f.insertHTMLQuery() > 0) {
          a = true
        }
        d.setPluginStatus()
      },
      doc: {
        $: 1,
        result: 0,
        mimeType: "application/pdf",
        mimeType_dummy: "application/dummymimepdf",
        DummySpanTagHTML: 0,
        HTML: 0,
        DummyObjTagHTML1: 0,
        isDisabled: function () {
          var f = this,
            e = f.$,
            d = f.$$,
            c = 0,
            a = e.browser,
            b;
          if (d.OTF >= 2) {
            c = 2
          } else {
            if (!e.DOM.isEnabled.objectTag() || !a.isGecko || e.compareNums(a.verGecko, e.formatNum("10")) < 0 || (e.compareNums(a.verGecko, e.formatNum("19")) < 0 && e.hasMimeType(f.mimeType))) {
              if (!e.dbug) {
                c = 2
              }
            }
          } if (c < 2) {
            b = e.file.getValid(d);
            if (!b || !b.full) {
              c = 1
            }
          }
          return c
        },
        tabIndex: null,
        method: "",
        queryObject: function (b) {
          var j = this,
            f = j.$,
            g = j.$$,
            d = j.HTML ? j.HTML.obj() : 0,
            a, l, c, i, k = f.dbug && !f.win.loaded ? 0 : 1;
          a = f.DOM.getTagStatus(j.HTML, j.DummySpanTagHTML, j.DummyObjTagHTML1, 0, b);
          if ((!j.result || f.dbug) && a < 0) {
            if (k) {
              j.result = -1
            }
            j.method += "1,"
          }
          if ((!j.result || f.dbug) && a > 0 && !f.hasMimeType(j.mimeType)) {
            if (k) {
              j.result = 1
            }
            j.method += "2,"
          }
          try {
            l = d ? d.tabIndex : null
          } catch (ex) {}
          if (!f.isNum(j.tabIndex) && f.isNum(l)) {
            j.tabIndex = l
          }
          if ((!j.result || f.dbug) && a > 0 && f.isNum(l) && f.isNum(j.tabIndex) && j.tabIndex !== l) {
            if (k) {
              j.result = 1
            }
            j.method += "4,"
          };
          return j.result
        },
        insertHTMLQuery: function () {
          var g = this,
            f = g.$,
            d = g.$$,
            c, b, e = 1,
            a = f.DOM.altHTML;
          if (g.isDisabled()) {
            return g.result
          }
          if (d.OTF < 2) {
            d.OTF = 2
          }
          b = f.file.getValid(d).full;
          if (!g.DummySpanTagHTML) {
            g.DummySpanTagHTML = f.DOM.insert("", [], [], a, d, e)
          }
          if (!g.HTML) {
            g.HTML = f.DOM.insert("object", ["type", g.mimeType, "data", b], ["src", b], a, d, e)
          }
          if (!g.DummyObjTagHTML1) {
            g.DummyObjTagHTML1 = f.DOM.insert("object", ["type", g.mimeType_dummy], [], a, d, e)
          }
          g.queryObject();
          if ((g.result > 0 || g.result < 0) && !f.dbug) {
            return g.result
          }
          d.NOTF.init();
          return g.result
        }
      },
      NOTF: {
        $: 1,
        count: 0,
        countMax: 25,
        intervalLength: 250,
        init: function () {
          var d = this,
            b = d.$,
            a = d.$$,
            c = a.doc;
          if (a.OTF < 3 && c.HTML) {
            a.OTF = 3;
            d.onIntervalQuery = b.ev.handler(d.$$onIntervalQuery, d);
            if (!b.win.loaded) {
              b.win.loadPrvtHndlrs.push([d.onWinLoadQuery, d])
            }
            setTimeout(d.onIntervalQuery, d.intervalLength)
          }
        },
        $$onIntervalQuery: function (d) {
          var b = d.$,
            a = d.$$,
            c = a.doc;
          if (a.OTF == 3) {
            c.queryObject(d.count);
            if (c.result || (b.win.loaded && d.count > d.countMax)) {
              d.queryCompleted()
            }
          }
          d.count++;
          if (a.OTF == 3) {
            setTimeout(d.onIntervalQuery, d.intervalLength)
          }
        },
        onWinLoadQuery: function (b, d) {
          var a = d.$$,
            c = a.doc;
          if (a.OTF == 3) {
            c.queryObject(d.count);
            d.queryCompleted()
          }
        },
        queryCompleted: function () {
          var d = this,
            b = d.$,
            a = d.$$,
            c = a.doc;
          if (a.OTF == 4) {
            return
          }
          a.OTF = 4;
          a.setPluginStatus();
          if (b.onDetectionDone && a.DoneHndlrs) {
            b.ev.callArray(a.DoneHndlrs)
          }
        }
      },
      zz: 0
    },
    zz: 0
  }
};
PluginDetect.INIT();
/**
 * End of original code.
 */

  var origPluginDetect = PluginDetect;

  // Expose to qooxdoo
  qx.bom.client.Pdfjs.__getPluginDetect = function() {
    return origPluginDetect;
  };

}).call(this);

