function(it) {
  var out = '<header class="site-header" role="banner">\n\n  <div class="wrapper">\n    <a class="site-title" href="/">'
      + (it.site.title) + '</a>\n  \n    ';
  if (it.site.pages) {
    out += '\n      <nav class="site-nav">\n        <input type="checkbox" id="nav-trigger" class="nav-trigger" />\n        <label for="nav-trigger">\n          <span class="menu-icon">\n            <svg viewBox="0 0 18 15" width="18px" height="15px">\n              <path fill="#424242" d="M18,1.484c0,0.82-0.665,1.484-1.484,1.484H1.484C0.665,2.969,0,2.304,0,1.484l0,0C0,0.665,0.665,0,1.484,0 h15.031C17.335,0,18,0.665,18,1.484L18,1.484z"/>\n              <path fill="#424242" d="M18,7.516C18,8.335,17.335,9,16.516,9H1.484C0.665,9,0,8.335,0,7.516l0,0c0-0.82,0.665-1.484,1.484-1.484 h15.031C17.335,6.031,18,6.696,18,7.516L18,7.516z"/>\n              <path fill="#424242" d="M18,13.516C18,14.335,17.335,15,16.516,15H1.484C0.665,15,0,14.335,0,13.516l0,0 c0-0.82,0.665-1.484,1.484-1.484h15.031C17.335,12.031,18,12.696,18,13.516L18,13.516z"/>\n            </svg>\n          </span>\n        </label>\n\n        <div class="trigger">\n            ';
    var arr1 = it.site.pages;
    if (arr1) {
      var page, index = -1, l1 = arr1.length - 1;
      while (index < l1) {
        page = arr1[index += 1];
        out += '\n                ';
        if (page.title) {
          out += '\n                <a class="page-link" href="';
          page.url
          out += '">' + (page.title) + '</a>\n                ';
        }
        out += '\n            ';
      }
    }
    out += '\n        </div>\n      </nav>\n    ';
  }
  out += '\n  </div>\n</header>\n';
  return out;

}