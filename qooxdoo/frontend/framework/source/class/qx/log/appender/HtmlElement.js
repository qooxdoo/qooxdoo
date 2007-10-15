/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)

************************************************************************ */

/* ************************************************************************

#module(log)

************************************************************************ */

/**
 * An appender that writes all messages to an HTML element.
 *
 * This class does not depend on qooxdoo widgets, so it also works when there
 * are problems with widgets or when the widgets are not yet initialized.
 */
qx.Class.define("qx.log.appender.HtmlElement",
{
  extend : qx.log.appender.Abstract,





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    element :
    {
      check : "Element",
      nullable : true,
      apply : "_applyElement"
    },

    /**
     * The maximum number of messages to show. If null the number of messages is not
     * limited.
     */
    maxMessages :
    {
      check : "Integer",
      init : 500
    },

    useLongFormat :
    {
      refine : true,
      init : false
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __backgroundColors :
    {
      0 : "white",
      200 : "white",
      500 : "#F1FBF3",
      600 : "#FEF0D2",
      700 : "#FCE1D8",
      800 : "#FCE1D8",
      1000 : "white"
    },

    _prepare : function()
    {
      if (!this._frame) {
        this._frame = document.createElement("div");
      }
    },

    _applyElement : function(value, old)
    {
      this._prepare();

      if (value) {
        value.appendChild(this._frame);
      }

      else if (old) {
        old.removeChild(this._frame);
      }
    },

    clear : function()
    {
      if (this._frame) {
        this._frame.innerHTML = "";
      }
    },

    appendLogEvent : function(evt)
    {
      this._prepare();

      // Append the group when needed
      var group = evt.logger.getName();

      if (evt.instanceId != null) {
        group += "[" + evt.instanceId + "]";
      }

      if (group != this._lastGroup)
      {
        var elem = document.createElement("div");
        elem.style.fontWeight = "bold";
        elem.innerHTML = group;

        this._frame.appendChild(elem);
        this._lastGroup = group;
      }

      // Append the message
      var elem = document.createElement("div");

      elem.style.backgroundColor = this.__backgroundColors[evt.level];
      elem.innerHTML = this.formatLogEvent(evt).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/  /g, " &#160;").replace(/[\n]/g, "<br>");

      this._frame.appendChild(elem);

      // Remove superflous messages
      while (this._frame.childNodes.length > this.getMaxMessages())
      {
        this._frame.removeChild(this._frame.firstChild);

        if (this._removedMessageCount == null) {
          this._removedMessageCount = 1;
        } else {
          this._removedMessageCount++;
        }
      }

      if (this._removedMessageCount != null)
      {
        this._frame.firstChild.className = "";
        this._frame.firstChild.innerHTML = "(" + this._removedMessageCount + " messages removed)";
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeFields("_frame");
  }
});
