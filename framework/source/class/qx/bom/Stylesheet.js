/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Andreas Junghans (lucidcake)

************************************************************************ */

/* ************************************************************************

#require(qx.util.ResourceManager)

************************************************************************ */

/**
 * Cross-browser wrapper to work with CSS stylesheets.
 */
qx.Class.define("qx.bom.Stylesheet",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Include a CSS file
     *
     * @param href {String} Href value
     * @param doc? {Document} Document to modify
     * @return {void}
     */
    includeFile : function(href, doc)
    {
      if (!doc) {
        doc = document;
      }

      var el = doc.createElement("link");
      el.type = "text/css";
      el.rel = "stylesheet";
      el.href = qx.util.ResourceManager.toUri(href);

      var head = doc.getElementsByTagName("head")[0];
      head.appendChild(el);
    },


    /**
     * Create a new Stylesheet node and append it to the document
     *
     * @param text? {String} optional string of css rules
     * @return {Stylesheet} the generates stylesheet element
     * @signature function(text)
     */
    createElement : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(text)
      {
        var sheet = document.createStyleSheet();

        if (text) {
          sheet.cssText = text;
        }

        return sheet;
      },

      "default" : function(text)
      {
        var elem = document.createElement("style");
        elem.type = "text/css";

        if (text) {
          elem.appendChild(document.createTextNode(text));
        }

        document.getElementsByTagName("head")[0].appendChild(elem);
        return elem.sheet;
      }
    }),


    /**
     * Insert a new CSS rule into a given Stylesheet
     *
     * @param sheet {Object} the target Stylesheet object
     * @param selector {String} the selector
     * @param entry {String} style rule
     * @return {void}
     * @signature function(sheet, selector, entry)
     */
    addRule : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(sheet, selector, entry) {
        sheet.addRule(selector, entry);
      },

      "default" : function(sheet, selector, entry) {
        sheet.insertRule(selector + "{" + entry + "}", sheet.cssRules.length);
      }
    }),


    /**
     * Remove a CSS rule from a stylesheet
     *
     * @param sheet {Object} the Stylesheet
     * @param selector {String} the Selector of the rule to remove
     * @return {void}
     * @signature function(sheet, selector)
     */
    removeRule : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(sheet, selector)
      {
        var rules = sheet.rules;
        var len = rules.length;

        for (var i=len-1; i>=0; --i)
        {
          if (rules[i].selectorText == selector) {
            sheet.removeRule(i);
          }
        }
      },

      "default" : function(sheet, selector)
      {
        var rules = sheet.cssRules;
        var len = rules.length;

        for (var i=len-1; i>=0; --i)
        {
          if (rules[i].selectorText == selector) {
            sheet.deleteRule(i);
          }
        }
      }
    }),


    /**
     * Remove all CSS rules from a stylesheet
     *
     * @param sheet {Object} the stylesheet object
     * @return {void}
     * @signature function(sheet)
     */
    removeAllRules : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(sheet)
      {
        var rules = sheet.rules;
        var len = rules.length;

        for (var i=len-1; i>=0; i--) {
          sheet.removeRule(i);
        }
      },

      "default" : function(sheet)
      {
        var rules = sheet.cssRules;
        var len = rules.length;

        for (var i=len-1; i>=0; i--) {
          sheet.deleteRule(i);
        }
      }
    }),


    /**
     * Add an import of an external CSS file to a stylesheet
     *
     * @param sheet {Object} the stylesheet object
     * @param url {String} URL of the external stylesheet file
     * @return {void}
     * @signature function(sheet, url)
     */
    addImport : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(sheet, url) {
        sheet.addImport(url);
      },

      "default" : function(sheet, url) {
        sheet.insertRule('@import "' + url + '";', sheet.cssRules.length);
      }
    }),


    /**
     * Removes an import from a stylesheet
     *
     * @param sheet {Object} the stylesheet object
     * @param url {String} URL of the importet CSS file
     * @return {void}
     * @signature function(sheet, url)
     */
    removeImport : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(sheet, url)
      {
        var imports = sheet.imports;
        var len = imports.length;

        for (var i=len-1; i>=0; i--)
        {
          if (imports[i].href == url) {
            sheet.removeImport(i);
          }
        }
      },

      "default" : function(sheet, url)
      {
        var rules = sheet.cssRules;
        var len = rules.length;

        for (var i=len-1; i>=0; i--)
        {
          if (rules[i].href == url) {
            sheet.deleteRule(i);
          }
        }
      }
    }),


    /**
     * Remove all imports from a stylesheet
     *
     * @param sheet {Object} the stylesheet object
     * @return {void}
     * @signature function(sheet)
     */
    removeAllImports : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(sheet)
      {
        var imports = sheet.imports;
        var len = imports.length;

        for (var i=len-1; i>=0; i--) {
          sheet.removeImport(i);
        }
      },

      "default" : function(sheet)
      {
        var rules = sheet.cssRules;
        var len = rules.length;

        for (var i=len-1; i>=0; i--)
        {
          if (rules[i].type == rules[i].IMPORT_RULE) {
            sheet.deleteRule(i);
          }
        }
      }
    })
  }
});
