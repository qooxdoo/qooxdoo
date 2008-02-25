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

/* ************************************************************************

#use(qx.legacy.theme.ClassicRoyale)

************************************************************************ */



/**
 * qx.fx offers low level animation capabilites for DOM elements.
 */
qx.Class.define("demobrowser.demo.animation.Showcase_1",
{
  extend : demobrowser.Demo,
  include : [ qx.legacy.application.MGuiCompat ],

  members :
  {
    main : function()
    {
      this.base(arguments);

      this.compat();

      this._elementStyle = 'font-size:12pt;opacity:0.0;text-align:center;font-family:"Trebuchet MS","Lucida Grande",Verdana,sans-serif;color:white;left:110px;top:102px;position:absolute;width:200px;height:55px;border:2px #000000 solid;background-color:#134275;z-Index:2;';
      this._element = qx.bom.Element.create(
        'div',
        {
          style     : this._elementStyle,
          id        : "testDiv",
          innerHTML : 'Welcome to <br><b style="color:#F3FFB3;">qooxdoo</b> animations!'
        }
      );

      document.body.appendChild(this._element);


      /*
       * Each effect needs
       * 1. an HTML element to modify
       * 2. a map with effect spcific options
       */


      /*
       * Effect for fading in the div container
      */
      var animShow = new qx.fx.effect.core.Fade(this._element).set({
        from : 0,
        to : 1,
        duration : 1
      });

      /*
       * Effect for fading out the div container
      */
      var animHide = new qx.fx.effect.core.Fade(this._element).set({
        duration : 1,
        from : 1,
        to : 0
      });

      /*
       * Effect for increasing the dimensions of the div container
      */
      var animIncrease = new qx.fx.effect.core.Scale(this._element);
      animIncrease.set({
        scaleTo : 200,
        duration : 2
      });

      /*
       * Effect for reduce the dimensions of the div container
      */
      var animDecrease = new qx.fx.effect.core.Scale(this._element);
      animDecrease.set({
        scaleTo : 50,
        duration : 2
      });

      /*
      * This FadeIn effect demonstrates a different transition: wobble
      * In opposite to the linear transition, this one differs between the values
      * Just take a look at this transition behavior to get the idea. ;-)
      */
      var animFadeInWobble = new qx.fx.effect.core.Fade(this._element);
      animFadeInWobble.set({
        from : 0,
        to : 1,
        duration : 6,
        transition : "wobble"
      });

      /*
      * This Scale effect shows the sinoidal transition.
      */
      var animIncreaseSinoidal = new qx.fx.effect.core.Scale(this._element);
      animIncreaseSinoidal.set({
        scaleTo : 200,
        duration : 4,
        delay : 2,
        transition : "sinoidal"
      });

      /*
      * This is one of the combination effect.
      * Puff will scale and fade out the given element and looks
      * as if it the element explodes.
      */
      var animPuff = new qx.fx.effect.combination.Puff(this._element);

      /*
      * This move effect moves the element to the given coordinates
      * Note that you these coordinates can be absolute to the document or relative to the element's position.
      */
      var animMoveAway = new qx.fx.effect.core.Move(this._element);
      animMoveAway.set({
        x : 600,
        y : 300,
        transition : "sinoidal",
        mode : "absolute"
      });

      /*
      * This move effect moves the element back to the start coordinates.
      * It uses a nicely transition, which bounces the element.
      */
      var animMoveBack = new qx.fx.effect.core.Move(this._element);
      animMoveBack.set({
        x : 110,
        y : 102,
        transition : "spring",
        mode : "absolute"
      });

      /*
      * Grow is another combination effect. Internally, it uses
      * the FadeIn, Scale and Move effect.
      */
      var animGrow = new qx.fx.effect.combination.Grow(this._element);
      animGrow.setDirection("center");

      var animShake = new qx.fx.effect.combination.Shake(this._element);

      var animPulsate = new qx.fx.effect.combination.Pulsate(this._element);

      /*
      * Shake is a combination effect without options
      */
      var animShake = new qx.fx.effect.combination.Shake(this._element);
      var animSwitchOff = new qx.fx.effect.combination.SwitchOff(this._element);
      var animFold = new qx.fx.effect.combination.Fold(this._element);

      var animHigh = new qx.fx.effect.core.Highlight(this._element);
      animHigh.set({
        startColor : "#134275",
        endColor : "#7CFC00",
        duration : 1
      });

      var animAHigh = new qx.fx.effect.core.Highlight(this._element);
      animAHigh.set({
        startColor : "#134275",
        endColor : "#7CFC00",
        transition : "wobble",
        duration : 3
      });

      var animColorFlow = new qx.fx.effect.combination.ColorFlow(this._element);
      animColorFlow.set({
        startColor : "#134275",
        endColor : "#7CFC00",
        backwardDuration : 3
      });

      var animShrink = new qx.fx.effect.combination.Shrink(this._element);
      animShrink.setDirection("center");

      var animDropOut = new qx.fx.effect.combination.DropOut(this._element);

      /* Buttons */
      var btnShow = new qx.legacy.ui.form.Button("Fade in");
      var btnHide = new qx.legacy.ui.form.Button("Fade out");
      var btnIncrease = new qx.legacy.ui.form.Button("Increase");
      var btnDecrease = new qx.legacy.ui.form.Button("Decrease");
      var btnCombination = new qx.legacy.ui.form.Button("Fade in & increase");
      var btnPuff = new qx.legacy.ui.form.Button("Puff");
      var btnMoveAway = new qx.legacy.ui.form.Button("Move away");
      var btnMoveBack = new qx.legacy.ui.form.Button("Move back");
      var btnGrow = new qx.legacy.ui.form.Button("Grow");
      var btnShake = new qx.legacy.ui.form.Button("Shake");
      var btnPulsate = new qx.legacy.ui.form.Button("Pulsate");
      var btnSwitchOff = new qx.legacy.ui.form.Button("Switch off");
      var btnFold = new qx.legacy.ui.form.Button("Fold");
      var btnHigh = new qx.legacy.ui.form.Button("Highlight");
      var btnAHigh = new qx.legacy.ui.form.Button("Annoying Highlight ;-)");
      var btnColorFlow = new qx.legacy.ui.form.Button("ColorFlow");
      var btnShrink = new qx.legacy.ui.form.Button("Shrink");
      var btnDropOut = new qx.legacy.ui.form.Button("DropOut");
      var btnReset = new qx.legacy.ui.form.Button("Reset element");

      cbResetStyle = new qx.legacy.ui.form.CheckBox("Reset element after effect");

      var buttonBar1 = new qx.legacy.ui.layout.HorizontalBoxLayout().set({
        height: "auto",
        width: "auto",
        top: 25,
        left: 25,
        spacing: 10
      });
      buttonBar1.add(btnShow, btnHide, btnIncrease, btnDecrease, btnCombination, btnPuff, btnMoveAway, btnMoveBack, btnGrow, btnShake);
      buttonBar1.addToDocument();

      var buttonBar2 = new qx.legacy.ui.layout.HorizontalBoxLayout().set({
        height: "auto",
        width: "auto",
        top: 60,
        left: 25,
        spacing: 10
      });
      buttonBar2.add(btnSwitchOff, btnPulsate, btnFold, btnHigh, btnAHigh, btnColorFlow, btnShrink, btnDropOut);
      buttonBar2.addToDocument();

      var buttonBar3 = new qx.legacy.ui.layout.HorizontalBoxLayout().set({
        height: "auto",
        width: "auto",
        top: 95,
        left: 25,
        spacing: 10
      });
      buttonBar3.add(cbResetStyle, btnReset);
      buttonBar3.addToDocument();

      /* Events */
      btnShow.addListener("execute", function(){
        animShow.start();
      });

      btnShow.addListener("appear", function(){
        btnShow.focus();
      });

      btnHide.addListener("execute", function(){
        animHide.start();
      });

      btnIncrease.addListener("execute", function(){
        animIncrease.start();
      });

      btnDecrease.addListener("execute", function(){
        animDecrease.start();
      });

      btnCombination.addListener("execute", function(){
        animFadeInWobble.start();
        animIncreaseSinoidal.start();
      });

      btnPuff.addListener("execute", function(){
        animPuff.start();
      });

      btnMoveAway.addListener("execute", function(){
        animMoveAway.start();
      });

      btnMoveBack.addListener("execute", function(){
        animMoveBack.start();
      });

      btnGrow.addListener("execute", function(){
        animGrow.start();
      });

      btnShake.addListener("execute", function(){
        animShake.start();
      });

      btnSwitchOff.addListener("execute", function(){
        animSwitchOff.start();
      });

      btnPulsate.addListener("execute", function(){
        animPulsate.start();
      });

      btnFold.addListener("execute", function(){
        animFold.start();
      });

      btnHigh.addListener("execute", function(){
        animHigh.start();
      });

      btnAHigh.addListener("execute", function(){
        animAHigh.start();
      });

      btnColorFlow.addListener("execute", function(){
        animColorFlow.start();
      });

      btnShrink.addListener("execute", function(){
        animShrink.start();
      });

      btnDropOut.addListener("execute", function(){
        animDropOut.start();
      });


      btnReset.addListener("execute", function(){
        qx.bom.element.Style.setCss(this._element,  this._elementStyle);
      });

      btnReset.setBackgroundColor("#B22222");
    }

  }

});
