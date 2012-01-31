/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Author:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * TODO: Write class doc
 */

qx.Class.define("simulator.autounit.RhinoFileLog", {

  extend : qx.core.Object,
  
  construct : function(fileName)
  {
    if (qx.core.Environment.get("qx.debug")) {
      this.assertString(fileName);
    }
    
    var fstream = new java.io.FileWriter(fileName, true);
    this.__fileHandle = new java.io.BufferedWriter(fstream);
  },
  
  members :
  {
    __fileHandle : null,
    
    writeLine : function(msg) {
      this.__fileHandle.write(msg);
      this.__fileHandle.newLine();
      this.__fileHandle.flush();
    },
    
    close : function()
    {
      this.__fileHandle.close();
    }
  },
  
  destruct : function()
  {
    this.close();
    delete this.__fileHandle;
  }
});