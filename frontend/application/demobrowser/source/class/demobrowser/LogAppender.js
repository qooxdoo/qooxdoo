/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)

************************************************************************ */

/* ************************************************************************

#module(demobrowser)

************************************************************************ */

qx.Class.define("demobrowser.LogAppender",
{
  extend : qx.log.appender.Abstract,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(target)
  {
    this.base(arguments);
    this.target = target;
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    useLongFormat :
    {
      refine : true,
      init   : false
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    colors :
    {
      0 : "white",
      200 : "white",
      500 : "#F1FBF3",
      600 : "#FEF0D2",
      700 : "#FCE1D8",
      800 : "#FCE1D8",
      1000 : "white"
    },


    // overridden
    /**
     * TODOC
     *
     * @type member
     * @param evt {Event} TODOC
     * @return {void}
     */
    appendLogEvent : function(evt)
    {
      // Append the message
      var text = evt.logger.getName();

      if (evt.instanceId != null) {
        text += "(" + evt.instanceId + ")";
      }

      text += ': ';

      var html = '<div style="background-color:' + this.colors[evt.level] + '">' + text + this.formatLogEvent(evt) + '</div>';

      this.target.setHtml(this.target.getHtml() + html);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("target");
  }
});
