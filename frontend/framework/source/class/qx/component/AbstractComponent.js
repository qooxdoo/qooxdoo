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

#module(core)

************************************************************************ */

qx.Class.define("qx.component.AbstractComponent",
{
  type : "abstract",
  extend : qx.core.Target,

  construct : function() {
    this.base(arguments);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Run initialisation part of component creation.
     *
     * @type member
     * @return {void}
     */
    initialize : function() {},


    /**
     * Run main  part of component creation.
     *
     * @type member
     * @return {void}
     */
    main : function() {},


    /**
     * Run finalization part of component creation.
     *
     * @type member
     * @return {void}
     */
    finalize : function() {},


    /**
     * Terminate this component.
     *
     * @type member
     * @return {void}
     */
    close : function() {},


    /**
     * Terminate this component.
     *
     * @type member
     * @return {void}
     */
    terminate : function() {},


    /**
     * TODOC
     *
     * @type member
     * @return {void | var} TODOC
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return;
      }

      return this.base(arguments);
    }
  }
});
