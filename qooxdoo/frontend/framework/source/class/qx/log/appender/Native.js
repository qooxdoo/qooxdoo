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
 * Processes the incoming log entry and displays it to the native
 * logging capabilities of this client.
 *
 * * In Firefox using an installed FireBug.
 * * In Opera using the <code>postError</code> function.
 * * Internet Explorer and Safari is not yet supported.
 */
qx.Bootstrap.define("qx.log.appender.Native",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
    
  statics :
  {
    /**
     * Processes a single log entry
     *
     * @type static
     * @signature function(entry)
     * @param entry {Map} The entry to process
     * @return {void}
     */
    process : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(entry)
      {
        if (window.console && console.firebug) {
          console[entry.level].apply(console, this.__toArguments(entry));
        }
      },

      "opera" : function(entry)
      {
        if (window.opera && opera.postError) {
          opera.postError.apply(opera, this.__toArguments(entry));
        }
      },

      "default" : function(entry) {}
    }),
    

    /**
     * Internal helper to convert an log entry to a arguments list.
     *
     * @type static
     * @param entry {Map} The entry to process
     * @return {Array} Argument list ready message array.
     */
    __toArguments : function(entry)
    {
      var output = [];
      
      output.push(entry.offset + "ms");
      
      if (entry.object) 
      {
        var obj = qx.core.ObjectRegistry.fromHashCode(entry.object);
        if (obj) {
          output.push(obj.classname + "[" + obj.$$hash + "]:");
        }
      }
      else if (entry.clazz) {
        output.push(entry.clazz.classname + ":");
      }      

      var items = entry.items;
      var item, msg;
      for (var i=0, il=items.length; i<il; i++) 
      {
        item = items[i];
        msg = item.text;
        
        if (msg instanceof Array)
        {
          var list = [];
          for (var j=0, jl=msg.length; j<jl; j++) {
            list.push(msg[j].text);
          }           

          if (item.type === "map") {
            output.push("{", list.join(", "), "}");
          } else {
            output.push("[", list.join(", "), "]");
          }          
        }
        else
        {        
          output.push(msg);
        }
      }

      return output;
    }
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */
  
  defer : function(statics) {
    qx.log.Logger.register(statics);
  }
});
