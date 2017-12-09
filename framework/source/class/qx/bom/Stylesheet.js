/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Andreas Junghans (lucidcake)

************************************************************************ */

/**
 * Cross-browser wrapper to work with CSS stylesheets.
 * @require(qx.bom.client.Stylesheet)
 */
qx.Bootstrap.define("qx.bom.Stylesheet",
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
     * <em>Note:</em> Using a resource ID as the <code>href</code> parameter
     * will no longer be supported. Call
     * <code>qx.util.ResourceManager.getInstance().toUri(href)</code> to get
     * valid URI to be used with this method.
     *
     * @param href {String} Href value
     * @param doc {Document?} Document to modify
     */
    includeFile : function(href, doc)
    {
      if (!doc) {
        doc = document;
      }

      var el = doc.createElement("link");
      el.type = "text/css";
      el.rel = "stylesheet";
      el.href = href;

      var head = doc.getElementsByTagName("head")[0];
      head.appendChild(el);
    },


    /**
     * Create a new Stylesheet node and append it to the document
     *
     * @param text {String?} optional string of css rules
     * @return {Stylesheet} the generates stylesheet element
     */
    createElement : function(text)
    {
      if (qx.core.Environment.get("html.stylesheet.createstylesheet")) {
        var sheet = document.createStyleSheet();

        if (text) {
          sheet.cssText = text;
        }

        return sheet;
      }
      else {
        var elem = document.createElement("style");
        elem.type = "text/css";

        if (text) {
          elem.appendChild(document.createTextNode(text));
        }

        document.getElementsByTagName("head")[0].appendChild(elem);
        return elem.sheet;
      }
    },


    /**
     * Insert a new CSS rule into a given Stylesheet
     *
     * @param sheet {Object} the target Stylesheet object
     * @param selector {String} the selector
     * @param entry {String} style rule
     */
    addRule : function(sheet, selector, entry)
    {
      if (qx.core.Environment.get('qx.debug')) {
        var msg = "qx.bom.Stylesheet.addRule: The rule '" + entry + "' for the selector '" + selector +
        "' must not be enclosed in braces";
        qx.core.Assert.assertFalse(/^\s*?\{.*?\}\s*?$/.test(entry), msg);
      }

      if (qx.core.Environment.get("html.stylesheet.insertrule")) {
        sheet.insertRule(selector + "{" + entry + "}", sheet.cssRules.length);
      }
      else {
        sheet.addRule(selector, entry);
      }
    },


    /**
     * Remove a CSS rule from a stylesheet
     *
     * @param sheet {Object} the Stylesheet
     * @param selector {String} the Selector of the rule to remove
     */
    removeRule : function(sheet, selector)
    {
      if (qx.core.Environment.get("html.stylesheet.deleterule")) {
        var rules = sheet.cssRules;
        var len = rules.length;

        for (var i=len-1; i>=0; --i)
        {
          if (rules[i].selectorText == selector) {
            sheet.deleteRule(i);
          }
        }
      }
      else {
        var rules = sheet.rules;
        var len = rules.length;

        for (var i=len-1; i>=0; --i)
        {
          if (rules[i].selectorText == selector) {
            sheet.removeRule(i);
          }
        }
      }
    },


    /**
     * Remove the given sheet from its owner.
     * @param sheet {Object} the stylesheet object
     */
    removeSheet : function(sheet) {
      var owner = sheet.ownerNode ? sheet.ownerNode : sheet.owningElement;
      qx.dom.Element.removeChild(owner, owner.parentNode);
    },


    /**
     * Remove all CSS rules from a stylesheet
     *
     * @param sheet {Object} the stylesheet object
     */
    removeAllRules : function(sheet)
    {
      if (qx.core.Environment.get("html.stylesheet.deleterule")) {
        var rules = sheet.cssRules;
        var len = rules.length;

        for (var i=len-1; i>=0; i--) {
          sheet.deleteRule(i);
        }
      } else {
        var rules = sheet.rules;
        var len = rules.length;

        for (var i=len-1; i>=0; i--) {
          sheet.removeRule(i);
        }
      }
    },


    /**
     * Add an import of an external CSS file to a stylesheet
     *
     * @param sheet {Object} the stylesheet object
     * @param url {String} URL of the external stylesheet file
     */
    addImport : function(sheet, url)
    {
      if (qx.core.Environment.get("html.stylesheet.addimport")) {
        sheet.addImport(url);
      }
      else {
        sheet.insertRule('@import "' + url + '";', sheet.cssRules.length);
      }
    },


    /**
     * Removes an import from a stylesheet
     *
     * @param sheet {Object} the stylesheet object
     * @param url {String} URL of the imported CSS file
     */
    removeImport : function(sheet, url)
    {
      if (qx.core.Environment.get("html.stylesheet.removeimport")) {
        var imports = sheet.imports;
        var len = imports.length;

        for (var i=len-1; i>=0; i--)
        {
          if (imports[i].href == url ||
          imports[i].href == qx.util.Uri.getAbsolute(url))
          {
            sheet.removeImport(i);
          }
        }
      }
      else {
        var rules = sheet.cssRules;
        var len = rules.length;

        for (var i=len-1; i>=0; i--)
        {
          if (rules[i].href == url) {
            sheet.deleteRule(i);
          }
        }
      }
    },


    /**
     * Remove all imports from a stylesheet
     *
     * @param sheet {Object} the stylesheet object
     */
    removeAllImports : function(sheet)
    {
      if (qx.core.Environment.get("html.stylesheet.removeimport")) {
        var imports = sheet.imports;
        var len = imports.length;

        for (var i=len-1; i>=0; i--) {
          sheet.removeImport(i);
        }
      }
      else {
        var rules = sheet.cssRules;
        var len = rules.length;

        for (var i=len-1; i>=0; i--)
        {
          if (rules[i].type == rules[i].IMPORT_RULE) {
            sheet.deleteRule(i);
          }
        }
      }
    }
  }
});
