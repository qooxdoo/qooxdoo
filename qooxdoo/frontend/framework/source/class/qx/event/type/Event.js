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
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)

************************************************************************ */

/**
 * The qooxdoo core event object. Each event object for qx.core.Targets should extend this class.
 */
qx.Class.define("qx.event.type.Event",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vType)
  {
    this.base(arguments);

    this.setType(vType);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    type :
    {
      _fast       : true,
      setOnlyOnce : true
    },

    originalTarget :
    {
      _fast       : true,
      setOnlyOnce : true
    },

    target :
    {
      _fast       : true,
      setOnlyOnce : true
    },

    relatedTarget :
    {
      _fast       : true,
      setOnlyOnce : true
    },

    currentTarget : { _fast : true },

    bubbles :
    {
      _fast        : true,
      defaultValue : false,
      noCompute    : true
    },

    propagationStopped :
    {
      _fast        : true,
      defaultValue : true,
      noCompute    : true
    },

    defaultPrevented :
    {
      _fast        : true,
      defaultValue : false,
      noCompute    : true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _autoDispose : false,


    /*
    ---------------------------------------------------------------------------
      SHORTCUTS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    preventDefault : function() {
      this.setDefaultPrevented(true);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    stopPropagation : function() {
      this.setPropagationStopped(true);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_valueOriginalTarget", "_valueTarget", "_valueRelatedTarget", "_valueCurrentTarget");
  }
});
