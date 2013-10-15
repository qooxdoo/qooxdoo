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
    this.base(arguments, false);
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


  members :
  {
    __themes : null,
    __demoImageLabel : null,


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

      var themeGroup = new qx.ui.mobile.form.Group([],false);
      var themeForm = new qx.ui.mobile.form.Form();

      var themeRadioGroup = new qx.ui.mobile.form.RadioGroup();
      for (var i = 0; i < this.__themes.length; i++) {
        var radioButton = new qx.ui.mobile.form.RadioButton();
        themeRadioGroup.add(radioButton);
        themeForm.add(radioButton, this.__themes[i].name);

        radioButton.addListener("tap", this.__switchTheme, {
          "self": this,
          "index": i
        });
      }

      themeGroup.add(new qx.ui.mobile.form.renderer.Single(themeForm));
      this.getContent().add(themeGroup);

      this.__createThemeScaleControl();

      this._createImageResolutionHandlingDemo();
    },


    /** Creates and adds the image resolution demonstration. */
    _createImageResolutionHandlingDemo : function() {
      this.getContent().add(new qx.ui.mobile.form.Title("Image Resolution Handling"));
      var demoImage = new qx.ui.mobile.basic.Image("mobileshowcase/icon/image.png");
      demoImage.addCssClass("resolution-demo-image");

      this.__demoImageLabel = new qx.ui.mobile.basic.Label();
      this.__demoImageLabel.addCssClass("resolution-demo-label");
      this._updateDemoImageLabel();

      var demoImageGroup = new qx.ui.mobile.form.Group();
      demoImageGroup.add(demoImage);
      demoImageGroup.add(this.__demoImageLabel);
      this.getContent().add(demoImageGroup);
    },


    /**
    * Refreshes the label which displays the pixel ratio, scale factor etc.
    */
    _updateDemoImageLabel : function() {
      var pixelRatio = qx.core.Environment.get("device.pixelRatio");
      var scaleFactor = qx.core.Init.getApplication().getRoot().getScaleFactor();

      var demoLabelTemplate = "<div>Device pixel ratio:<span>%1</span></div>  <div>Application's scale factor:<span>%2</span></div> <div>Optimal image resolution:<span>%3</span></div>";
      var labelContent = qx.lang.String.format(demoLabelTemplate, [pixelRatio, scaleFactor,  this.round(pixelRatio*scaleFactor)]);

      this.__demoImageLabel.setValue(labelContent);
    },


    /*
    * Rounds a number to one decimal place. 
    * @param x {Number}  
    */
    round : function (x) {
      var k = (Math.round(x * 100) / 100).toString();
      k += (k.indexOf('.') == -1)? '.00' : '00';
      return k.substring(0, k.indexOf('.') + 2);
    },


     /**
     * Creates the a control widget for the theme's scale factor.
     * @return {qx.ui.mobile.form.Form} the control widget for the adjusting the theme scaling.
     */
    __createThemeScaleControl : function()
    {
      this.getContent().add(new qx.ui.mobile.form.Title("Adjust theme scaling"));
      
      var form = new qx.ui.mobile.form.Form();
      var slider = new qx.ui.mobile.form.Slider();
      slider.set({
        "displayValue":"value",
        "minimum":50,
        "maximum":200,
        "value":100,
        "step":10
      });
      form.add(slider,"Theme Scale Factor in %");

      var useScaleButton = new qx.ui.mobile.form.Button("Apply");
      useScaleButton.addListener("tap", this._onApplyScaleButtonTap, {"slider":slider, "self":this});
      form.addButton(useScaleButton);

      var scaleGroup = new qx.ui.mobile.form.Group([new qx.ui.mobile.form.renderer.Single(form)],false);
      this.getContent().add(scaleGroup);
    },


    /**
    * Handler for "tap" event on applyScaleButton. Applies the app's root font size in relation to slider value.
    */
    _onApplyScaleButtonTap : function() {
      qx.core.Init.getApplication().getRoot().setScaleFactor(this.slider.getValue()/100);
      
      this.self._updateDemoImageLabel();

      var lastValue = this.slider.getValue();
      this.slider.setValue(0);
      this.slider.setValue(lastValue);
     
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
    __switchTheme : function() {
      var cssResource = this.self.__themes[this.index].css;
      var cssURI = qx.util.ResourceManager.getInstance().toUri(cssResource);
      this.self.__changeCSS(cssURI, 1);
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
