/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Contains detection for QuickTime, Windows Media, DivX and Silverlight.
 */
qx.Bootstrap.define("qx.bom.client.Multimedia",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    // filled with additional data at initialization
    __db :
    {
      quicktime :
      {
        plugin : "QuickTime",
        control : "QuickTimeCheckObject.QuickTimeCheck.1"
        // call returns boolean: instance.IsQuickTimeAvailable(0)
      },

      wmv :
      {
        plugin : "Windows Media",
        control : "WMPlayer.OCX.7"
        // version string in: instance.versionInfo
      },

      divx :
      {
        plugin : "DivX Web Player",
        control : "npdivx.DivXBrowserPlugin.1"
      },

      silverlight :
      {
        plugin : "Silverlight",
        control : "AgControl.AgControl"
        // version string in: instance.version (Silverlight 1.0)
        // version string in: instance.settings.version (Silverlight 1.1)
        // version check possible using instance.IsVersionSupported
      }
    },


    /**
     * Detects if the given plugin is available.
     *
     * @param id {String} Feature-ID. One of quicktime, wmv, divx or silverlight
     * @param version {Float?0} Optional version minimum check
     * @return {Boolean} Returns <code>true</code> when the given plugin is available.
     */
    has : function(id, version)
    {
      // TODO

    },


    /**
     * Internal initialize helper
     *
     * @return {void}
     */
    __init : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        var control = window.ActiveXObject;
        if (!control) {
          return;
        }

        var db = this.__db;
        var entry, obj;

        for (var id in db)
        {
          entry = db[id];

          try {
            obj = new ActiveXObject(entry.control);
          } catch(ex) {
            continue;
          }

          // version detection etc.
          switch(id)
          {
            case "quicktime":
              break;

            case "wmv":
              break;

            case "divx":
              break;

            case "silverlight":
              break;
          }

          entry.installed = true;
        }
      },

      "default" : function()
      {
        var plugins = navigator.plugins;
        if (!plugins) {
          return;
        }

        var db = this.__db;
        var verreg = /([0-9]\.[0-9])/g;
        var plugin, name, entry;

        for (var i=0, il=plugins.length; i<il; i++)
        {
          plugin = plugins[i];
          name = plugin.name;

          for (var id in db)
          {
            entry = db[id];
            if (!entry.installed && name.indexOf(entry.plugin) !== -1)
            {
              entry.installed = true;

              if (verreg.test(plugin.name) || verreg.test(plugin.description)) {
                entry.version = parseFloat(RegExp.$1, 10);
              } else {
                entry.version = 0;
              }

              break;
            }
          }
        }
      }
    })
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    statics.__init();
  }
});
