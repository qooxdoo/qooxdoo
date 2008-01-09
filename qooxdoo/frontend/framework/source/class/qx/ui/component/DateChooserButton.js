/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 Visionet GmbH, Germany, http://www.visionet.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Dietrich Streifert (level420)

************************************************************************ */

/* ************************************************************************

#embed(qx.icontheme/16/apps/accessories-date.png)

************************************************************************ */

/**
 * A date chooser button widget which can be associated to a widget where the date value is synchronized
 * whith the selected date.
 */
qx.Class.define("qx.ui.component.DateChooserButton",
{
  extend : qx.ui.form.Button,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param vTargetWidget {qx.ui.core.Widget} the widget which is the target for the date value selection. The target widget must have a setValue and getValue method.
   * @param vChooserTitle {String} the title of the chooser window. The default value is held in property chooserTitle.
   * @param vButtonLabel {String} the label of the button. The default is null.
   * @param vIcon {String} the icon of the button. The default is 'icon/16/apps/accessories-date.png'.
   * @param vIconWidth {String} derived from qx.ui.form.Button.
   * @param vIconHeight {String} derived from qx.ui.form.Button.
   * @param vFlash {String} derived from qx.ui.form.Button.
   */
  construct : function(vTargetWidget, vChooserTitle, vButtonLabel, vIcon, vIconWidth, vIconHeight, vFlash)
  {
    if (!vIcon) {
      vIcon = 'icon/16/apps/accessories-date.png';
    }

    this.base(arguments, vButtonLabel, vIcon, vIconWidth, vIconHeight, vFlash);
    this.set({ height : 20 });

    // create the subwidgets
    //
    this._createChooser();
    this._createChooserWindow();

    // create dateFormat instance
    //
    this._dateFormat = new qx.util.format.DateFormat(qx.locale.Date.getDateFormat(this.getDateFormatSize()));
    qx.locale.Manager.getInstance().addEventListener("changeLocale", this._changeLocaleHandler, this);

    if (vTargetWidget) {
      this.setTargetWidget(vTargetWidget);
    }

    if (vChooserTitle) {
      this.setChooserTitle(vChooserTitle);
    }

    this.addEventListener("execute", this._executeHandler, this);
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

    /** The target widget the selected Date should be synchronized with. */
    targetWidget :
    {
      check : "qx.ui.core.Widget",
      init : null,
      nullable : true,
      apply : "_applyTargetWidget"
    },

    /** The title of the date chooser window. */
    chooserTitle :
    {
      init : qx.locale.Manager.tr("Choose a date"),
      apply : "_applyChooserTitle"
    },

    /** The date format size according to the size parameter in {@link qx.locale.Date#getDateFormat}. */
    dateFormatSize :
    {
      check : ["short", "medium", "long", "full"],
      init : "short",
      apply : "_applyDateFormatSize"
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
      MODIFIERS
    ---------------------------------------------------------------------------
    */

    /**
     * Modifier for property targetWidget.
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {Boolean} true if modification succeeded
     * @throws exception if value is not instance of qx.ui.core.Widget or does not have setter and getter for property value
     */
    _applyTargetWidget : function(value, old)
    {
      if (value instanceof qx.ui.core.Widget && qx.util.Validation.isValidFunction(value.setValue) && qx.util.Validation.isValidFunction(value.getValue)) {
        return true;
      } else {
        throw new Error("TargetWidget must be an instance of qx.ui.core.Widget and has setValue and getValue methods");
      }
    },


    /**
     * Modifier for property chooserTitle.
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {Boolean} true if modification succeeded
     */
    _applyChooserTitle : function(value, old) {
      this._chooserWindow.setCaption(value);
    },


    /**
     * Modifier for property dateFormatSize.
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {Boolean} true if modification succeeded
     */
    _applyDateFormatSize : function(value, old) {
      this._changeLocale(value);
    },




    /*
    ---------------------------------------------------------------------------
      SUB WIDGET CREATION
    ---------------------------------------------------------------------------
    */

    /**
     * Create the popup window with for the date chooser and add the date chooser to it.
     *
     * @type member
     * @return {void}
     */
    _createChooserWindow : function()
    {
      var win = this._chooserWindow = new qx.ui.window.Window(this.getChooserTitle());

      win.addEventListener("keydown", this._chooserWindowKeydownHandler, this);
      win.addEventListener("appear", this._chooserWindowAppearHandler, this);

      win.set(
      {
        top           : 50,
        left          : 50,
        modal         : true,
        minWidth      : null,
        minHeight     : null,
        resizable    : false,
        allowMinimize : false,
        allowMaximize : false,
        showMaximize  : false,
        showMinimize  : false
      });

      win.auto();
      win.add(this._chooser);
      win.addToDocument();
    },


    /**
     * Create the date chooser
     *
     * @type member
     * @return {void}
     */
    _createChooser : function()
    {
      var cp = this._chooser = new qx.ui.component.DateChooser;
      cp.auto();
      cp.setBorder(null);

      cp.addEventListener("select", this._chooserSelectHandler, this);
    },



    /*
    ---------------------------------------------------------------------------
      HELPERS
    ---------------------------------------------------------------------------
    */


    /**
     * Change the date format to the current locale with the given size
     *
     * @type member
     * @param dateFormatSize {String} The date format size according to the size parameter in {qx.locale.Date.getDateFormat}
     * @return {void}
     * @throws exception if the target widget is not instance of qx.ui.core.Widget or does not have setter and getter for property value
     */
    _changeLocale : function(dateFormatSize)
    {
      if (qx.util.Validation.isInvalidObject(this.getTargetWidget())) {
        throw new Error("TargetWidget must be set which must be an instance of qx.ui.core.Widget and has setValue and getValue method.");
      }

      var date = null;

      try {
        date = this._dateFormat.parse(this.getTargetWidget().getValue());
      } catch(ex) {}

      this._dateFormat = new qx.util.format.DateFormat(qx.locale.Date.getDateFormat(dateFormatSize));

      if (!date) {
        return;
      }

      this._chooser.setDate(date);
      this.getTargetWidget().setValue(this._dateFormat.format(date));
    },




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Event hanlder for the execute event of the date chooser button.
     *
     * @type member
     * @param e {Event} the received event
     * @return {void}
     * @throws exception if the target widget is not instance of qx.ui.core.Widget or does not have setter and getter for property value
     */
    _executeHandler : function(e)
    {
      if (qx.util.Validation.isInvalidObject(this.getTargetWidget())) {
        throw new Error("TargetWidget must be set which must be an instance of qx.ui.core.Widget and has setValue and getValue method.");
      }

      var date = null;

      try {
        date = this._dateFormat.parse(this.getTargetWidget().getValue());
      } catch(ex) {}

      // value from taget widget could not be parsed.
      this._chooser.setDate(date);
      this._chooserWindow.open();
    },


    /**
     * Handle locale changes. Update the date format of the target widget.
     *
     * @type member
     * @param e {Event} the received event
     * @return {void}
     * @throws TODOC
     */
    _changeLocaleHandler : function(e)
    {
      this._changeLocale(this.getDateFormatSize());
    },


    /**
     * Event handler for keydown events of the chooser window. Closes the window on hitting the 'Escape' key.
     *
     * @type member
     * @param e {Event} the received key event
     * @return {void}
     */
    _chooserWindowKeydownHandler : function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "Escape":
          this._chooserWindow.close();
          this.getTargetWidget().focus();
          break;
      }
    },


    /**
     * Event handler for chooser window appear event. Positions the window above the target widget.
     *
     * @type member
     * @param e {Event} the received appear event
     * @return {void}
     */
    _chooserWindowAppearHandler : function(e)
    {
      this._chooserWindow.positionRelativeTo(this.getTargetWidget());
      this._chooser.focus();
    },


    /**
     * Event handler for the date chooser select event. Formats the selected date as string and sets the target widgets value.
     *
     * @type member
     * @param e {Event} the select event
     * @return {void}
     */
    _chooserSelectHandler : function(e)
    {
      var target = this.getTargetWidget();
      target.setValue(this._dateFormat.format(this._chooser.getDate()));
      this._chooserWindow.close();
      target.focus();
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    var chooserWindowParent = this._chooserWindow.getParent();
    if (chooserWindowParent)
      chooserWindowParent.remove(this._chooserWindow);

    qx.locale.Manager.getInstance().removeEventListener("changeLocale", this._changeLocaleHandler, this);

    this._disposeObjects("_dateFormat", "_chooser", "_chooserWindow");
  }
});
