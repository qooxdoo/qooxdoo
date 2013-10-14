/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/*
 * If you have added resources to your app remove the leading '*' in the
 * following line to make use of them.


************************************************************************ */

/**
 * Mobile page responsible for switching between provided themes.
 *
 * @asset(qx/mobile/css/*)
 */
qx.Class.define("mobileshowcase.page.ThemeSwitcher",
{
  extend : qx.ui.mobile.page.NavigationPage,

  construct : function()
  {
    this.base(arguments);
    this.setTitle("Theme Switcher");
    this.setShowBackButton(true);
    this.setBackButtonText("Back");
    this.__themes = [{
        "name": "Indigo",
        "css": "../../../framework/source/resource/qx/mobile/css/indigo.css"
      },
      {
        "name": "Flat",
        "css": "../../../framework/source/resource/qx/mobile/css/flat.css"
      }
    ];

    this.__preloadThemes();
  },

  events :
  {
    "themeswitch" : "qx.event.type.Data"
  },


  members :
  {
    __themes : null,


    /**
     * Preloads all css files for preventing flickering on theme switches.
     */
    __preloadThemes : function() {
      for(var i = 0; i < this.__themes.length; i++) {
          var cssResource = this.__themes[i].css;
          var cssURI = qx.util.ResourceManager.getInstance().toUri(cssResource);

          var req = new qx.bom.request.Xhr();

          req.open("GET", cssURI);
          req.send();
      }
    },


    // overridden
    _initialize : function()
    {
      this.base(arguments);

      this.getContent().add(new qx.ui.mobile.form.Title("Select your theme"));

      for(var i = 0; i < this.__themes.length; i++) {
         var label = this.__themes[i].name;
         var switchButton = new qx.ui.mobile.form.Button(label);
         switchButton.addListener("tap", this.__switchTheme, this);

         this.getContent().add(switchButton);
      }

      this.getContent().add(new qx.ui.mobile.form.Title("Adjust theme scaling"));
      this.getContent().add(this.__createThemeScaleControl());
    },


     /**
     * Creates the a control widget for the theme's scale factor.
     * @return {qx.ui.mobile.form.Form} the control widget for the adjusting the theme scaling.
     */
    __createThemeScaleControl : function()
    {
      var form = new qx.ui.mobile.form.Form();
      var slider = new qx.ui.mobile.form.Slider();
      slider.setDisplayValue("value");
      slider.setMinimum(50);
      slider.setMaximum(200);
      slider.setValue(100);
      slider.setStep(10);
      form.add(slider,"Theme Scale Factor in %");
      var useScaleButton = new qx.ui.mobile.form.Button("Apply");
      useScaleButton.addListener("tap", this._onApplyScaleButtonTap, slider);
      form.addButton(useScaleButton);
      return new qx.ui.mobile.form.renderer.Single(form);
    },


    /**
    * Handler for "tap" event on applyScaleButton. Applies the app's root font size in relation to slider value.
    */
    _onApplyScaleButtonTap : function() {
      qx.bom.element.Style.set(document.documentElement,"fontSize",this.getValue()+"%");
      var lastValue = this.getValue();
      this.setValue(0);
      this.setValue(lastValue);
     
      qx.core.Init.getApplication().getRouting().executeGet("/themeswitcher", {reverse:false});
    },


    /**
     * Changes the used CSS of the application.
     * @param cssFile {String} The css file url.
     * @param cssLinkIndex {String} index of the css link entry in head, which will be replaced.
     */
    __changeCSS : function(cssFile, cssLinkIndex) {
        var oldlink = document.getElementsByTagName("link").item(cssLinkIndex);

        var newlink = document.createElement("link")
        newlink.setAttribute("rel", "stylesheet");
        newlink.setAttribute("type", "text/css");
        newlink.setAttribute("href", cssFile);

        document.getElementsByTagName("head").item(0).replaceChild(newlink, oldlink);
     },


    /**
     * Switches the theme of the application to the target theme.
     * @param src {qx.ui.mobile.core.Widget} Source widget of this event.
     */
    __switchTheme : function(src) {
      var chosenValue = src.getTarget().getLabel();

      for (var i = 0; i < this.__themes.length; i++) {
        if (chosenValue == this.__themes[i].name) {

          var cssResource = this.__themes[i].css;
          var cssURI = qx.util.ResourceManager.getInstance().toUri(cssResource);
          this.__changeCSS(cssURI, 1);
        }
      }

      this.fireDataEvent("themeswitch", {
        "theme": chosenValue
      });
    },


    /**
     * Adds a new theme data object to the theme switcher.
     * @param cssFile {String} The css file url.
     */
    appendTheme : function(themeData) {
      this.__themes.push(themeData);
    },


    // overridden
    _back : function()
    {
      qx.core.Init.getApplication().getRouting().executeGet("/", {reverse:true});
    },


    /*
    *****************************************************************************
      DESTRUCTOR
    *****************************************************************************
    */
    destruct : function()
    {
      this._disposeObjects("__themes");
    }
  }
});
