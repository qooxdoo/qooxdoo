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
     * Alexander Steitz (aback)

************************************************************************ */

/* ************************************************************************

#asset(demobrowser/demo/test/*)
#asset(qx/decoration/Modern/form/checkbox-focused.png)
#asset(qx/decoration/Modern/app-header.png)

************************************************************************ */

/**
 * @tag test
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.test.Decoration_UseCases",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var bodyElement = qx.bom.Collection.query("body");

      var imageSourcePng = "qx/decoration/Modern/app-header.png";
      var imageSourcePngClipped = "demobrowser/demo/test/demobrowser_thumb.png";
      var imageSourceAlphaPng = "demobrowser/demo/test/alphaPNG.png";
      var imageSourceAlphaPngClippedRepeatX = "qx/icon/Tango/22/places/folder-open.png";
      var imageSourceAlphaPngClippedRepeatY = "qx/decoration/Modern/form/checkbox-focused.png";
      var imageSourceGif = "demobrowser/demo/test/logo.gif";
      var imageSourceGifClipped = "qx/decoration/Modern/cursors/alias.gif";


      var Decoration = qx.bom.element.Decoration;

      var pngNoRepeat = Decoration.create(imageSourcePng, "no-repeat", { top: "20px" });
      bodyElement.append(pngNoRepeat);

      var pngRepeatX = Decoration.create(imageSourcePng, "repeat-x", { width: "350px", height: "20px", top: "20px", left: "120px" });
      bodyElement.append(pngRepeatX);

      var pngRepeatY = Decoration.create(imageSourcePng, "repeat-y", { width: "20px", height: "200px", top: "20px", left: "500px" });
      bodyElement.append(pngRepeatY);

      bodyElement.append("<div style='position:absolute;left:600px;top:20px;font-size:36px;font-weight:bold;color:red'>Single PNG</div>");



      var pngClippedNoRepeat = Decoration.create(imageSourcePngClipped, "no-repeat", { top: "230px" });
      bodyElement.append(pngClippedNoRepeat);

      var pngClippedRepeatY = Decoration.create(imageSourcePngClipped, "repeat-y", { height: "400px", top: "230px", left: "200px" });
      bodyElement.append(pngClippedRepeatY);

      bodyElement.append("<div style='position:absolute;left:600px;top:230px;font-size:36px;font-weight:bold;color:red'>Clipped PNG</div>");



      var alphaPngNoRepeat = Decoration.create(imageSourceAlphaPng, "no-repeat", { top: "650px" });
      bodyElement.append(alphaPngNoRepeat);

      var alphaPngRepeatX = Decoration.create(imageSourceAlphaPng, "repeat-x", { width: "350px", top: "650px", left: "50px" });
      bodyElement.append(alphaPngRepeatX);

      var alphaPngRepeatY = Decoration.create(imageSourceAlphaPng, "repeat-y", { height: "200px", top: "650px", left: "420px" });
      bodyElement.append(alphaPngRepeatY);

      bodyElement.append("<div style='position:absolute;left:600px;top:650px;font-size:36px;font-weight:bold;color:red'>Repeated Single Alpha PNG</div>");



      var pngClippedNoRepeat = Decoration.create(imageSourceAlphaPngClippedRepeatX, "no-repeat", { top: "880px" });
      bodyElement.append(pngClippedNoRepeat);

      var pngClippedRepeatX = Decoration.create(imageSourceAlphaPngClippedRepeatX, "repeat-x", { width: "350px", top: "880px", left: "50px" });
      bodyElement.append(pngClippedRepeatX);

      var pngClippedRepeatY = Decoration.create(imageSourceAlphaPngClippedRepeatY, "repeat-y", { height: "200px", top: "880px", left: "420px" });
      bodyElement.append(pngClippedRepeatY);

      bodyElement.append("<div style='position:absolute;left:600px;top:880px;font-size:36px;font-weight:bold;color:red'>Repeated Clipped Alpha PNG</div>");


      var pngClippedScaled = Decoration.create(imageSourceAlphaPngClippedRepeatY, "scale", { width: "150px", height: "150px", top: "1100px" });
      bodyElement.append(pngClippedScaled);

      var pngClippedScaleX = Decoration.create(imageSourceAlphaPngClippedRepeatY, "scale-x", { width: "200px", top: "1100px", left: "200px" });
      bodyElement.append(pngClippedScaleX);

      var pngClippedScaleY = Decoration.create(imageSourceAlphaPngClippedRepeatY, "scale-y", { height: "200px", top: "1100px", left: "450px" });
      bodyElement.append(pngClippedScaleY);

      bodyElement.append("<div style='position:absolute;left:600px;top:1100px;font-size:36px;font-weight:bold;color:red'>Scaled Clipped Alpha PNG</div>");


      var gifNoRepeat = Decoration.create(imageSourceGif, "no-repeat", { width: "136px", height: "41px", top: "1400px" });
      bodyElement.append(gifNoRepeat);

      var gifRepeatX = Decoration.create(imageSourceGif, "repeat-x", { width: "250px", top: "1400px", left: "150px" });
      bodyElement.append(gifRepeatX);

      var gifRepeatY = Decoration.create(imageSourceGif, "repeat-y", { height: "200px", top: "1400px", left: "450px" });
      bodyElement.append(gifRepeatY);

      bodyElement.append("<div style='position:absolute;left:600px;top:1400px;font-size:36px;font-weight:bold;color:red'>Single GIF</div>");



      var gifClippedNoRepeat = Decoration.create(imageSourceGifClipped, "no-repeat", { width: "19px", height: "15px", top: "1700px" });
      bodyElement.append(gifClippedNoRepeat);

      var gifClippedRepeatY = Decoration.create(imageSourceGifClipped, "repeat-y", { width: "19px", height: "200px", top: "1700px", left: "50px" });
      bodyElement.append(gifClippedRepeatY);

      bodyElement.append("<div style='position:absolute;left:600px;top:1700px;font-size:36px;font-weight:bold;color:red'>Clipped GIF</div>");



      bodyElement.setStyle("backgroundColor", "orange");
    }
  }
});
