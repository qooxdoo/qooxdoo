/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * Requests web fonts from {@link qx.bom.webfonts.Manager} and fires events
 * when their loading status is known.
 */
qx.Class.define("qx.bom.webfonts.WebFont", {

  extend : qx.bom.Font,


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * Fired when the status of a web font has been determined. The event data
     * is a map with the keys "family" (the font-family name) and "valid"
     * (Boolean).
     */
    "changeStatus" : "qx.event.type.Data"
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * TODOC
     */
    sources :
    {
      nullable : true,
      apply : "_applySources"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __families : null,

    // property apply
    _applySources : function(value, old) {
      var families = [];

      for (var i=0, l=value.length; i<l; i++) {
        var familyName = this._quoteFontFamily(value[i].family);
        families.push(familyName);
        var sourcesList = value[i].source;
        qx.bom.webfonts.Manager.getInstance().require(familyName, sourcesList, this._onWebFontChangeStatus, this);
      }

      this.setFamily(families.concat(this.getFamily()));
    },


    /**
     * Propagates web font status changes
     *
     * @param ev {qx.event.type.Data} "changeStatus"
     */
    _onWebFontChangeStatus : function(ev)
    {
      var result = ev.getData();
      this.fireDataEvent("changeStatus", result);
      if (qx.core.Environment.get("qx.debug")) {
        if (result.valid === false) {
          this.warn("WebFont " + result.family + " was not applied, perhaps the source file could not be loaded.");
        }
      }
    },


    /**
     * Makes sure font-family names containing spaces are properly quoted
     *
     * @param familyName {String} A font-family CSS value
     * @return {String} The quoted family name
     */
    _quoteFontFamily : function(familyName)
    {
      return familyName.replace(/["']/g, "");
    }

  }
});