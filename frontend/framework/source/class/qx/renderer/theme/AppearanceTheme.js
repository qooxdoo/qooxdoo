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

#module(ui_core)

************************************************************************ */

/**
 * Appearance Theme
 */
qx.Class.define("qx.renderer.theme.AppearanceTheme",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

	/**
	 * @param vTitle {String} anme of the appearance
	 */
  construct : function(vTitle)
  {
    qx.core.Object.call(this);

    this.setTitle(vTitle);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    /** name of the theme */
    title :
    {
      _legacy      : true,
      type         : "string",
      allowNull    : false,
      defaultValue : ""
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      DATA
    ---------------------------------------------------------------------------
    */

    _appearances : {},




    /*
    ---------------------------------------------------------------------------
      CORE METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Register an appearance for a given id
     *
     * vData has the following structure:
     * <pre>
     * {
     *   setup : function() {}
     *   initial : function(vTheme) {}
     *   state : function(vTheme, vStates) {}
     * }
     * </pre>
     *
     * @type member
     * @param vId {String} id of the apperance (e.g. "button", "label", ...)
     * @param vData {Map} TODOC
     * @return {void}
     */
    registerAppearance : function(vId, vData) {
      this._appearances[vId] = vData;
    },


    /**
     * Return the apperance object for a specific apperance id.
     *
     * @type member
     * @param vId {String} id of the apperance (e.g. "button", "label", ...)
     * @return {Object} appearance map
     */
    getAppearance : function(vId) {
      return this._appearances[vId];
    },


    /**
     * Call the "setup" function of the apperance
     *
     * @type member
     * @param vAppearance {Object} appearance map
     * @return {void}
     */
    setupAppearance : function(vAppearance)
    {
      if (!vAppearance._setupDone)
      {
        if (vAppearance.setup) {
          vAppearance.setup(this);
        }

        vAppearance._setupDone = true;
      }
    },




    /*
    ---------------------------------------------------------------------------
      WIDGET METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Get the result of the "initial" function for a given id
     *
     * @type member
     * @param vId {String} id of the apperance (e.g. "button", "label", ...)
     * @return {Map} map of widget properties as returned by the "initial" function
     */
    initialFrom : function(vId)
    {
      var vAppearance = this.getAppearance(vId);

      if (vAppearance)
      {
        this.setupAppearance(vAppearance);

        try {
          return vAppearance.initial ? vAppearance.initial(this) : {};
        } catch(ex) {
          this.error("Couldn't apply initial appearance", ex);
        }
      }
      else
      {
        return this.error("Missing appearance: " + vId);
      }
    },


    /**
     * Get the result of the "state" function for a given id and states
     *
     * @type member
     * @param vId {String} id of the apperance (e.g. "button", "label", ...)
     * @param vStates {Map} hash map defining the set states
     * @return {Map} map of widget properties as returned by the "state" function
     */
    stateFrom : function(vId, vStates)
    {
      var vAppearance = this.getAppearance(vId);

      if (vAppearance)
      {
        this.setupAppearance(vAppearance);

        try {
          return vAppearance.state ? vAppearance.state(this, vStates) : {};
        } catch(ex) {
          this.error("Couldn't apply state appearance", ex);
        }
      }
      else
      {
        return this.error("Missing appearance: " + vId);
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_appearances");
  }
});
