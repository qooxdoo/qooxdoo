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

#asset(qx/icon/${qx.icontheme}/16/actions/go-previous.png)
#asset(qx/icon/${qx.icontheme}/16/actions/go-next.png)
#asset(qx/icon/${qx.icontheme}/16/actions/media-playback-start.png)
#asset(qx/icon/${qx.icontheme}/16/categories/internet.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.showcase.FormDemo",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var layout = new qx.ui.layout.Grid(9, 5);
      layout.setColumnAlign(0, "right", "top");
      layout.setColumnAlign(2, "right", "top");
      layout.setColumnWidth(1, 160);
      layout.setColumnWidth(2, 72);
      layout.setColumnWidth(3, 108);


      var container = new qx.ui.container.Composite(layout).set({
        decorator: "main",
        padding: 16
      });

      this.getRoot().add(container, {left:40, top:40});

      labels = ["First Name", "Last Name", "City", "Country", "Notes"];
      for (var i=0; i<labels.length; i++) {
        container.add(new qx.ui.basic.Label(labels[i]).set({
          allowShrinkX: false,
          paddingTop: 3
        }), {row: i, column : 0});
      }

      inputs = ["John", "Smith", "New York"];
      for (var i=0; i<inputs.length; i++) {
        container.add(new qx.ui.form.TextField(inputs[i]), {row:i, column:1});
      }

      var countryList = new qx.ui.form.SelectBox();
      var countries = "Afghanistan|Albania|Algeria|American Samoa|Andorra|Angola|Anguilla|Antigua and Barbuda|Argentina|Armenia|Aruba|Australia|Austria|Azerbaijan|Bahamas|Bangladesh|Barbados|Belarus|Belgium|Belize|Benin|Bermuda|Bhutan|Bolivia|Bosnia and Herzegovina|Botswana|Bouvet Island|Brazil|British Indian Ocean Territory|Brunei Darussalam|Bulgaria|Burkina Faso|Burundi|Cambodia|Cameroon|Canada|Cape Verde|Cayman Islands|Central African Republic|Chad|Chile|China|Christmas Island|Cocos (Keeling) Islands|Colombia|Comoros|Congo|Congo, Democratic Republic of the|Cook Islands|Costa Rica|Croatia|Cuba|Cyprus|Czech Republic|Côte d'Ivoire|Djibouti|Dominica|Dominican Republic|Ecuador|Egypt|El Salvador|Equatorial Guinea|Eritrea|Estonia|Ethiopia|Falkland Islands (Malvinas)|Faroe Islands|Fiji|Finland|France|French Guiana|French Polynesia|French Southern Territories|Gabon|Georgia|Germany|Ghana|Gibraltar|Greece|Greenland|Grenada|Guadeloupe|Guam|Guatemala|Guernsey|Guinea|Guinea-Bissau|Guyana|Haiti|Holy See (Vatican City State)|Honduras|Hong Kong|Hungary|Iceland|India|Indonesia|Iran, Islamic Republic of|Iraq|Ireland|Isle of Man|Israel|Italy|Japan|Jersey|Jordan|Kazakhstan|Kenya|Kiribati|Korea, Democratic People's Republic of|Korea, Republic of|Kuwait|Kyrgyzstan|Lao People's Democratic Republic|Latvia|Lebanon|Lesotho|Liberia|Libyan Arab Jamahiriya|Liechtenstein|Lithuania|Luxembourg|Macedonia, the former Yugoslav Republic of|Madagascar|Malawi|Malaysia|Maldives|Mali|Malta|Marshall Islands|Martinique|Mauritania|Mauritius|Mayotte|Mexico|Micronesia, Federated States of|Moldova, Republic of|Monaco|Mongolia|Montenegro|Montserrat|Morocco|Mozambique|Myanmar|Namibia|Nauru|Nepal|Netherlands|Netherlands Antilles|New Caledonia|New Zealand|Nicaragua|Niger|Nigeria|Niue|Norfolk Island|Northern Mariana Islands|Norway|Oman|Pakistan|Palau|Palestinian Territory, Occupied|Panama|Papua New Guinea|Paraguay|Peru|Philippines|Pitcairn|Poland|Portugal|Puerto Rico|Qatar|Russian Federation|Rwanda|Réunion|Saint Barthélemy|Saint Helena|Saint Kitts and Nevis|Saint Lucia|Saint Martin (French part)|Saint Pierre and Miquelon|Saint Vincent and the Grenadines|Samoa|San Marino|Sao Tome and Principe|Saudi Arabia|Senegal|Serbia|Seychelles|Sierra Leone|Singapore|Slovakia|Slovenia|Solomon Islands|Somalia|South Africa|South Georgia and the South Sandwich Islands|Spain|Sri Lanka|Sudan|Suriname|Svalbard and Jan Mayen|Swaziland|Sweden|Switzerland|Syrian Arab Republic|Taiwan, Province of China|Tanzania, United Republic of|Thailand|Timor-Leste|Togo|Tokelau|Tonga|Trinidad and Tobago|Tunisia|Turkey|Turkmenistan|Turks and Caicos Islands|Tuvalu|Ukraine|United Arab Emirates|United Kingdom|United States|United States Minor Outlying Islands|Uruguay|Uzbekistan|Vanuatu|Venezuela|Viet Nam|Virgin Islands, British|Virgin Islands, U.S.|Wallis and Futuna|Yemen|Zambia|Zimbabwe|Åland Islands";
      var countryData = countries.split("|");

      for (var i=0; i<countryData.length; i++) {
        countryList.add(new qx.ui.form.ListItem(countryData[i]));
      }
      countryList.setSelected(countryList.getChildren()[countryData.length - 14]);

      container.add(countryList, {row:3, column: 1});

      // text area
      container.add(new qx.ui.form.TextArea().set({
        height: 250
      }), {row:4, column:1, colSpan: 3});


      // radio buttons
      container.add(new qx.ui.basic.Label("Sex").set({
        allowShrinkX: false,
        paddingTop: 3
      }), {row:0, column:2});

      var female = new qx.ui.form.RadioButton("female");
      var male = new qx.ui.form.RadioButton("male");

      var mgr = new qx.ui.form.RadioGroup();
      mgr.add(female, male);

      container.add(female, {row:0, column:3});
      container.add(male, {row:1, column:3});
      male.setChecked(true);


      // check boxes
      container.add(new qx.ui.basic.Label("Hobbies").set({
        allowShrinkX: false,
        paddingTop: 3
      }), {row:2, column:2});
      container.add(new qx.ui.form.CheckBox("Reading"), {row:2, column:3});
      container.add(new qx.ui.form.CheckBox("Swimming").set({
        enabled: false
      }), {row:3, column:3});


      // buttons
      var paneLayout = new qx.ui.layout.HBox().set({
        spacing: 4,
        alignX : "right"
      });
      var buttonPane = new qx.ui.container.Composite(paneLayout).set({
        paddingTop: 11
      });
      container.add(buttonPane, {row:5, column: 0, colSpan: 4});

      okButton = new qx.ui.form.Button("OK").set({
        minWidth: 80
      });
      okButton.addState("default");
      buttonPane.add(okButton);

      cancelButton = new qx.ui.form.Button("Cancel").set({
        minWidth: 80
      });
      buttonPane.add(cancelButton);
      }
  }
});
