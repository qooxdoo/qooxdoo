/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.OO.defineClass("reader.ArticleView", qx.ui.basic.Terminator,
function(article) {
	qx.ui.basic.Terminator.call(this);
	this.setCssClassName("blogEntry");
	this.setArticle(article);
});

qx.OO.addProperty({ name: "article"});


qx.Proto._modifyArticle = function(propValue, propOldValue, propData) {
  if (this._isCreated) {
    this._applyElementData();
  }

  return true;	
};


qx.Proto._applyElementData = function() {
	var element = this.getElement();
	element.innerHTML = this.getHtml();

	var links = element.getElementsByTagName("a");
	for (var i=0; i<links.length; i++) {
		links[i].target = "_blank";
	};
};


qx.Proto.getHtml = function() {
	var item = this.getArticle();
	if (!item) {
		return "";
	}
	
	var html = new qx.type.StringBuilder();
	
	html.add("<div id='_blogEntry'>");
	
	html.add("<h1 class='blog'>");
	html.add(item.title);
	html.add("</h1>");

	html.add("<div class='date'>");
	html.add(item.date);
	html.add("</div>");

	html.add("<div class='description'>");
	html.add(item.content);
	html.add("</div>");
	
	html.add("<a target='_blank' href='");
	html.add(item.link);
	html.add("'>read more ... </a>");
	
	html.add("</div>");
	
	return html;
}