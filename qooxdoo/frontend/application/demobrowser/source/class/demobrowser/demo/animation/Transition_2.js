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
 * qx.fx.Transition contains mathematical functions for non-linear transitions in effects.
 */
qx.Class.define("demobrowser.demo.animation.Transition_2",
{
  extend : demobrowser.Demo,
  include : [ qx.legacy.application.MGuiCompat ],

  members :
  {
    main: function()
    {
      this.base(arguments);

      this.compat();

      var doc = qx.legacy.ui.core.ClientDocument.getInstance();
      this._elementStyle = 'font-size:12pt;text-align:center;font-family:"Trebuchet MS","Lucida Grande",Verdana,sans-serif;color:white;left:90px;top:90px;position:absolute;width:200px;height:55px;border:2px #E5E5E5 solid;background-color:#134275;z-Index:2;';
      this._element = myElement = qx.bom.Element.create('div', { style : this._elementStyle });

      document.body.appendChild(myElement);

      myElement.id = "testDiv";
      myElement.innerHTML = 'Welcome to <br><b style="color:#F3FFB3;">qooxdoo</b> animations!';

      var transitionData = {
        linear      : "Linear is the default transition for many effects.",
        easeInQuad  : "EaseInQuad will accelerate exponentially.",
        easeOutQuad : "EaseOutQuad will slow down exponentially.",
        sinoidal    : "Sinoidal transition will accelerate sinusoidal.",
        reverse     : "Reverse behaves like linear, but in the opposite direction.",
        wobble      : "Wobble will bounce the element forwards and backwards.",
        spring      : "Spring will overshoot the target and then move back.",
        flicker     : "Alternates rapidly between start end target. Looks only nice on color effects.",
        pulse       : "Alternates between start and end. Looks only nice on color effects."
      };

      var combo = new qx.legacy.ui.form.ComboBox;
      var btnShow = new qx.legacy.ui.form.Button("Show it!");
      var lblName = new qx.legacy.ui.basic.Label("Name");
      var lblDesc = new qx.legacy.ui.basic.Label("Description");
      var lblDur = new qx.legacy.ui.basic.Label("Duration");
      var textDesc = new qx.legacy.ui.embed.TextEmbed;
      var spDuration = new qx.legacy.ui.form.Spinner;

      lblName.setLocation(25, 50);
      lblDesc.setLocation(25, 75);
      lblDur.setLocation(25, 25);

      combo.setLocation(90, 50);
      textDesc.setLocation(90, 75);
      spDuration.setLocation(90, 25);

      btnShow.setLocation(23, 100);

      for (var transition in transitionData) {
        combo.add(new qx.legacy.ui.form.ListItem(transition));
      }

      combo.addListener("changeValue", function(){
        textDesc.setText(transitionData[this.getSelected().getLabel()]);
      });
      combo.addListener("appear", function(){
        this.setSelected(this.getList().getChildren()[0]);
      });

      spDuration.set({
        max   : 10.0,
        min   :  0.1,
        value :  1.0
      });

      var animMove = new qx.fx.effect.core.Highlight(myElement);
      animMove.set({
        startColor : "#134275",
        endColor : "#7CFC00"
      });
      animMove.addListener("finish", this._resetElement, this);

      var nf = new qx.util.format.NumberFormat();
      nf.setMaximumFractionDigits(2);
      spDuration.setNumberFormat(nf);
      spDuration.getManager().setPrecision(2);

      btnShow.addListener("execute", function(){
        var transition = combo.getSelected().getLabel();
        animMove.set({
          transition : transition,
          duration : spDuration.getValue()
        });

        animMove.start();
      });

      doc.add(lblName, lblDesc, lblDur, combo, textDesc, spDuration, btnShow);
    },

    _resetElement : function() {
      qx.bom.element.Style.setCss(this._element, this._elementStyle);
    }

  }
});
