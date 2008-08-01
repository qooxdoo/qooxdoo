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

#module(ui_core)

************************************************************************ */

qx.Class.define("qx.legacy.html.StyleSheet",
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
     * @param vHref {String} Href value
     * @return {void}
     */
    includeFile : function(vHref)
    {
      var el = document.createElement("link");
      el.type = "text/css";
      el.rel = "stylesheet";
      el.href = vHref;

      var head = document.getElementsByTagName("head")[0];
      head.appendChild(el);
    },


    /**
     * create a new Stylesheet node and append it to the document
     *
     * @param vCssText {String} optional string of css rules
     * @return {Stylesheet} stylesheet object
     * @signature function(vCssText)
     */
    createElement : qx.lang.Object.select(document.createStyleSheet ? "ie4+" : "other",
    {
      "ie4+" : function(vCssText)
      {
        var vSheet = document.createStyleSheet();

        if (vCssText) {
          vSheet.cssText = vCssText;
        }

        return vSheet;
      },

      "other" : function(vCssText)
      {
        var vElement = document.createElement("style");
        vElement.type = "text/css";

        // Safari 2.0 doesn't like empty stylesheets
        vElement.appendChild(document.createTextNode(vCssText || "body {}"));

        document.getElementsByTagName("head")[0].appendChild(vElement);

        if (vElement.sheet) {
          return vElement.sheet;
        }
        else
        {
          // Safari 2.0 doesn't support element.sheet so we neet a workaround
          var styles = document.styleSheets;

          for (var i=styles.length-1; i>=0; i--)
          {
            if (styles[i].ownerNode == vElement) {
              return styles[i];
            }
          }
        }

        throw "Error: Could not get a reference to the sheet object";
      }
    }),


    /**
     * insert a new CSS rule into a given Stylesheet
     *
     * @param vSheet {Object} the target Stylesheet object
     * @param vSelector {String} the selector
     * @param vStyle {String} style rule
     * @return {void}
     * @signature function(vSheet, vSelector, vStyle)
     */
    addRule : qx.lang.Object.select(document.createStyleSheet ? "ie4+" : "other",
    {
      "ie4+" : function(vSheet, vSelector, vStyle) {
        vSheet.addRule(vSelector, vStyle);
      },

      "other" : qx.lang.Object.select(qx.legacy.core.Client.getInstance().isSafari2() ? "safari2" : "other",
      {
        "safari2+" : function(vSheet, vSelector, vStyle)
        {
          // insertRule in Safari 2 doesn't work
          if (!vSheet._qxRules) {
            vSheet._qxRules = {};
          }

          if (!vSheet._qxRules[vSelector])
          {
            var ruleNode = document.createTextNode(vSelector + "{" + vStyle + "}");
            vSheet.ownerNode.appendChild(ruleNode);
            vSheet._qxRules[vSelector] = ruleNode;
          }
        },

        "other" : function(vSheet, vSelector, vStyle) {
          vSheet.insertRule(vSelector + "{" + vStyle + "}", vSheet.cssRules.length);
        }
      })
    }),


    /**
     * remove a CSS rule from a stylesheet
     *
     * @param vSheet {Object} the Stylesheet
     * @param vSelector {String} the Selector of the rule to remove
     * @return {void}
     * @signature function(vSheet, vSelector)
     */
    removeRule : qx.lang.Object.select(document.createStyleSheet ? "ie4+" : "other",
    {
      "ie4+" : function(vSheet, vSelector)
      {
        var vRules = vSheet.rules;
        var vLength = vRules.length;

        for (var i=vLength-1; i>=0; i--)
        {
          if (vRules[i].selectorText == vSelector) {
            vSheet.removeRule(i);
          }
        }
      },

      "other" : qx.lang.Object.select(qx.legacy.core.Client.getInstance().isSafari2() ? "safari2" : "other",
      {
        "safari2+" : function(vSheet, vSelector)
        {
          var warn = function() {
            qx.log.Logger.ROOT_LOGGER.warn("In Safari/Webkit you can only remove rules that are created using qx.legacy.html.StyleSheet.addRule");
          };

          if (!vSheet._qxRules) {
            warn();
          }

          var ruleNode = vSheet._qxRules[vSelector];

          if (ruleNode)
          {
            vSheet.ownerNode.removeChild(ruleNode);
            vSheet._qxRules[vSelector] = null;
          }
          else
          {
            warn();
          }
        },

        "other" : function(vSheet, vSelector)
        {
          var vRules = vSheet.cssRules;
          var vLength = vRules.length;

          for (var i=vLength-1; i>=0; i--)
          {
            if (vRules[i].selectorText == vSelector) {
              vSheet.deleteRule(i);
            }
          }
        }
      })
    }),


    /**
     * remove all CSS rules from a stylesheet
     *
     * @param vSheet {Object} the stylesheet object
     * @return {void}
     * @signature function(vSheet)
     */
    removeAllRules : qx.lang.Object.select(document.createStyleSheet ? "ie4+" : "other",
    {
      "ie4+" : function(vSheet)
      {
        var vRules = vSheet.rules;
        var vLength = vRules.length;

        for (var i=vLength-1; i>=0; i--) {
          vSheet.removeRule(i);
        }
      },

      "other" : qx.lang.Object.select(qx.legacy.core.Client.getInstance().isSafari2() ? "safari2" : "other",
      {
        "safari2+" : function(vSheet)
        {
          var node = vSheet.ownerNode;
          var rules = node.childNodes;

          while (rules.length > 0) {
            node.removeChild(rules[0]);
          }
        },

        "other" : function(vSheet)
        {
          var vRules = vSheet.cssRules;
          var vLength = vRules.length;

          for (var i=vLength-1; i>=0; i--) {
            vSheet.deleteRule(i);
          }
        }
      })
    }),


    // TODO import functions are not working crossbrowser (Safari) !!
    // see CSS_1.html test
    /**
     * add an import of an external CSS file to a stylesheet
     *
     * @param vSheet {Object} the stylesheet object
     * @param vUrl {String} URL of the external stylesheet file
     * @return {void}
     * @signature function(vSheet, vUrl)
     */
    addImport : qx.lang.Object.select(document.createStyleSheet ? "ie4+" : "other",
    {
      "ie4+" : function(vSheet, vUrl) {
        vSheet.addImport(vUrl);
      },

      "other" : qx.lang.Object.select(qx.legacy.core.Client.getInstance().isSafari2() ? "safari2" : "other",
      {
        "safari2+" : function(vSheet, vUrl) {
          vSheet.ownerNode.appendChild(document.createTextNode('@import "' + vUrl + '";'));
        },

        "other" : function(vSheet, vUrl) {
          vSheet.insertRule('@import "' + vUrl + '";', vSheet.cssRules.length);
        }
      })
    }),


    /**
     * removes an import from a stylesheet
     *
     * @param vSheet {Object} the stylesheet object
     * @param vUrl {String} URL of the importet CSS file
     * @return {void}
     * @signature function(vSheet, vUrl)
     */
    removeImport : qx.lang.Object.select(document.createStyleSheet ? "ie4+" : "other",
    {
      "ie4+" : function(vSheet, vUrl)
      {
        var vImports = vSheet.imports;
        var vLength = vImports.length;

        for (var i=vLength-1; i>=0; i--)
        {
          if (vImports[i].href == vUrl) {
            vSheet.removeImport(i);
          }
        }
      },

      "other" : function(vSheet, vUrl)
      {
        var vRules = vSheet.cssRules;
        var vLength = vRules.length;

        for (var i=vLength-1; i>=0; i--)
        {
          if (vRules[i].href == vUrl) {
            vSheet.deleteRule(i);
          }
        }
      }
    }),


    /**
     * remove all imports from a stylesheet
     *
     * @param vSheet {Object} the stylesheet object
     * @return {void}
     * @signature function(vSheet)
     */
    removeAllImports : qx.lang.Object.select(document.createStyleSheet ? "ie4+" : "other",
    {
      "ie4+" : function(vSheet)
      {
        var vImports = vSheet.imports;
        var vLength = vImports.length;

        for (var i=vLength-1; i>=0; i--) {
          vSheet.removeImport(i);
        }
      },

      "other" : function(vSheet)
      {
        var vRules = vSheet.cssRules;
        var vLength = vRules.length;

        for (var i=vLength-1; i>=0; i--)
        {
          if (vRules[i].type == vRules[i].IMPORT_RULE) {
            vSheet.deleteRule(i);
          }
        }
      }
    })
  }
});
