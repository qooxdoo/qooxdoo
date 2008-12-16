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

qx.Class.define("demobrowser.demo.ui.Opacity",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);

      var container = new qx.ui.container.Composite(layout);
      container.setPadding(20);

      this.getRoot().add(container, {left:0,top:0});

      container.add(this.getGrid1());
    },


    getGrid1 : function()
    {
      var border = new qx.ui.decoration.Single(1, "solid", "black");

      columns = 30;
      rows = 30;
      boxSize = 15;

      // auto size
      var box = new qx.ui.container.Composite(new qx.ui.layout.Grid());

      // position background text manually
      var bg = new qx.ui.basic.Label().set({
        rich: true,
        content: "To, hi. Cogo plane res, at. Mucro ligo Erigo vos orca tui Loco Trellum, ac. Procedo nec luo Hic in Potens. Qua, qua crur Auctor, se. Aveho Tertius, eo. Eia Acerbus orexis, at. Ars, to. Vae atrer Exitus Nam, si. Per fuga Desumo laus, ut. Quin ita suavis Digladio non, ne me pax altor bona res hoc species, vis Quod funis vis fio Carceres labo ius Notabilis Ac sto via orbus Viriliter at res etiam Lepor vis emo pluma iuro, in edo sis sem qua, ex nec nam boatus inaestimabilis mica, peto for infelix ut Ico lex Nequaquam litigo fas alces In lavo vir haec, levis eia ait, Sileo Rapio Plaga quod praestantia Hoc dux Peraeque qui erro puto Prevenire consilium latro Vorax ora sordesco ilico non sed foveo cotidie subterfugio vix leviter tu iento Pergo mire iocus mica, iuro Amo compello jus irrepo Damno se quod, qui aro Attero duo lex humo quis lucrosus. Recolitus, mel, vae me occido,, rudimentum, lugo per paene pars ne in os en Tutamen congruus. Iam vae pono eo iugum demens, nos Tribuo Pristinus In ausus sto facis seu vasallus nous Oriens ustilo aperte illae Crus pulverulentus, typus igitur Subversio. Ventosus infinitas pax sis fas intellectus Perpetuus compaciscor Consortio, ars per abeo se Incursus nam sal prevarication praetermissio. Ne per artificialiter ingens sanctimonialis tergum, sed Parentela hic Fragilis expello eia per Fastidium illi penetralis Supparum eia ago capio genero in ter deficio aliusmodi. Vel Gaudium reddo interventus pecus tam pala Consulo sui voveo ut ego Opulentia, in occumbo sui Ruo macula. Senex, cum Species sed abhinc nego neo Marcieniensis dictator convenienter aut hoc pars ars iussu laxamentum. Agalmate declaro qua emo Malus cito eia for luxuria Renuntio populus ira Canto en vox Aro mei per. Effluo eo Os cura illum per comprovincialis Recipio trux donec Operam lemiscus servus. Vices diluculo Recedo algeo sto fama pilo per crystallinus hoc per His. Arx limus orior fessus Dimidium curatio Demergo, humo pro Hi. Citatus stipes gero ac ira quin tractus ut forsit Munio inopportunus Obdormio, te maro iam Pannosa vos obses se fefello peto cado contabesco, ius imbuo, tot ruo ut for Summa inedicibilis. Prosum Arcus, dux dis Peto sui pro quid ars obviam Valde nec pennatus, pia Culpo Te defero emo se nos Retribuo trans res, sis suo oro quia hac verecundus, pro Infusco debello Eduro fuga quo Ico Procedo se mora Ico.... progressus, fio huius dux pusio Illum. Vis cui urbs premo praedicatio Remuneror ymo iam vota qui Genitalis os instruo Uter res Texo mora opus alo Liceo prosapia, epos esca Et hos era fabre Abeo te edo Decet feritas, Metuo puteus, decorus. Hac abico nox promptu Expando cura extundo mulco his qui ceno exsequor, faveo Differo. cassis ne Fere, tam turba erro cogo res dominica Vos mens fundo nam quatenus, sapor amitto commoneo Declaro quies niger Sensim sisto Exsto indifferenter. Do iam Maiestas, nam intentio haud",
        decorator: border,
        backgroundColor: "yellow"
      });
      bg.setUserBounds(0, 0, boxSize*columns + 100, boxSize*rows);
      box.add(bg);

      var scale = Math.sqrt((columns-1)*(columns-1) + (rows-1)*(rows-1));

      for (var x=0; x<columns; x++)
      {
        for (var y=0; y<rows; y++)
        {
          box.add(new qx.ui.core.Widget().set({
            backgroundColor: "green",
            height: boxSize,
            width: boxSize,
            opacity: Math.sqrt(x*x+y*y) / scale
          }), {row: x, column: y});
        }
      }

      return box;
    }
  }
});
