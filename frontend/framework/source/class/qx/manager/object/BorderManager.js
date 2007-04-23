/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_core)

************************************************************************ */

qx.Class.define("qx.manager.object.BorderManager",
{
  type : "singleton",
  extend : qx.manager.object.ValueManager,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    borderTheme :
    {
      check : "Theme",
      nullable : true,
      apply : "_processThemedData",
      event : "changeBorderTheme"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _processThemedData : function(value)
    {
      var dest = this._dynamic = {};

      if (value)
      {
        var source = value.borders;

        // TODO: Dispose old borders

        for (var key in source) {
          dest[key] = (new qx.renderer.border.Border).set(source[key]);
        }
      }

      // Inform objects which have registered
      // regarding the theme switch
      this._updateThemedObjects();
    },


    updateBorderAt : function(obj, edge)
    {
      var reg = this._registry;
      var dest = this._dynamic;
      var entry;

      for (var key in reg)
      {
        entry = reg[key];

        if (dest[entry.value] === obj) {
          entry.callback.call(entry.object, dest[entry.value], edge);
        }
      }
    }
  }
});
