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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * qx.fx.Transition contains mathematical functions for non-linear transitions in effects.
 */
qx.Class.define("demobrowser.demo.animation.Transition_Position",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var doc = this.getRoot();

      var myElement = new qx.ui.embed.Html();
      myElement.setHtml('<span style="color:white;">Welcome to <br><b style="color:#F3FFB3;">qooxdoo</b> animations!</span>');
      myElement.setCssClass("test");

      doc.add(myElement);

      var transitionData = {
        linear      : "Linear is the default transition for many effects.",
        easeInQuad  : "EaseInQuad will accelerate exponentially.",
        easeOutQuad : "EaseOutQuad will slow down exponentially.",
        sinodial    : "Sinodial transition will accelerate sinusoidal.",
        reverse     : "Reverse behaves like linear, but in the opposite direction.",
        wobble      : "Wobble will bounce the element forwards and backwards.",
        spring      : "Spring will overshoot the target and then move back."
      };


      var selectBox = new qx.ui.form.SelectBox();
      var btnShow = new qx.ui.form.Button("Show it!");
      var lblName = new qx.ui.basic.Label("Name");
      var lblDesc = new qx.ui.basic.Label("Description");
      var lblDur = new qx.ui.basic.Label("Duration");
      var lblDesc =new qx.ui.basic.Label(transitionData.linear);
      var spDuration = new qx.ui.form.Spinner;

      for (var transition in transitionData) {
        selectBox.add(new qx.ui.form.ListItem(transition));
      }

      selectBox.addListener("changeSelection", function(e){
        lblDesc.setValue(transitionData[lblDesc.setValue(e.getData()[0].getLabel())]);
      });

      spDuration.set({
        maximum : 10.0,
        minimum :  0.1,
        value   :  1.0
      });

      var animMove;
      var moveBack = false;

      myElement.addListenerOnce("appear", function(){
        animMove = new qx.fx.effect.core.Move(myElement.getContainerElement().getDomElement());
        animMove.set({
          x : 600,
          y : 300,
          mode : "absolute"
        });

        animMove.addListener("finish", function()
        {
          animMove.set({
            x: moveBack ? 90 : 600,
            y: moveBack ? 90 : 300
          });
          moveBack = !moveBack;
        });


      }, this);

      var nf = new qx.util.format.NumberFormat();
      nf.setMaximumFractionDigits(2);
      spDuration.setNumberFormat(nf);

      btnShow.addListener("execute", function(){
        var transition = selectBox.getSelection()[0].getLabel();
        animMove.set({
          transition : transition,
          duration : spDuration.getValue()
        });

        animMove.start();
      });

      doc.add(lblName, {left : 25, top : 50});
      doc.add(lblDesc, {left : 25, top : 75});
      doc.add(lblDur, {left : 25, top : 25});
      doc.add(selectBox, {left : 90, top : 50});
      doc.add(lblDesc, {left : 90, top : 75});
      doc.add(spDuration, {left : 90, top : 25});
      doc.add(btnShow, {left : 23, top : 100});

    }
  }
});
