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
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/* ************************************************************************

#use(qx.legacy.theme.ClassicRoyale)

************************************************************************ */

/**
 * qx.fx.effect.core.Scroll offers animated scrolling possibilites
 */
qx.Class.define("demobrowser.demo.animation.Scroll_1",
{
  extend : qx.legacy.application.Gui,
  include : [demobrowser.MDemoApplication],

  members :
  {
    main: function()
    {
      this.base(arguments);

      this.initDemo();

      var doc = qx.legacy.ui.core.ClientDocument.getInstance();
      myElement = document.getElementById("testDiv");

      // Only one effect should be executed at the same time in gloabl queue
      qx.fx.queue.Manager.getInstance().getDefaultQueue().setLimit(1);

      var animScrollDown = new qx.fx.effect.core.Scroll(myElement).set(
      {
        y          : 100,
        transition : "sinoidal"
      });

      var animScrollUp = new qx.fx.effect.core.Scroll(myElement).set(
      {
        y          : -100,
        transition : "spring"
      });

      var animScrollLeft = new qx.fx.effect.core.Scroll(myElement).set(
      {
        x          : -100,
        transition : "spring"
      });

      var animScrollRight = new qx.fx.effect.core.Scroll(myElement).set(
      {
        x          : 100,
        transition : "sinoidal"
      });

      var animScrollTo = new qx.fx.effect.core.Scroll(myElement).set(
      {
        x          :  40,
        y          : 100,
        mode       : "absolute"
      });


      /* Buttons */
      var btnUp = new qx.legacy.ui.form.Button("Scroll Up");
      var btnDown = new qx.legacy.ui.form.Button("Scroll Down");

      var btnLeft = new qx.legacy.ui.form.Button("Scroll Left");
      var btnRight = new qx.legacy.ui.form.Button("Scroll Right");

      var btnGoto = new qx.legacy.ui.form.Button("Scroll to 40, 100");

      btnUp.setLocation(10, 10);
      btnDown.setLocation(70, 10);

      btnLeft.setLocation(170, 10);
      btnRight.setLocation(235, 10);
      btnGoto.setLocation(325, 10);


      /* Events */
      btnUp.addListener("execute", function(){
        animScrollUp.start();
      });

      btnDown.addListener("execute", function(){
        animScrollDown.start();
      });

      btnLeft.addListener("execute", function(){
        animScrollLeft.start();
      });

      btnRight.addListener("execute", function(){
        animScrollRight.start();
      });

      btnGoto.addListener("execute", function(){
        animScrollTo.start();
      });


      doc.add(btnUp, btnDown, btnLeft, btnRight, btnGoto);
    }
  }
});
