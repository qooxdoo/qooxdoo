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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("demobrowser.demo.util.LayoutApplication",
{
  extend : qx.application.Standalone,

  members :
  {
    main : function()
    {
      this.base(arguments);
      
      var root = this.getRoot();
      
      editor = new demobrowser.demo.util.PropertyEditor();
      root.add(editor, {top:0,right:0,bottom:0});
      
      editor.addListener("mousedown", function(e) {
        e.stopPropagation();
      });
      
      root.addListener("mousedown", function(e) 
      {
        if (e.getTarget() !== root) {
          editor.handleWidgetClick(e);
        }          
      });      
    }
  }
})