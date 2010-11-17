/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Provides functionality to capture the log messages of a tested qooxdoo 
 * application.
 */

qx.Mixin.define("simulator.MApplicationLogging",
{
  members:
  {
    /**
     * Adds a function to the AUT that retrieves all messages from the logger 
     * created by {@link #addRingBuffer}.
     * @lint ignoreUndefined(selenium)
     */
    addRingBufferGetter : function()
    {
      var getRingBufferEntries = function(autWin) {
        var targetWin = autWin || selenium.qxStoredVars['autWindow'];
        var entries = selenium.qxStoredVars['ringBuffer'].getAllLogEvents();
        var entryArray = [];
        for (var i=0,l=entries.length; i<l; i++) {
          try {
          var entry = targetWin.qx.log.appender.Util.toText(entries[i]);
          entryArray.push(entry);
          } catch(ex) {
            var entry = entries[i].level + ':';
            for (var j=0,m=entries[i].items.length; j<m; j++) {
              entry += entries[i].items[j].text + ' ';
            }
            entryArray.push(entry);
          }
        }
        return entryArray.join('|');
      };
      
      this.addOwnFunction("getRingBufferEntries", getRingBufferEntries);  
    },

    /**
     * Creates a new qx.log.appender.RingBuffer in the AUT and registers it. 
     * This can be used to access the AUT's log messages from the test code.
     * 
     * @param win {String} JavaScript snippet that evaluates as a Window object 
     * accessible to the current Selenium instance. Default: The AUT's window.
     */
    addRingBuffer : function(win)
    {
      var qxWin = win || "selenium.qxStoredVars['autWindow']";
      var rb = "new " + qxWin + ".qx.log.appender.RingBuffer()";
      this.storeEval(rb, "ringBuffer");  
      this.qxSelenium.getEval(qxWin + ".qx.log.Logger.register(selenium.qxStoredVars['ringBuffer'])");
    }

  }
});
