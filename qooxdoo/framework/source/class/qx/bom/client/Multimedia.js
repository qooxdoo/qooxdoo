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
 * If no version could be detected the version is set to "0" as default.
 * Be aware of that behaviour if using the {@link #has} method with a minimum
 * version as second parameter.
 *
 * @deprecated since 1.4: please use qx.core.Environment instead.
 */
qx.Class.define("qx.bom.client.Multimedia",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Database of supported features.
     * Filled with additional data at initialization
     *
     * @internal
     */
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
     * @deprecated since 1.4: please use qx.core.Environment.get instead.
     *
     * @param id {String} Feature-ID. One of quicktime, wmv, divx or silverlight
     * @param version {Float?0} Optional version minimum check
     * @return {Boolean} Returns <code>true</code> when the given plugin is available.
     */
    has : function(id, version)
    {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee, "Please use qx.core.Environment.get insead."
      );

      // check if the given id is available - otherwise return false
      if (this.__db[id])
      {
        var plugin = this.__db[id];
        // if plugin is installed - check for version
        if (plugin.installed)
        {
          // if no version given or minimum version check successful
          if (version == null || (plugin.version >= parseFloat(version)))
          {
            return true;
          }
        }
      }

      return false;
    },


    /**
     * Internal initialize helper
     *
     * @return {void}
     * @signature function()
     */
    __init : qx.core.Environment.select("engine.name",
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
              // no possibility to get the version string
              entry.version = 0;
              break;

            case "wmv":
              entry.version = obj.versionInfo;
              break;

            case "divx":
              // no possibility to get the version string
              entry.version = 0;
              break;

            case "silverlight":
              // try to detect the silverlight version
              try
              {
                entry.version = obj.version === undefined ? 0 : obj.version;
              }
              catch(ex)
              {
                try
                {
                  entry.version = obj.settings.version === undefined ? 0 : obj.settings.version;
                }
                catch(ex)
                {
                  entry.version = 0;
                }
              }
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
                entry.version = parseFloat(RegExp.$1);
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
