<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

<!--
<xsl:output method="xml" omit-xml-declaration="yes" doctype-public="-//W3C//DTD XHTML 1.1//EN" doctype-system="http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd" indent="no" encoding="iso-8859-1"/>
-->
<!--
<xsl:output method="html" indent="no" encoding="iso-8859-1"/>
-->
<!--
<xsl:output method="html" omit-xml-declaration="yes" doctype-public="-//W3C//DTD HTML 4.01//EN" doctype-system="http://www.w3.org/TR/html40/strict.dtd" indent="no" encoding="iso-8859-1"/>
-->

<xsl:output method="xml" omit-xml-declaration="no" doctype-public="-//W3C//DTD XHTML 1.1//EN" doctype-system="http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd" indent="no" encoding="iso-8859-15"/>

<xsl:param name="job" select="'default'"/>
<xsl:param name="mode" select="'default'"/>
<xsl:param name="prefix" select="'default'"/>
<xsl:param name="title" select="'default'"/>
<xsl:param name="holder" select="'default'"/>
<xsl:param name="group" select="'default'"/>
<xsl:param name="id" select="'0'"/>
<xsl:param name="subid" select="'0'"/>
<xsl:param name="subname" select="''"/>
<xsl:param name="pathrel" select="''"/>
<xsl:param name="match" select="'default'"/>
<xsl:param name="name" select="'default'"/>

<xsl:template match="/">
  <html>
    <head>
      <title><xsl:value-of select="translate($mode, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>: <xsl:value-of select="$title"/><xsl:value-of select="concat(' (', $job, ') ')"/>@ Documentation System</title>

      <script type="text/javascript" src="{$pathrel}script/main.js"></script>
      <link media="screen" href="{$pathrel}style/screen.css" type="text/css" rel="stylesheet"/>
      <link media="print" href="{$pathrel}style/print.css" type="text/css" rel="stylesheet"/>
    </head>
    <body>
      <xsl:choose>
        <xsl:when test="$mode = 'css'">
          <div id="navigation">
            <a href="{$pathrel}index.html">Overview</a>
            <xsl:text> | </xsl:text>
            <a href="{$pathrel}preview.html">Preview</a>
            <xsl:text> | </xsl:text>
            <a href="{$pathrel}colorlist.html">Colors</a>
            <xsl:text> | </xsl:text>
            <a href="{$pathrel}propertylist.html">Properties</a>
            <xsl:text> | </xsl:text>
            <a href="{$pathrel}filelist.html">Files</a>
            <xsl:text> | </xsl:text>
            <a href="{$pathrel}grouplist.html">Groups</a>
            <xsl:text> | </xsl:text>
            <a href="{$pathrel}rulelist.html">Rules</a>
          </div>
        </xsl:when>
        <xsl:when test="$mode = 'js'">
            <a href="{$pathrel}index.html">Overview</a>
            <xsl:text> | </xsl:text>
            <a href="{$pathrel}systemobjectoverview.html">System-Objects</a>
            <xsl:text> | </xsl:text>
            <a href="{$pathrel}classtree.html">Class-Tree</a>
            <xsl:text> | </xsl:text>
            <a href="{$pathrel}classoverview.html">Class-List</a>
            <xsl:text> | </xsl:text>
            <a href="{$pathrel}globalfunctionoverview.html">Global Functions</a>
            <xsl:text> | </xsl:text>
            <a href="{$pathrel}filelist.html">Files</a>
            <xsl:text> | </xsl:text>
        </xsl:when>
      </xsl:choose>

      <h1><xsl:value-of select="$title"/></h1>

      <xsl:choose>
        <xsl:when test="$mode = 'css'">
          <xsl:choose>
            <xsl:when test="$job = 'overview'">
              <xsl:call-template name="css_overview"/>
            </xsl:when>

            <xsl:when test="$job = 'rulelist'">
              <xsl:call-template name="css_rulelist"/>
            </xsl:when>

            <xsl:when test="$job = 'filelist'">
              <xsl:call-template name="css_filelist"/>
            </xsl:when>

            <xsl:when test="$job = 'preview'">
              <xsl:call-template name="css_preview"/>
            </xsl:when>

            <xsl:when test="$job = 'colorlist'">
              <xsl:call-template name="css_colorlist"/>
            </xsl:when>

            <xsl:when test="$job = 'propertylist'">
              <xsl:call-template name="css_propertylist"/>
            </xsl:when>

            <xsl:when test="$job = 'grouplist'">
              <xsl:call-template name="css_grouplist"/>
            </xsl:when>

            <xsl:when test="$job = 'usagelist'">
              <xsl:call-template name="css_showlist">
                <xsl:with-param name="group" select="$holder"/>
                <xsl:with-param name="frame">
                  <xsl:choose>
                    <xsl:when test="$group = 'tag'">tags</xsl:when>
                    <xsl:when test="$group = 'id'">ids</xsl:when>
                   <xsl:when test="$group = 'class'">classes</xsl:when>
                  </xsl:choose>
                </xsl:with-param>
                <xsl:with-param name="elem" select="$group"/>
              </xsl:call-template>
            </xsl:when>

            <xsl:when test="$job = 'filedescription'">
              <xsl:call-template name="css_filedescription">
                <xsl:with-param name="id" select="$id"/>
              </xsl:call-template>
            </xsl:when>

            <xsl:when test="$job = 'groupdescription'">
              <xsl:call-template name="css_groupdescription">
                <xsl:with-param name="id" select="$id"/>
              </xsl:call-template>
            </xsl:when>

            <xsl:when test="$job = 'ruledescription'">
              <xsl:call-template name="css_ruledescription">
                <xsl:with-param name="id" select="$id"/>
              </xsl:call-template>
            </xsl:when>

            <xsl:otherwise>
              Unsupported output mode [2] (<xsl:value-of select="$job"/>)!
            </xsl:otherwise>
          </xsl:choose>
        </xsl:when>
        <xsl:when test="$mode = 'js'">
          <xsl:choose>
            <xsl:when test="$job = 'overview'">
              <xsl:call-template name="js_overview"/>
            </xsl:when>

            <xsl:when test="$job = 'filelist'">
              <xsl:call-template name="js_filelist"/>
            </xsl:when>
            <xsl:when test="$job = 'filedescription'">
              <xsl:call-template name="js_filedescription"/>
            </xsl:when>

            <xsl:when test="$job = 'objectoverview'">
              <xsl:call-template name="js_objectoverview"/>
            </xsl:when>
            <xsl:when test="$job = 'classoverview'">
              <xsl:call-template name="js_classoverview"/>
            </xsl:when>
            <xsl:when test="$job = 'classtree'">
              <xsl:call-template name="js_classtree"/>
            </xsl:when>
            <xsl:when test="$job = 'systemobjectoverview'">
              <xsl:call-template name="js_systemobjectoverview"/>
            </xsl:when>

            <xsl:when test="$job = 'globalfunctionoverview'">
              <xsl:call-template name="js_globalfunctionoverview"/>
            </xsl:when>
            <xsl:when test="$job = 'globalfunctiondescription'">
              <xsl:call-template name="js_globalfunctiondescription"/>
            </xsl:when>

            <xsl:when test="$job = 'objectdescription'">
              <xsl:call-template name="js_objectdescription"/>
            </xsl:when>
            <xsl:when test="$job = 'objectfunction'">
              <xsl:call-template name="js_objectfunction"/>
            </xsl:when>

            <xsl:when test="$job = 'classdescription'">
              <xsl:call-template name="js_classdescription"/>
            </xsl:when>
            <xsl:when test="$job = 'classfunction'">
              <xsl:call-template name="js_classfunction"/>
            </xsl:when>
            <xsl:when test="$job = 'classproperty'">
              <xsl:call-template name="js_classproperty"/>
            </xsl:when>

            <xsl:when test="$job = 'systemobjectdescription'">
              <xsl:call-template name="js_systemobjectdescription"/>
            </xsl:when>
            <xsl:when test="$job = 'systemobjectfunction'">
              <xsl:call-template name="js_systemobjectfunction"/>
            </xsl:when>




            <xsl:otherwise>
              Unsupported output mode [2] (<xsl:value-of select="$job"/>)!
            </xsl:otherwise>
          </xsl:choose>
        </xsl:when>
        <xsl:otherwise>
          Unsupported output mode [1]!
        </xsl:otherwise>
      </xsl:choose>

      <!--
      [[<xsl:copy-of select="."/>]]
      -->
    </body>
  </html>
</xsl:template>

<xsl:template name="js_overview">
  <h2>Most used</h2>

  <ul>
    <li><a href="systemobjectoverview.html">List of DOM-Extensions</a></li>
    <!--
    <li><a href="objectoverview.html">List of Objects</a></li>
    -->
    <li><a href="classtree.html">Tree of all Classes</a></li>
    <li><a href="classoverview.html">List of all Classes</a></li>
    <li><a href="globalfunctionoverview.html">List of all global Functions</a></li>
  </ul>
</xsl:template>

<xsl:template name="js_systemobjectoverview">
  <table class="list" cellspacing="1" cellpadding="0">
    <thead>
      <tr>
        <th class="name">Name</th>
        <th class="details">Details</th>
      </tr>
    </thead>

    <xsl:for-each select="/data/systemobject">
      <xsl:sort select="@name"/>

      <tr>
          <xsl:attribute name="class">
            <xsl:choose>
              <xsl:when test="position() mod 2 = 0">even</xsl:when>
              <xsl:otherwise>odd</xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
      
      
        <td><xsl:value-of select="@name"/></td>
        <td><a href="systemobjects/systemobject_{@name}.html">Details...</a></td>
      </tr>
    </xsl:for-each>
  </table>
</xsl:template>

<xsl:template name="js_systemobjectdescription">
  <table class="list" cellspacing="1" cellpadding="0">
  <thead>
    <tr>
      <th>Name</th>
      <th class="title">Title</th>
      <th class="details">Details</th>
    </tr>
  </thead>
  <tbody>
    <xsl:for-each select="/data/systemobject[position() = $id]/functions/function">
      <xsl:sort select="@name"/>
      <tr>
          <xsl:attribute name="class">
            <xsl:choose>
              <xsl:when test="position() mod 2 = 0">even</xsl:when>
              <xsl:otherwise>odd</xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
      
      
        <td><xsl:value-of select="@name"/></td>
        <td><xsl:apply-templates select="short/node()|short/text()"/></td>
        <td><a href="systemobject_{../../@name}/functions/function_{@name}.html">Details...</a></td>
      </tr>
    </xsl:for-each>
  </tbody>
  </table>
</xsl:template>

<xsl:template name="js_propertydetail">
  <xsl:param name="base"/>

  <div id="info">
  <ul>
    <li>
      <strong>Name: </strong>
      <xsl:value-of select="@name"/>
    </li>

    <li>
      <strong>Type: </strong>
      <xsl:call-template name="js_type"/>
    </li>

    <xsl:if test="$base != ''">
      <li>
        <strong>Object: </strong>
        <a href="../../class_{$base}.html"><xsl:value-of select="$base"/></a>
      </li>
    </xsl:if>

    <xsl:variable name="filename">
      <xsl:choose>
        <xsl:when test="filename"><xsl:value-of select="filename"/></xsl:when>
        <xsl:when test="file"><xsl:value-of select="file"/></xsl:when>
        <xsl:when test="@filename"><xsl:value-of select="@filename"/></xsl:when>
        <xsl:when test="@file"><xsl:value-of select="@file"/></xsl:when>
      </xsl:choose>
    </xsl:variable>

    <xsl:if test="$filename != ''">
      <li>
        <strong>File: </strong>
        <a href="{$pathrel}files/file_{translate($filename, '/', '-')}.html">
          <xsl:value-of select="$filename"/>
        </a>
      </li>
    </xsl:if>

    <xsl:if test="info/email and info/author">
      <li><strong>Author: </strong> <a href="mailto:{info/email}"><xsl:value-of select="info/author"/></a></li>
    </xsl:if>

    <xsl:if test="info/date">
      <li><strong>Last Modified: </strong><xsl:value-of select="info/date"/></li>
    </xsl:if>

    <xsl:if test="info/version">
      <li><strong>Version: </strong><xsl:value-of select="info/version"/></li>
    </xsl:if>
  </ul>
  </div>

  <div id="title">
    <xsl:choose>
      <xsl:when test="short">
        <xsl:apply-templates select="short/node()|short/text()"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="@name"/>
      </xsl:otherwise>
    </xsl:choose>
  </div>

  <xsl:if test="description">
    <div id="description">
      <xsl:for-each select="description/p">
        <p><xsl:apply-templates/></p>
      </xsl:for-each>
    </div>
  </xsl:if>

  <br clear="both"/>


  <h2>Public Functions</h2>

  <h3>Get</h3>

  <p>Get current value.</p>

  <xsl:call-template name="js_propertycmd">
    <xsl:with-param name="pre" select="'get'"/>
    <xsl:with-param name="base" select="$base"/>
  </xsl:call-template>

  <h3>Set</h3>

  <p>Set new value.</p>

  <xsl:call-template name="js_propertycmd">
    <xsl:with-param name="pre" select="'set'"/>
    <xsl:with-param name="base" select="$base"/>
    <xsl:with-param name="paramlist">newValue</xsl:with-param>
  </xsl:call-template>

  <!--
  <h3>Reset</h3>

  <p>Reset value to default value.</p>

  <xsl:call-template name="js_propertycmd">
    <xsl:with-param name="pre" select="'reset'"/>
    <xsl:with-param name="base" select="$base"/>
  </xsl:call-template>


  <h2>Private Functions</h2>

  <h3>Change</h3>

  <p>Cache new modified value.</p>

  <xsl:call-template name="js_propertycmd">
    <xsl:with-param name="pre" select="'change'"/>
    <xsl:with-param name="base" select="$base"/>
    <xsl:with-param name="paramlist">currentValue</xsl:with-param>
  </xsl:call-template>

  <h3>Save</h3>

  <p>Save new modified value to cookie.</p>

  <xsl:call-template name="js_propertycmd">
    <xsl:with-param name="pre" select="'save'"/>
    <xsl:with-param name="base" select="$base"/>
    <xsl:with-param name="paramlist">currentValue</xsl:with-param>
  </xsl:call-template>

  <h3>Update</h3>

  <p>Setup value from the evaluation.</p>

  <xsl:call-template name="js_propertycmd">
    <xsl:with-param name="pre" select="'update'"/>
    <xsl:with-param name="base" select="$base"/>
    <xsl:with-param name="paramlist">modifyObject</xsl:with-param>
  </xsl:call-template>

  <h3>Depend</h3>

  <p>Inform Depend-Object to handle object modifications.</p>

  <xsl:call-template name="js_propertycmd">
    <xsl:with-param name="pre" select="'depend'"/>
    <xsl:with-param name="base" select="$base"/>
    <xsl:with-param name="paramlist">currentValue, dependTree</xsl:with-param>
  </xsl:call-template>

  <h3>Handle</h3>

  <p>Handle Update Requests from Depend-Object.</p>

  <xsl:call-template name="js_propertycmd">
    <xsl:with-param name="pre" select="'handle'"/>
    <xsl:with-param name="base" select="$base"/>
    <xsl:with-param name="paramlist">currentValue, dependTree</xsl:with-param>
  </xsl:call-template>
  -->
</xsl:template>

<xsl:template name="js_propertycmd">
  <xsl:param name="pre"/>
  <xsl:param name="base"/>
  <xsl:param name="paramlist"/>

  <xsl:variable name="cname">
    <xsl:value-of select="translate(substring(@name, 1, 1), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
    <xsl:value-of select="substring(@name, 2)"/>
  </xsl:variable>

  <!-- <xsl:for-each select="parameters/parameter"><xsl:sort select="@position" data-type="number"/><xsl:choose><xsl:when test="@mandatory = 'true'"><span class="mandatory"><xsl:value-of select="@name"/></span></xsl:when><xsl:otherwise><xsl:value-of select="@name"/></xsl:otherwise></xsl:choose><xsl:if test="position()!=last()">, </xsl:if></xsl:for-each> -->

  <pre>
    <xsl:if test="$base != ''"><span class="object"><xsl:value-of select="$base"/></span><span class="dot">.</span></xsl:if><span class="funcname"><xsl:value-of select="$pre"/><xsl:value-of select="$cname"/></span><span class="agrafe">(</span><xsl:value-of select="$paramlist"/><span class="agrafe">)</span><span class="semicolon">;</span>
  </pre>
</xsl:template>


<xsl:template name="js_classfunction">
  <xsl:for-each select="/data/class[position() = $id]/functions/function[@name = $subname]">
    <xsl:call-template name="js_functiondetail">
      <xsl:with-param name="base" select="../../@name"/>
    </xsl:call-template>
  </xsl:for-each>
</xsl:template>

<xsl:template name="js_classproperty">
  <xsl:for-each select="/data/class[position() = $id]/properties/property[@name = $subname]">
    <xsl:call-template name="js_propertydetail">
      <xsl:with-param name="base" select="../../@name"/>
    </xsl:call-template>
  </xsl:for-each>
</xsl:template>

<xsl:template name="js_objectfunction">
  <xsl:for-each select="/data/propertylist[position() = $id]/functions/function[@name = $subname]">
    <xsl:call-template name="js_functiondetail">
      <xsl:with-param name="base" select="../../@name"/>
    </xsl:call-template>
  </xsl:for-each>
</xsl:template>

<xsl:template name="js_systemobjectfunction">
  <xsl:for-each select="/data/systemobject[position() = $id]/functions/function[@name = $subname]">
    <xsl:call-template name="js_functiondetail">
      <xsl:with-param name="base" select="../../@name"/>
    </xsl:call-template>
  </xsl:for-each>
</xsl:template>

<xsl:template name="js_objectoverview">
  <table class="list" cellspacing="1" cellpadding="0">
    <thead>
      <tr>
        <th class="name">Name</th>
        <th class="title">Title</th>
        <th class="details">Details</th>
      </tr>
    </thead>

    <xsl:for-each select="/data/propertylist">
      <xsl:sort select="@name"/>

      <tr>
          <xsl:attribute name="class">
            <xsl:choose>
              <xsl:when test="position() mod 2 = 0">even</xsl:when>
              <xsl:otherwise>odd</xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
      
      
        <td><xsl:value-of select="@name"/></td>
        <td><xsl:apply-templates select="short/node()|short/text()"/></td>
        <td><a href="objects/object_{@name}.html">Details...</a></td>
      </tr>
    </xsl:for-each>
  </table>
</xsl:template>

<xsl:template name="js_objectdescription">
  <table class="list" cellspacing="1" cellpadding="0">
  <thead>
    <tr>
      <th>Name</th>
      <th class="title">Title</th>
      <th class="details">Details</th>
    </tr>
  </thead>
  <tbody>
    <xsl:for-each select="/data/propertylist[position() = $id]/functions/function">
      <xsl:sort select="@name"/>
      <tr>
          <xsl:attribute name="class">
            <xsl:choose>
              <xsl:when test="position() mod 2 = 0">even</xsl:when>
              <xsl:otherwise>odd</xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
      
      
        <td><xsl:value-of select="@name"/></td>
        <td><xsl:apply-templates select="short/node()|short/text()"/></td>
        <td><a href="object_{../../@name}/functions/function_{@name}.html">Details...</a></td>
      </tr>
    </xsl:for-each>
  </tbody>
  </table>
</xsl:template>

<xsl:template name="js_classhierarchy">
  <xsl:param name="name"/>

  <h2>Inheritance</h2>

  <p>
    <strong>Parents: </strong>
    <xsl:call-template name="js_classhierarchyrecurser">
      <xsl:with-param name="name" select="$name"/>
      <xsl:with-param name="base" select="$name"/>
    </xsl:call-template>

    <xsl:if test="count(/data/class[inherit/text() = $name]) &gt; 0">
      <br/>
      <strong>Direct Childs: </strong>
      <xsl:for-each select="/data/class[inherit/text() = $name]">
        <xsl:sort select="@name"/>

        <a href="{$pathrel}classes/class_{@name}.html">
          <xsl:value-of select="@name"/>
        </a>
        <xsl:if test="position() != last()">, </xsl:if>
      </xsl:for-each>
    </xsl:if>
  </p>
</xsl:template>

<xsl:template name="js_classhierarchyrecurser">
  <xsl:param name="name"/>
  <xsl:param name="base"/>

  <xsl:choose>
    <xsl:when test="/data/class[@name = $name]/inherit/text()">
      <xsl:choose>
        <xsl:when test="$name = $base">
          <xsl:value-of select="$name"/>
        </xsl:when>
        <xsl:otherwise>
          <a href="{$pathrel}classes/class_{$name}.html">
            <xsl:value-of select="$name"/>
          </a>
        </xsl:otherwise>
      </xsl:choose>

      <xsl:text> &#187; </xsl:text>

      <xsl:call-template name="js_classhierarchyrecurser">
        <xsl:with-param name="name" select="/data/class[@name = $name]/inherit/text()"/>
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      <xsl:choose>
        <xsl:when test="$name = $base">
          <xsl:value-of select="$name"/>
        </xsl:when>
        <xsl:otherwise>
          <a href="{$pathrel}classes/class_{$name}.html">
            <xsl:value-of select="$name"/>
          </a>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="js_classtree">
  <xsl:for-each select="/data/class">
    <xsl:sort select="@name"/>

    <xsl:if test="not(inherit) or inherit = ''">
      <ul class="jsclasstree">
        <xsl:call-template name="js_classrecurser">
          <xsl:with-param name="name" select="@name"/>
        </xsl:call-template>
      </ul>
    </xsl:if>
  </xsl:for-each>
</xsl:template>


<xsl:template name="js_classrecurser">
  <xsl:param name="name"/>

  <li>
    <code><a href="{$pathrel}classes/class_{@name}.html"><xsl:value-of select="$name"/></a></code>

    <xsl:if test="count(/data/class[inherit/text() = $name]) &gt; 0">
      <ul>
        <xsl:for-each select="/data/class[inherit/text() = $name]">
          <xsl:sort select="@name"/>

          <xsl:call-template name="js_classrecurser">
            <xsl:with-param name="name" select="@name"/>
          </xsl:call-template>
        </xsl:for-each>
      </ul>
    </xsl:if>
  </li>
</xsl:template>


<xsl:template name="js_classoverview">
  <table class="list" cellspacing="1" cellpadding="0">
    <thead>
      <tr>
        <th class="name">Name</th>
        <th class="inherit">Inherit</th>
        <!--
        <th>Parameters</th>
        -->
        <th>Properties</th>
      </tr>
    </thead>

    <xsl:for-each select="/data/class">
      <xsl:sort select="@name"/>

      <xsl:variable name="classname"><xsl:value-of select="@name"/></xsl:variable>

      <tr>
          <xsl:attribute name="class">
            <xsl:choose>
              <xsl:when test="position() mod 2 = 0">even</xsl:when>
              <xsl:otherwise>odd</xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
      
      
        <td><strong><a href="classes/class_{$classname}.html"><xsl:value-of select="$classname"/></a></strong></td>
        <td>
          <xsl:choose>
            <xsl:when test="inherit"><a href="classes/class_{inherit}.html"><xsl:value-of select="inherit"/></a></xsl:when>
            <xsl:otherwise>-</xsl:otherwise>
          </xsl:choose>
        </td>
        <!--
        <td>
          <xsl:choose>
            <xsl:when test="count(parameters/parameter) = 0">-</xsl:when>
            <xsl:otherwise>
              <xsl:for-each select="parameters/parameter">
                <xsl:sort select="@position" data-type="number"/>

                <xsl:choose>
                  <xsl:when test="@mandatory = 'true'">
                    <span class="mandatory">
                      <xsl:value-of select="@name"/>
                    </span>
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:value-of select="@name"/>
                  </xsl:otherwise>
                </xsl:choose>

                <br/>
              </xsl:for-each>
            </xsl:otherwise>
          </xsl:choose>
        </td>
        -->
        <td>
          <xsl:for-each select="properties/property">
            <xsl:sort select="@name"/>

            <a href="classes/class_{$classname}/properties/property_{@name}.html">
              <xsl:value-of select="@name"/>
            </a>

            <xsl:if test="position() != last()">, </xsl:if>
          </xsl:for-each>
        </td>
      </tr>
    </xsl:for-each>
  </table>
</xsl:template>


<xsl:template name="js_classdescription">
  <xsl:for-each select="/data/class[position() = $id]">

  <div id="info">
    <ul>
      <li>
        <strong>Name: </strong>
        <xsl:value-of select="@name"/>
      </li>

      <xsl:if test="inherit">
        <li><strong>Inherit: </strong><a href="class_{inherit}.html"><xsl:value-of select="inherit"/></a></li>
      </xsl:if>

      <xsl:variable name="filename">
        <xsl:choose>
          <xsl:when test="filename"><xsl:value-of select="filename"/></xsl:when>
          <xsl:when test="file"><xsl:value-of select="file"/></xsl:when>
          <xsl:when test="@filename"><xsl:value-of select="@filename"/></xsl:when>
          <xsl:when test="@file"><xsl:value-of select="@file"/></xsl:when>
        </xsl:choose>
      </xsl:variable>

      <xsl:if test="$filename != ''">
        <li>
          <strong>File: </strong>
          <a href="{$pathrel}files/file_{translate($filename, '/', '-')}.html">
            <xsl:value-of select="$filename"/>
          </a>
        </li>
      </xsl:if>

      <xsl:if test="info/email and info/author">
        <li><strong>Author: </strong> <a href="mailto:{info/email}"><xsl:value-of select="info/author"/></a></li>
      </xsl:if>

      <xsl:if test="info/date">
        <li><strong>Last Modified: </strong><xsl:value-of select="info/date"/></li>
      </xsl:if>

      <li><strong>Type: </strong>
      <xsl:choose>
        <xsl:when test="usagetype/text() = 'private'">private</xsl:when>
        <xsl:otherwise>public</xsl:otherwise>
      </xsl:choose>
      </li>
    </ul>
  </div>

  <div id="title">
    <xsl:choose>
      <xsl:when test="short">
        <xsl:apply-templates select="short/node()|short/text()"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="@name"/>
      </xsl:otherwise>
    </xsl:choose>
  </div>

  <xsl:if test="description">
    <div id="description">
      <xsl:for-each select="description/p">
        <p><xsl:apply-templates/></p>
      </xsl:for-each>
    </div>
  </xsl:if>

  <br clear="both"/>

  <xsl:call-template name="js_classhierarchy">
    <xsl:with-param name="name" select="@name"/>
  </xsl:call-template>

  <xsl:call-template name="js_paramlist"/>

  <h2>Type</h2>

  <xsl:choose>
    <xsl:when test="usagetype/text() = 'private'">
     <p>This class is <strong>private</strong>. <br/>It is only for internal programming and should not be used by the user!</p>
    </xsl:when>
    <xsl:otherwise>
      <p>This class is <strong>public</strong>. <br/>It can be used by both user and programmer.</p>
    </xsl:otherwise>
  </xsl:choose>
  
  <h2>Properties</h2>
  <table class="list" cellspacing="1" cellpadding="0">
    <thead>
      <tr>
        <th class="cname">Name</th>
        <th class="ctitle">Title</th>
      </tr>
    </thead>
    <tbody>
      <xsl:call-template name="js_inheritedpropertylist">
        <xsl:with-param name="name"><xsl:value-of select="@name"/></xsl:with-param>
        <xsl:with-param name="base"><xsl:value-of select="@name"/></xsl:with-param>
      </xsl:call-template> 
    </tbody>
  </table>  
  
  <h2>Functions</h2>
  <table class="list" cellspacing="1" cellpadding="0">
    <thead>
      <tr>
        <th class="cname">Name</th>
        <th class="ctitle">Title</th>
      </tr>
    </thead>
    <tbody>
      <xsl:call-template name="js_inheritedfunctionlist">
        <xsl:with-param name="name"><xsl:value-of select="@name"/></xsl:with-param>
        <xsl:with-param name="base"><xsl:value-of select="@name"/></xsl:with-param>
      </xsl:call-template> 
    </tbody>
  </table>    

  </xsl:for-each>
</xsl:template>

<xsl:template name="js_inheritedfunctionlist">
  <xsl:param name="name"/>
  <xsl:param name="base"/>
  
  <xsl:for-each select="/data/class[@name = $name]">
    <xsl:if test="count(functions/function) &gt; 0">
      <tr class="maingroup">
        <td colspan="2"><xsl:value-of select="$name"/></td>
      </tr>      
    </xsl:if>    
  
    <xsl:if test="count(functions/function[not(usagetype='private')]) &gt; 0">
      <tr class="group">
        <td colspan="2">Public</td>
      </tr>

      <xsl:for-each select="functions/function[not(usagetype='private')]">
        <xsl:sort select="@name"/>

        <xsl:variable name="sname">
          <xsl:choose>
            <xsl:when test="starts-with(@name, 'modify')">
              <xsl:value-of select="substring(@name, 7)"/>
            </xsl:when>
            <xsl:when test="starts-with(@name, 'eval')">
              <xsl:value-of select="substring(@name, 5)"/>
            </xsl:when>
          </xsl:choose>
        </xsl:variable>
 
        <tr>
          <xsl:attribute name="class">
            <xsl:choose>
              <xsl:when test="position() mod 2 = 0">even</xsl:when>
              <xsl:otherwise>odd</xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
          
          <td><strong><a href="class_{../../@name}/functions/function_{@name}.html"><xsl:value-of select="@name"/></a></strong></td>
          <td><xsl:apply-templates select="short/node()|short/text()"/></td>
        </tr>
      </xsl:for-each>
    </xsl:if>
      
    <xsl:if test="count(functions/function[usagetype='private']) &gt; 0">
      <tr class="group">
        <td colspan="2">Private</td>
      </tr>
      
      <xsl:for-each select="functions/function[usagetype='private']">
        <xsl:sort select="@name"/>

        <xsl:variable name="sname">
          <xsl:choose>
            <xsl:when test="starts-with(@name, 'modify')">
              <xsl:value-of select="substring(@name, 7)"/>
            </xsl:when>
            <xsl:when test="starts-with(@name, 'eval')">
              <xsl:value-of select="substring(@name, 5)"/>
            </xsl:when>
          </xsl:choose>
        </xsl:variable>

        <tr>
          <xsl:attribute name="class">
            <xsl:choose>
              <xsl:when test="position() mod 2 = 0">even</xsl:when>
              <xsl:otherwise>odd</xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>        
        
          <td><strong><a href="class_{../../@name}/functions/function_{@name}.html"><xsl:value-of select="@name"/></a></strong></td>
          <td><xsl:apply-templates select="short/node()|short/text()"/></td>
        </tr>
      </xsl:for-each>      
    </xsl:if>      

    <xsl:if test="/data/class[@name = $name]/inherit/text()">
      <xsl:call-template name="js_inheritedfunctionlist">
        <xsl:with-param name="name" select="/data/class[@name = $name]/inherit/text()"/>
      </xsl:call-template>
    </xsl:if>  
  </xsl:for-each>
</xsl:template>


<xsl:template name="js_inheritedpropertylist">
  <xsl:param name="name"/>
  <xsl:param name="base"/>
  
  <xsl:for-each select="/data/class[@name = $name]">
    <xsl:if test="count(properties/property) &gt; 0">
      <tr class="maingroup">
        <td colspan="2"><xsl:value-of select="$name"/></td>
      </tr>      
    </xsl:if>    
  
    <xsl:if test="count(properties/property[not(usagetype='private')]) &gt; 0">
      <tr class="group">
        <td colspan="2">Public</td>
      </tr>

      <xsl:for-each select="properties/property[not(usagetype='private')]">
        <xsl:sort select="@name"/>

        <xsl:variable name="sname">
          <xsl:choose>
            <xsl:when test="starts-with(@name, 'modify')">
              <xsl:value-of select="substring(@name, 7)"/>
            </xsl:when>
            <xsl:when test="starts-with(@name, 'eval')">
              <xsl:value-of select="substring(@name, 5)"/>
            </xsl:when>
          </xsl:choose>
        </xsl:variable>
 
        <tr>
          <xsl:attribute name="class">
            <xsl:choose>
              <xsl:when test="position() mod 2 = 0">even</xsl:when>
              <xsl:otherwise>odd</xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
          
          <td><strong><a href="class_{../../@name}/properties/property_{@name}.html"><xsl:value-of select="@name"/></a></strong></td>
          <td><xsl:apply-templates select="short/node()|short/text()"/></td>
        </tr>
      </xsl:for-each>
    </xsl:if>
      
    <xsl:if test="count(properties/property[usagetype='private']) &gt; 0">
      <tr class="group">
        <td colspan="2">Private</td>
      </tr>
      
      <xsl:for-each select="properties/property[usagetype='private']">
        <xsl:sort select="@name"/>

        <xsl:variable name="sname">
          <xsl:choose>
            <xsl:when test="starts-with(@name, 'modify')">
              <xsl:value-of select="substring(@name, 7)"/>
            </xsl:when>
            <xsl:when test="starts-with(@name, 'eval')">
              <xsl:value-of select="substring(@name, 5)"/>
            </xsl:when>
          </xsl:choose>
        </xsl:variable>

        <tr>
          <xsl:attribute name="class">
            <xsl:choose>
              <xsl:when test="position() mod 2 = 0">even</xsl:when>
              <xsl:otherwise>odd</xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>        
        
          <td><strong><a href="class_{../../@name}/properties/property_{@name}.html"><xsl:value-of select="@name"/></a></strong></td>
          <td><xsl:apply-templates select="short/node()|short/text()"/></td>
        </tr>
      </xsl:for-each>      
    </xsl:if>      

    <xsl:if test="/data/class[@name = $name]/inherit/text()">
      <xsl:call-template name="js_inheritedpropertylist">
        <xsl:with-param name="name" select="/data/class[@name = $name]/inherit/text()"/>
      </xsl:call-template>
    </xsl:if>  
  </xsl:for-each>
</xsl:template>




<xsl:template name="js_globalfunctionoverview">
  <table class="list" cellspacing="1" cellpadding="0">
    <thead>
      <tr>
        <th class="name">Name</th>
        <th class="title">Title</th>
        <th class="date">Date</th>
      </tr>
    </thead>

    <xsl:for-each select="/data/globalfunction">
      <xsl:sort select="@name"/>

      <tr>
        <xsl:attribute name="class">
          <xsl:choose>
            <xsl:when test="position() mod 2 = 0">even</xsl:when>
            <xsl:otherwise>odd</xsl:otherwise>
          </xsl:choose>
        </xsl:attribute>
      
        <td><a href="globalfunctions/globalfunction_{@name}.html"><xsl:value-of select="@name"/></a></td>
        <td><xsl:value-of select="short"/></td>
        <td><xsl:value-of select="info/date"/></td>
      </tr>
    </xsl:for-each>
  </table>
</xsl:template>

<xsl:template name="js_globalfunctiondescription">
  <xsl:for-each select="/data/globalfunction[position() = $id]">
    <xsl:call-template name="js_functiondetail"/>
  </xsl:for-each>
</xsl:template>

<xsl:template name="js_functiondetail">
  <xsl:param name="base"/>

  <div id="info">
  <ul>
    <li>
      <strong>Name: </strong>
      <xsl:value-of select="@name"/>
    </li>

    <xsl:if test="$base != ''">
      <li>
        <strong>Object: </strong>
        <xsl:value-of select="$base"/>
      </li>
    </xsl:if>

    <xsl:if test="usagetype and usagetype/text() != ''">
      <li>
        <strong>Type: </strong>
        <xsl:value-of select="usagetype"/>
      </li>
    </xsl:if>

    <xsl:variable name="filename">
      <xsl:choose>
        <xsl:when test="filename"><xsl:value-of select="filename"/></xsl:when>
        <xsl:when test="file"><xsl:value-of select="file"/></xsl:when>
        <xsl:when test="@filename"><xsl:value-of select="@filename"/></xsl:when>
        <xsl:when test="@file"><xsl:value-of select="@file"/></xsl:when>
      </xsl:choose>
    </xsl:variable>

    <xsl:if test="$filename != ''">
      <li>
        <strong>File: </strong>
        <a href="{$pathrel}files/file_{translate($filename, '/', '-')}.html">
          <xsl:value-of select="$filename"/>
        </a>
      </li>
    </xsl:if>

    <xsl:if test="info/email and info/author">
      <li><strong>Author: </strong> <a href="mailto:{info/email}"><xsl:value-of select="info/author"/></a></li>
    </xsl:if>

    <xsl:if test="info/date">
      <li><strong>Last Modified: </strong><xsl:value-of select="info/date"/></li>
    </xsl:if>

    <xsl:if test="info/version">
      <li><strong>Version: </strong><xsl:value-of select="info/version"/></li>
    </xsl:if>
  </ul>
  </div>

  <div id="title">
    <xsl:choose>
      <xsl:when test="short">
        <xsl:apply-templates select="short/node()|short/text()"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="@name"/>
      </xsl:otherwise>
    </xsl:choose>
  </div>

  <xsl:if test="description">
    <div id="description">
      <xsl:for-each select="description/p">
        <p><xsl:apply-templates/></p>
      </xsl:for-each>
    </div>
  </xsl:if>

  <br clear="both"/>

  <xsl:if test="parameters">
    <xsl:call-template name="js_paramlist"/>
  </xsl:if>

  <xsl:if test="usagetype and usagetype/text() != ''">
    <h2>Type</h2>

    <xsl:choose>
      <xsl:when test="usagetype/text() = 'private'">
        <p>This function is <strong>private</strong>. It is only for internal programming and should not be used by the user!</p>
      </xsl:when>
      <xsl:otherwise>
        <p>This function is <strong>public</strong>. It can be used by both user and programmer.</p>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:if>


  <xsl:if test="return">
    <h2>Return</h2>

    <p><xsl:apply-templates select="return/node()|return/text()"/></p>
  </xsl:if>


  <h2>Usage</h2>

<pre>
<xsl:if test="$base != ''"><span class="object"><xsl:value-of select="$base"/></span><span class="dot">.</span></xsl:if><span class="funcname"><xsl:value-of select="@name"/></span><span class="agrafe">(</span><xsl:for-each select="parameters/parameter"><xsl:sort select="@position" data-type="number"/><xsl:choose><xsl:when test="@mandatory = 'true'"><span class="mandatory"><xsl:value-of select="@name"/></span></xsl:when><xsl:otherwise><xsl:value-of select="@name"/></xsl:otherwise></xsl:choose><xsl:if test="position()!=last()">, </xsl:if></xsl:for-each><span class="agrafe">)</span><span class="semicolon">;</span>
</pre>
</xsl:template>

<xsl:template name="css_overview">
  <h2>Most used</h2>

  <ul>
    <li><a href="preview.html">Preview of Rules</a></li>
    <li><a href="filelist.html">List of Files</a></li>
    <li><a href="grouplist.html">List of Groups</a></li>
    <li><a href="rulelist.html">List of Rules</a></li>
    <li><a href="colorlist.html">List of Colors</a></li>
    <li><a href="propertylist.html">List of Properties</a></li>
  </ul>

  <table cellpadding="0" cellspacing="0" class="overview">
    <tr>
      <td>
        <h2>Parent-Elements</h2>

        <ul>
          <li><a href="parent_taglist.html">Tag-List</a></li>
          <li><a href="parent_idlist.html">ID-List</a></li>
          <li><a href="parent_classlist.html">Class-List</a></li>
        </ul>
      </td>

      <td>
        <h2>Target-Elements</h2>

        <ul>
          <li><a href="target_taglist.html">Tag-List</a></li>
          <li><a href="target_idlist.html">ID-List</a></li>
          <li><a href="target_classlist.html">Class-List</a></li>
        </ul>
      </td>

      <td>
        <h2>All-Elements</h2>

        <ul>
          <li><a href="all_taglist.html">Tag-List</a></li>
          <li><a href="all_idlist.html">ID-List</a></li>
          <li><a href="all_classlist.html">Class-List</a></li>
        </ul>
      </td>

    </tr>
  </table>

  <h2>Download</h2>

  <ul>
    <li><a href="{$pathrel}{$prefix}.tar.bz2">Tar/Bz2-Archiv</a> [<a href="{$pathrel}{$prefix}.tar.bz2.md5">md5</a>]</li>
    <li><a href="{$pathrel}{$prefix}.tar.gz">Tar/Gz-Archiv</a> [<a href="{$pathrel}{$prefix}.tar.gz.md5">md5</a>]</li>
    <li><a href="{$pathrel}{$prefix}.zip">ZIP-Archiv</a> [<a href="{$pathrel}{$prefix}.zip.md5">md5</a>]</li>
  </ul>

  <h2>Links</h2>

  <ul>
    <li><a href="http://www.edition-w3c.de/TR/1998/REC-CSS2-19980512/">Cascading Style Sheets, Level 2</a></li>
    <li><a href="http://css-discuss.incutio.com/">CSS Wiki</a></li>
  </ul>
</xsl:template>


<xsl:template name="js_paramlist">
  <xsl:choose>
  <xsl:when test="count(parameters/parameter) &gt; 0">
    <h2>Parameters</h2>
    <table class="list" cellpadding="0" cellspacing="1">
      <tr>
        <th>Name</th>
        <th>Type</th>
        <th>Mandatory</th>
        <th>Info</th>
      </tr>

      <xsl:for-each select="parameters/parameter">
        <xsl:sort select="@position" data-type="number"/>

        <tr>
          <xsl:attribute name="class">
            <xsl:choose>
              <xsl:when test="position() mod 2 = 0">even</xsl:when>
              <xsl:otherwise>odd</xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
        
          <td>
            <xsl:choose>
              <xsl:when test="@mandatory = 'true'">
                <span class="mandatory">
                  <xsl:value-of select="@name"/>
                </span>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="@name"/>
              </xsl:otherwise>
            </xsl:choose>
          </td>
          <td>
            <xsl:call-template name="js_type"/>
          </td>
          <td>
            <xsl:choose>
              <xsl:when test="not(@mandatory) or @mandatory = 'false'">false</xsl:when>
              <xsl:otherwise>true</xsl:otherwise>
            </xsl:choose>
          </td>
          <td>
            <xsl:value-of select="@info"/>
          </td>
        </tr>
      </xsl:for-each>
    </table>
  </xsl:when>
  <xsl:otherwise>
    <h2>Parameters</h2>
    <p>No Parameters defined.</p>
  </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="js_type">
  <xsl:choose>
    <xsl:when test="not(@type) or @type = '' or @type = 'all'">All</xsl:when>
    <xsl:when test="@type = 'string'">String</xsl:when>
    <xsl:when test="@type = 'number'">Number</xsl:when>
    <xsl:when test="@type = 'boolean'">Boolean</xsl:when>
    <xsl:when test="@type = 'color'">Color</xsl:when>
    <xsl:when test="@type = 'array'">Array</xsl:when>
    <xsl:when test="@type = 'event'">DOM-Event</xsl:when>
    <xsl:when test="@type = 'eventname'">Name of DOM-Event: [click|dblclick|mouseover|mouseout|...]</xsl:when>
    <xsl:when test="@type = 'constructor'">Object-Constructor</xsl:when>
    <xsl:otherwise><xsl:value-of select="@type"/></xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="css_grouplist">
  <table class="list" cellspacing="1" cellpadding="0">
    <thead>
      <tr>
        <th class="name">Name</th>
        <th class="match">Match</th>
        <th class="details">Details</th>
      </tr>
    </thead>
    <tbody>
      <xsl:for-each select="/data/groups/group">
        <tr>
          <xsl:attribute name="class">
            <xsl:choose>
              <xsl:when test="position() mod 2 = 0">even</xsl:when>
              <xsl:otherwise>odd</xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
        
          <td><xsl:value-of select="@name"/></td>
          <td><xsl:value-of select="@match"/></td>
          <td><a href="groups/group_{@name}.html">Details...</a></td>
        </tr>
      </xsl:for-each>
    </tbody>
  </table>
</xsl:template>

<xsl:template name="css_showproperty">
  <xsl:param name="name"/>

  <tr id="property_{$name}">
    <td><xsl:value-of select="$name"/></td>
    <td>
      <xsl:for-each select="/data/rules/rule/properties/property[@name = $name]">
        <a href="rules/rule_{../../@wellid}.html"><xsl:value-of select="../../@id"/></a>
        <xsl:if test="position() != last()">, </xsl:if>
      </xsl:for-each>
    </td>
  </tr>
</xsl:template>

<xsl:template name="css_showpropertygroup">
  <xsl:param name="title"/>

  <tr class="group">
    <td colspan="2"><xsl:value-of select="$title"/></td>
  </tr>
</xsl:template>

<xsl:template name="css_propertylist">
  <table class="list" cellspacing="1" cellpadding="0">
    <thead>
      <tr>
        <th class="property">Property</th>
        <th class="rulelist">Rules</th>
      </tr>
    </thead>

    <tbody>
      <!-- COLOR AND BACKGROUND -->
      <xsl:call-template name="css_showpropertygroup">
        <xsl:with-param name="title" select="'Color and Background'"/>
      </xsl:call-template>

      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'color'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'background'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'background-color'"/>
      </xsl:call-template>


      <!-- BOX -->
      <xsl:call-template name="css_showpropertygroup">
        <xsl:with-param name="title" select="'Box'"/>
      </xsl:call-template>

      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'border'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'border-color'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'border-style'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'border-width'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'clear'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'float'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'height'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'margin'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'margin-top'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'margin-right'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'margin-bottom'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'margin-left'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'padding'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'padding-top'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'padding-right'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'padding-bottom'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'padding-left'"/>
      </xsl:call-template>

      <!-- CLASSIFICATION -->
      <xsl:call-template name="css_showpropertygroup">
        <xsl:with-param name="title" select="'Classification'"/>
      </xsl:call-template>

      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'display'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'list-style'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'list-style-image'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'list-style-position'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'list-style-type'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'white-space'"/>
      </xsl:call-template>

      <!-- FONT -->
      <xsl:call-template name="css_showpropertygroup">
        <xsl:with-param name="title" select="'Font'"/>
      </xsl:call-template>

      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'font'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'font-family'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'font-size'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'font-style'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'font-variant'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'font-weight'"/>
      </xsl:call-template>

      <!-- TEXT -->
      <xsl:call-template name="css_showpropertygroup">
        <xsl:with-param name="title" select="'Text'"/>
      </xsl:call-template>

      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'letter-spacing'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'line-height'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'text-align'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'text-decoration'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'text-indent'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'text-transform'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'vertical-align'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'word-spacing'"/>
      </xsl:call-template>


      <!-- VISUAL -->
      <xsl:call-template name="css_showpropertygroup">
        <xsl:with-param name="title" select="'Visual'"/>
      </xsl:call-template>

      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'bottom'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'cursor'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'left'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'overflow'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'position'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'quotes'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'right'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'top'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'visibility'"/>
      </xsl:call-template>
      <xsl:call-template name="css_showproperty">
        <xsl:with-param name="name" select="'z-index'"/>
      </xsl:call-template>

    </tbody>
  </table>
</xsl:template>

<xsl:template name="css_colorlist_entry">
        <tr id="{@value}">
          <td style="text-align:right"><xsl:value-of select="position()"/></td>
          <td>#<xsl:value-of select="@value"/></td>
          <td><xsl:value-of select="rgb/@red"/>,<xsl:value-of select="rgb/@green"/>,<xsl:value-of select="rgb/@blue"/></td>
          <td><xsl:value-of select="@group"/></td>
          <td><xsl:value-of select="@brightness"/>%</td>
          <td>
            <div class="colorpreview" style="background:#{@value}">&#160;</div>
          </td>
          <td>
            <xsl:for-each select="rules/rule">
              <a>
                <xsl:attribute name="href">
                  <xsl:text>rules/rule_</xsl:text>
                  <xsl:choose>
                    <xsl:when test="@id &lt; 10">00</xsl:when>
                    <xsl:when test="@id &lt; 100">0</xsl:when>
                  </xsl:choose>
                  <xsl:value-of select="@id"/>
                  <xsl:text>.html</xsl:text>
                </xsl:attribute>
                <xsl:value-of select="@id"/>
              </a>
              <xsl:if test="position()!=last()">, </xsl:if>
            </xsl:for-each>
          </td>
        </tr>
</xsl:template>

<xsl:template name="css_colorlist_group">
  <xsl:param name="name"/>
  <xsl:param name="title"/>

  <xsl:if test="/data/colors/color[@group = $name]">
    <tr class="group">
      <td colspan="7"><xsl:value-of select="$title"/></td>
    </tr>
    <tr>
      <xsl:for-each select="/data/colors/color[@group = $name]">
        <xsl:sort select="@brightness" data-type="number"/>
        <xsl:sort select="rgb/@red" data-type="number"/>
        <xsl:sort select="rgb/@green" data-type="number"/>
        <xsl:sort select="rgb/@blue" data-type="number"/>

        <xsl:call-template name="css_colorlist_entry"/>
      </xsl:for-each>
    </tr>
  </xsl:if>
</xsl:template>

<xsl:template name="css_colorlist">
  <h2>List of <xsl:value-of select="count(/data/colors/color)"/> Colors</h2>

  <table class="list" cellspacing="1" cellpadding="0">
    <thead>
      <tr>
        <th class="hex">Hex</th>
        <th class="rgb">RGB</th>
        <th class="group">Group</th>
        <th class="brightness">Brightness</th>
        <th class="colorpreview">Preview</th>
        <th class="rulelist">Rules</th>
      </tr>
    </thead>

    <tbody>
      <xsl:call-template name="css_colorlist_group">
        <xsl:with-param name="name" select="'solid'"/>
        <xsl:with-param name="title" select="'Solid Colors'"/>
      </xsl:call-template>

      <xsl:call-template name="css_colorlist_group">
        <xsl:with-param name="name" select="'red'"/>
        <xsl:with-param name="title" select="'Reddish Colors'"/>
      </xsl:call-template>

      <xsl:call-template name="css_colorlist_group">
        <xsl:with-param name="name" select="'green'"/>
        <xsl:with-param name="title" select="'Greenish Colors'"/>
      </xsl:call-template>

      <xsl:call-template name="css_colorlist_group">
        <xsl:with-param name="name" select="'blue'"/>
        <xsl:with-param name="title" select="'Blueish Colors'"/>
      </xsl:call-template>

      <xsl:call-template name="css_colorlist_group">
        <xsl:with-param name="name" select="'yellow'"/>
        <xsl:with-param name="title" select="'Yellowish Colors'"/>
      </xsl:call-template>

      <xsl:call-template name="css_colorlist_group">
        <xsl:with-param name="name" select="'brown'"/>
        <xsl:with-param name="title" select="'Brownish Colors'"/>
      </xsl:call-template>

      <xsl:call-template name="css_colorlist_group">
        <xsl:with-param name="name" select="'turquoise'"/>
        <xsl:with-param name="title" select="'Blue-Greenish Colors'"/>
      </xsl:call-template>

      <xsl:call-template name="css_colorlist_group">
        <xsl:with-param name="name" select="'gray'"/>
        <xsl:with-param name="title" select="'Greyley Colors'"/>
      </xsl:call-template>
    </tbody>
  </table>
</xsl:template>


<xsl:template name="css_previewgen">
  <xsl:param name="text"/>

  <xsl:variable name="style">
    <xsl:for-each select="properties/property">
      <xsl:if test="@name = 'color' or @name = 'background' or @name = 'background-color' or @name = 'font-size' or @name = 'font' or @name = 'text-decoration' or @name = 'margin' or @name = 'margin-top' or @name = 'margin-right' or @name = 'margin-bottom' or @name = 'margin-left' or @name = 'padding' or @name = 'padding-top' or @name = 'padding-right' or @name = 'padding-bottom' or @name = 'padding-left' or @name = 'border' or @name = 'border-top' or @name = 'border-right' or @name = 'border-bottom' or @name = 'border-left' or @name = 'border-color' or @name = 'border-size' or @name = 'text-transform' or @name = 'font-weight' or @name = 'cursor' or @name = 'text-align' or @name = 'font-style' or @name = 'font-family'">
        <xsl:value-of select="concat(@name, ':', .)"/>
        <xsl:if test="position() != last()">; </xsl:if>
      </xsl:if>
    </xsl:for-each>
  </xsl:variable>

  <xsl:if test="$style != ''">
    <div>
      <xsl:attribute name="style"><xsl:value-of select="$style"/></xsl:attribute>
      <xsl:value-of select="$text"/>
    </div>
  </xsl:if>
</xsl:template>

<xsl:template name="css_preview">
  <h2>Preview of <xsl:value-of select="count(/data/rules/rule[properties/property[@name = 'font-size'] or properties/property[@name = 'font'] or properties/property[@name = 'font-style'] or properties/property[@name = 'color'] or properties/property[@name = 'background-color'] or properties/property[@name = 'border'] or properties/property[@name = 'text-align'] or properties/property[@name = 'font-weight']])"/> Styles</h2>

  <table class="list" cellspacing="1" cellpadding="0">
    <thead>
      <tr>
        <th style="text-align:right">#</th>
        <th>Name</th>
        <th>Preview</th>
        <th>Details</th>
      </tr>
    </thead>

    <xsl:for-each select="/data/rules/rule[properties/property[@name = 'font-size'] or properties/property[@name = 'font'] or properties/property[@name = 'font-style'] or properties/property[@name = 'color'] or properties/property[@name = 'background-color'] or properties/property[@name = 'border'] or properties/property[@name = 'text-align'] or properties/property[@name = 'font-weight']]">
      <tr>
        <xsl:attribute name="class">
          <xsl:choose>
            <xsl:when test="position() mod 2 = 0">even</xsl:when>
            <xsl:otherwise>odd</xsl:otherwise>
          </xsl:choose>
        </xsl:attribute>
      
        <td style="text-align:right"><xsl:value-of select="position()"/></td>
        <td>
          <xsl:choose>
            <xsl:when test="short"><xsl:value-of select="short"/></xsl:when>
            <xsl:otherwise>-</xsl:otherwise>
          </xsl:choose>
        </td>
        <td>
          <xsl:call-template name="css_previewgen">
            <xsl:with-param name="text">Ich bin nur ein kleiner Blindtext. Wenn ich gross bin, will ich Ulysses von James Joyce werden.</xsl:with-param>
          </xsl:call-template>
        </td>
        <td>
          <a href="rules/rule_{@wellid}.html">Details...</a>
        </td>
      </tr>
    </xsl:for-each>
  </table>
</xsl:template>

<xsl:template name="css_groupdescription">
  <xsl:param name="id"/>

  <div id="quickselect">
  QuickSelect:
  <select onchange="selectUrl(this)">
    <xsl:for-each select="/data/groups/group">
      <xsl:sort select="@name"/>

      <option value="group_{@name}.html">
        <xsl:if test="position() = $id">
          <xsl:attribute name="selected">selected</xsl:attribute>
        </xsl:if>

        <xsl:value-of select="@name"/>
      </option>
    </xsl:for-each>
  </select>
  </div>

  <h2>Selected Group: <xsl:value-of select="$name"/> (<small><xsl:value-of select="$match"/></small>)</h2>

  <h3>Rules</h3>
  <table class="list" cellspacing="1" cellpadding="0">
    <thead>
      <tr>
        <th class="nr" style="text-align:right">#</th>
        <th class="name">Name</th>
        <th class="file">File</th>
        <th class="details">Details</th>
      </tr>
    </thead>

    <tbody>

  <xsl:for-each select="/data/rules/rule">
    <xsl:variable name="foundcount">
      <xsl:for-each select="objects/object">
        <xsl:choose>
          <xsl:when test="contains(text(), ' ')">
            <xsl:if test="substring-before(text(), ' ') = $match">.</xsl:if>
          </xsl:when>
          <xsl:otherwise>
            <xsl:if test="text() = $match">.</xsl:if>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:for-each>
    </xsl:variable>

    <xsl:choose>
      <xsl:when test="string-length($foundcount) = 0">
        <!-- No objects found -->
      </xsl:when>
      <xsl:otherwise>
        <tr id="rule_{@wellid}">
          <td style="text-align:right"><xsl:value-of select="@id"/></td>
          <td>
            <xsl:choose>
              <xsl:when test="short">
                <xsl:value-of select="short"/>
              </xsl:when>
              <xsl:otherwise>-</xsl:otherwise>
            </xsl:choose>
          </td>
          <td>
            <a href="../files/file_{translate(file/text(), '/', '-')}.html"><xsl:value-of select="file"/></a>
          </td>
          <td>
            <a href="../rules/rule_{@wellid}.html">Details...</a>
          </td>
        </tr>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:for-each>

    </tbody>
  </table>
</xsl:template>


<xsl:template name="css_rulenavigation">
  <table class="navigation" cellpadding="0" cellspacing="0">
    <tr>
      <td class="prev"><a href="rule_{@wellprevid}.html">&#171;&#171; Previous</a></td>
      <td class="current">
        [<xsl:value-of select="$id"/>/<xsl:value-of select="count(/data/rules/rule)"/>]
      </td>
      <td class="next"><a href="rule_{@wellnextid}.html">Next &#187;&#187;</a></td>
    </tr>
  </table>
</xsl:template>

<xsl:template name="css_filedescription">
  <xsl:param name="id"/>

  <div id="quickselect">
  QuickSelect:
  <select onchange="selectUrl(this)">
    <xsl:for-each select="/data/files/file">
      <xsl:sort select="@name"/>

      <option value="file_{translate(@name, '/', '-')}.html">
        <xsl:if test="position() = $id">
          <xsl:attribute name="selected">selected</xsl:attribute>
        </xsl:if>

        <xsl:value-of select="@name"/>
      </option>
    </xsl:for-each>
  </select>
  </div>

  <xsl:for-each select="/data/files/file[position() = $id]">
    <xsl:variable name="name"><xsl:value-of select="/data/files/file[position() = $id]/@name"/></xsl:variable>

    <h2>Selected File: <xsl:value-of select="$name"/></h2>

    <xsl:if test="count(/data/rules/rule[file = $name]/info/groupname) &gt; 0">

    <h3>Defines <xsl:value-of select="count(/data/rules/rule[file = $name]/info/groupname)"/> Groups</h3>

    <table class="list" cellspacing="1" cellpadding="0">
      <tbody>
        <xsl:for-each select="/data/rules/rule[file = $name]/info/groupname">
          <xsl:sort select="@name"/>

          <xsl:if test="position() = 1 or position() mod 10 = 0">
            <tr>
              <th class="nr" style="text-align:right">#</th>
              <th class="name">Name</th>
              <th class="objects">Objects</th>
              <th class="details">Details</th>
            </tr>
          </xsl:if>

          <tr>
            <td style="text-align:right"><xsl:value-of select="position()"/></td>
            <td>
              <xsl:value-of select="."/>
            </td>
            <td>
              <xsl:variable name="rulescount">
              <xsl:for-each select="/data/rules/rule/objects/object">
                <xsl:variable name="basename">
                  <xsl:choose>
                    <xsl:when test="contains(text(), ' ')">
                      <xsl:value-of select="substring-before(text(), ' ')"/>
                    </xsl:when>
                    <xsl:otherwise>
                      <xsl:value-of select="text()"/>
                    </xsl:otherwise>
                  </xsl:choose>
                </xsl:variable>

                <xsl:if test="/data/groups/group[@match = $basename]">.</xsl:if>
              </xsl:for-each>
              </xsl:variable>

              <xsl:value-of select="string-length($rulescount)"/>
            </td>
            <td>
              <a href="../groups/group_{.}.html">Details...</a>
            </td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>

    </xsl:if>

    <xsl:if test="count(/data/rules/rule[file = $name]) &gt; 0">

    <h3>Defines <xsl:value-of select="count(/data/rules/rule[file = $name])"/> Rules</h3>

    <table class="list" cellspacing="1" cellpadding="0">
      <tbody>
        <tr>
          <th class="nr">#</th>
          <th class="name">Name</th>
          <th class="group">Group</th>
          <th class="properties">Properties</th>
          <th class="details">Details</th>
        </tr>

        <xsl:for-each select="/data/rules/rule[file = $name]">
          <xsl:sort select="@name"/>

          <tr id="rule_{@wellid}">
            <td>
              <xsl:value-of select="@id"/>
            </td>
            <td>
              <xsl:choose>
                <xsl:when test="short"><xsl:value-of select="short"/></xsl:when>
                <xsl:otherwise>-</xsl:otherwise>
              </xsl:choose>
            </td>
            <td>
              <!-- only look for first object in list -->
              <xsl:for-each select="objects/object[position()=1]">
                <xsl:variable name="basename">
                  <xsl:choose>
                    <xsl:when test="contains(text(), ' ')">
                      <xsl:value-of select="substring-before(text(), ' ')"/>
                    </xsl:when>
                    <xsl:otherwise>
                      <xsl:value-of select="text()"/>
                    </xsl:otherwise>
                  </xsl:choose>
                </xsl:variable>

                <xsl:if test="/data/groups/group[@match = $basename]">
                  <a href="../groups/group_{/data/groups/group[@match = $basename]/@name}.html#rule_{../../@wellid}">
                    <xsl:value-of select="/data/groups/group[@match = $basename]/@name"/>
                  </a>
                  <br/>
                </xsl:if>
              </xsl:for-each>
            </td>
            <td>
              <xsl:value-of select="count(properties/property)"/>
            </td>
            <td>
              <a href="../rules/rule_{@wellid}.html">Details...</a>
            </td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>

    </xsl:if>
  </xsl:for-each>
</xsl:template>

<xsl:template name="css_ruledescription">
  <xsl:param name="id"/>

  <div id="quickselect">
  QuickSelect:
  <select onchange="selectUrl(this)">
    <xsl:for-each select="/data/rules/rule">
      <xsl:sort select="@wellid" data-type="number"/>

      <option value="rule_{@wellid}.html">
        <xsl:if test="position() = $id">
          <xsl:attribute name="selected">selected</xsl:attribute>
        </xsl:if>

        <xsl:text>[</xsl:text><xsl:value-of select="@wellid"/><xsl:text>] </xsl:text>
        <xsl:if test="short">
          <xsl:value-of select="short"/>
        </xsl:if>
      </option>
    </xsl:for-each>
  </select>
  </div>

  <xsl:for-each select="/data/rules/rule[position() = $id]">
    <xsl:call-template name="css_rulenavigation"/>

    <xsl:if test="info or short or description or file">
      <h2>Information</h2>

      <xsl:if test="file or short or info">
        <ul>
          <xsl:if test="short">
            <li><strong>Name: </strong> <xsl:value-of select="short"/></li>
          </xsl:if>

          <xsl:for-each select="objects/object[position()=1]">
            <xsl:variable name="basename">
              <xsl:choose>
                <xsl:when test="contains(text(), ' ')">
                  <xsl:value-of select="substring-before(text(), ' ')"/>
                </xsl:when>
                <xsl:otherwise>
                  <xsl:value-of select="text()"/>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:variable>

            <xsl:if test="/data/groups/group[@match = $basename]">
              <li>
                <strong>Group: </strong>
                <a href="../groups/group_{/data/groups/group[@match = $basename]/@name}.html#rule_{../../@wellid}">
                  <xsl:value-of select="/data/groups/group[@match = $basename]/@name"/>
                </a>
              </li>
            </xsl:if>
          </xsl:for-each>

          <xsl:if test="info">
            <xsl:if test="info/email and info/author">
              <li><strong>Author: </strong> <a href="mailto:{info/email}"><xsl:value-of select="info/author"/></a></li>
            </xsl:if>
            <xsl:if test="info/groupname and short">
              <li>
                <strong>Create Group: </strong>
                <a href="../groups/group_{info/groupname}.html">
                  <xsl:value-of select="short"/>
                </a>
                <xsl:if test="info/groupversion">
                  (Version <xsl:value-of select="info/groupversion"/>)
                </xsl:if>
              </li>
            </xsl:if>
          </xsl:if>

          <xsl:if test="file">
            <li>
              <strong>File: </strong>
              <a href="../files/file_{translate(file, '/', '-')}.html#rule_{@wellid}">
                <xsl:value-of select="file"/>
              </a>
            </li>
          </xsl:if>
        </ul>
      </xsl:if>

      <xsl:if test="description">
        <xsl:for-each select="description/p">
          <p><xsl:apply-templates/></p>
        </xsl:for-each>
      </xsl:if>
    </xsl:if>

    <h2>Objects</h2>
    <ul>
      <xsl:for-each select="objects/object">
        <li>
          <xsl:value-of select="."/>
        </li>
      </xsl:for-each>
    </ul>

    <h2>Properties</h2>
    <xsl:choose>
      <xsl:when test="count(properties/property) &gt; 0">
        <ul class="propertylist">
          <xsl:for-each select="properties/property">
            <li>
              <xsl:choose>
                <xsl:when test="@name = 'color' or @name = 'background' or @name = 'background-color' or @name = 'font-size' or @name = 'font' or @name = 'text-decoration' or @name = 'margin' or @name = 'margin-top' or @name = 'margin-right' or @name = 'margin-bottom' or @name = 'margin-left' or @name = 'padding' or @name = 'padding-top' or @name = 'padding-right' or @name = 'padding-bottom' or @name = 'padding-left' or @name = 'border' or @name = 'border-top' or @name = 'border-right' or @name = 'border-bottom' or @name = 'border-left' or @name = 'border-color' or @name = 'border-size' or @name = 'text-transform' or @name = 'font-weight' or @name = 'cursor' or @name = 'text-align' or @name = 'font-style' or @name = 'font-family'">
                  <xsl:attribute name="class">haspreview</xsl:attribute>
                </xsl:when>
                <xsl:otherwise>
                  <xsl:attribute name="class">hasnopreview</xsl:attribute>
                </xsl:otherwise>
              </xsl:choose>

              <a href="../propertylist.html#property_{@name}">
                <xsl:value-of select="@name"/>
              </a>
              <xsl:text>: </xsl:text>
              <xsl:value-of select="."/>
            </li>
          </xsl:for-each>
        </ul>
      </xsl:when>
      <xsl:otherwise>
        <p>Doesn't contain any rules yet.</p>
      </xsl:otherwise>
    </xsl:choose>

    <h2>Preview</h2>
    <div class="preview">
      <xsl:call-template name="css_previewgen">
        <xsl:with-param name="text">Freilebende Gummibärchen gibt es nicht. Man kauft sie in Packungen an der Kinokasse. Dieser Kauf ist der Beginn einer fast erotischen und sehr ambivalenten Beziehung Gummibärchen-Mensch. Zuerst genießt man. Dieser Genuß umfaßt alle Sinne. Man wühlt in den Gummibärchen, man fühlt sie. Gummibärchen haben eine Konsistenz wie weichgekochter Radiergummi. Die Tastempfindung geht auch ins Sexuelle. Das bedeutet nicht unbedingt, daß das Verhältnis zum Gummibärchen ein geschlechtliches wäre, denn prinzipiell sind diese geschlechtsneutral. Nun sind Gummibärchen weder wabbelig noch zäh; sie stehen genau an der Grenze. Auch das macht sie spannend. Gummibärchen sind auf eine aufreizende Art weich. Und da sie weich sind, kann man sie auch ziehen. Ich mache das sehr gerne.</xsl:with-param>
      </xsl:call-template>
    </div>

    <xsl:call-template name="css_rulenavigation"/>
  </xsl:for-each>
</xsl:template>

<xsl:template name="css_showlist">
  <xsl:param name="group"/>
  <xsl:param name="frame"/>
  <xsl:param name="elem"/>

  <table class="list" cellspacing="1" cellpadding="0">
    <tr>
      <th>Tag-Name</th>
      <th>Rules</th>
    </tr>

  <xsl:for-each select="/data/*[name() = $group]/*[name() = $frame]/*[name() = $elem]">
    <xsl:sort select="@name"/>

    <tr>
      <td><xsl:value-of select="@name"/></td>
      <td>
        <xsl:for-each select="rule">
          <xsl:sort select="." data-type="number"/>

          <a href="rules/rule_{.}.html">
            <xsl:attribute name="href">
              <xsl:text>rules/rule_</xsl:text>
              <xsl:choose>
                <xsl:when test=". &lt; 10">00</xsl:when>
                <xsl:when test=". &lt; 100">0</xsl:when>
              </xsl:choose>
              <xsl:value-of select="."/>
              <xsl:text>.html</xsl:text>
            </xsl:attribute>
            <xsl:value-of select="."/>
          </a>

          <xsl:if test="position() != last()">, </xsl:if>
        </xsl:for-each>
      </td>
    </tr>
  </xsl:for-each>

  </table>
</xsl:template>

<xsl:template name="js_filedescription">
  <div id="info">
    <ul>
      <li>
        <strong>File: </strong>
        <xsl:value-of select="$name"/>
      </li>
    </ul>
  </div>

  <div id="title">
    <xsl:value-of select="$name"/>
  </div>

  <xsl:if test="/data/systemobject/filename[text() = $name]">
    <h2>Extensions</h2>
    <table class="list" cellspacing="1" cellpadding="0">
      <thead>
        <tr>
          <th class="nr">#</th>
          <th>Name</th>
          <th class="details">Details</th>
        </tr>
      </thead>
      <tbody>
        <xsl:for-each select="/data/systemobject/filename[text() = $name]">
          <tr>
            <xsl:attribute name="class">
              <xsl:choose>
                <xsl:when test="position() mod 2 = 0">even</xsl:when>
                <xsl:otherwise>odd</xsl:otherwise>
              </xsl:choose>
            </xsl:attribute>
          
            <td class="nr"><xsl:value-of select="position()"/></td>
            <td><xsl:value-of select="../@name"/></td>
            <td><a href="{$pathrel}systemobject_{../@name}.html">Details...</a></td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>
  </xsl:if>

  <xsl:if test="/data/propertylist/filename[text() = $name]">
    <h2>Objects</h2>
    <table class="list" cellspacing="1" cellpadding="0">
      <thead>
        <tr>
          <th class="nr">#</th>
          <th>Name</th>
          <th class="details">Details</th>
        </tr>
      </thead>
      <tbody>
        <xsl:for-each select="/data/propertylist/filename[text() = $name]">
          <tr>
            <xsl:attribute name="class">
              <xsl:choose>
                <xsl:when test="position() mod 2 = 0">even</xsl:when>
                <xsl:otherwise>odd</xsl:otherwise>
              </xsl:choose>
            </xsl:attribute>
          
            <td class="nr"><xsl:value-of select="position()"/></td>
            <td><xsl:value-of select="../@name"/></td>
            <td><a href="{$pathrel}objects/object_{../@name}.html">Details...</a></td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>
  </xsl:if>

  <xsl:if test="/data/class/filename[text() = $name]">
    <h2>Classes</h2>
    <table class="list" cellspacing="1" cellpadding="0">
      <thead>
        <tr>
          <th class="nr">#</th>
          <th>Name</th>
          <th class="details">Details</th>
        </tr>
      </thead>
      <tbody>
        <xsl:for-each select="/data/class/filename[text() = $name]">
          <tr>
            <xsl:attribute name="class">
              <xsl:choose>
                <xsl:when test="position() mod 2 = 0">even</xsl:when>
                <xsl:otherwise>odd</xsl:otherwise>
              </xsl:choose>
            </xsl:attribute>
          
            <td class="nr"><xsl:value-of select="position()"/></td>
            <td><xsl:value-of select="../@name"/></td>
            <td><a href="{$pathrel}classes/class_{../@name}.html">Details...</a></td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>
  </xsl:if>

  <xsl:if test="/data/globalfunction/filename[text() = $name]">
    <h2>Global Functions</h2>
    <table class="list" cellspacing="1" cellpadding="0">
      <thead>
        <tr>
          <th class="nr">#</th>
          <th>Name</th>
          <th class="details">Details</th>
        </tr>
      </thead>
      <tbody>
        <xsl:for-each select="/data/globalfunction/filename[text() = $name]">
          <tr>
            <xsl:attribute name="class">
              <xsl:choose>
                <xsl:when test="position() mod 2 = 0">even</xsl:when>
                <xsl:otherwise>odd</xsl:otherwise>
              </xsl:choose>
            </xsl:attribute>
          
            <td class="nr"><xsl:value-of select="position()"/></td>
            <td><xsl:value-of select="../@name"/></td>
            <td><a href="{$pathrel}globalfunctions/globalfunction_{../@name}.html">Details...</a></td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>
  </xsl:if>
</xsl:template>

<xsl:template name="js_filelist">
  <h2>Statistics</h2>

  <ul>
    <li><strong>Files: </strong><xsl:value-of select="count(/data/files/file)"/></li>
    <li><strong>Source-Size: </strong><xsl:value-of select="format-number(sum(/data/files/file/@sourcesize) div 1024, '##0.00')"/> KB</li>
    <li><strong>Public-Size: </strong><xsl:value-of select="format-number(sum(/data/files/file/@publicsize) div 1024, '##0.00')"/> KB</li>
    <li><strong>Compression: </strong><xsl:value-of select="format-number(100 - (sum(/data/files/file/@publicsize) div sum(/data/files/file/@sourcesize) * 100), '##0.00')"/> %</li>
  </ul>


  <h2>List of Files</h2>

  <table>
    <tr><td><b>E</b></td><td>=</td><td>Extensions</td></tr>
    <tr><td><b>O</b></td><td>=</td><td>Objects</td></tr>
    <tr><td><b>C</b></td><td>=</td><td>Classes</td></tr>
    <tr><td><b>G</b></td><td>=</td><td>Global Functions</td></tr>
  </table>
  <br/>

  <table class="list" cellspacing="1" cellpadding="0">
    <thead>
          <tr>
            <th class="name">Name</th>
            <th>Source-Size</th>
            <th>Public-Size</th>
            <th>Compression</th>
            <th class="nr">E</th>
            <th class="nr">O</th>
            <th class="nr">C</th>
            <th class="nr">G</th>
          </tr>
    </thead>
    <tbody>
      <xsl:for-each select="/data/files/file">
        <xsl:sort select="@name"/>

        <xsl:variable name="myname"><xsl:value-of select="@name"/></xsl:variable>

        <tr>
          <xsl:attribute name="class">
            <xsl:choose>
              <xsl:when test="position() mod 2 = 0">even</xsl:when>
              <xsl:otherwise>odd</xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>

          <a name="file_{translate($myname, '/', '-')}"/>
          <td><a href="files/file_{translate($myname, '/', '-')}.html"><xsl:value-of select="$myname"/></a></td>
          <td><xsl:value-of select="format-number(@sourcesize div 1024, '##0.00')"/> KB</td>
          <td><xsl:value-of select="format-number(@publicsize div 1024, '##0.00')"/> KB</td>
          <td><xsl:value-of select="format-number(100 - (@publicsize div @sourcesize * 100), '##0.00')"/> %</td>
          <td class="nr"><xsl:value-of select="count(/data/systemobject/functions/function[@filename = $myname])"/></td>
          <td class="nr"><xsl:value-of select="count(/data/propertylist[filename/text() = $myname])"/></td>
          <td class="nr"><xsl:value-of select="count(/data/class[filename/text() = $myname])"/></td>
          <td class="nr"><xsl:value-of select="count(/data/globalfunction[filename/text() = $myname])"/></td>
        </tr>
      </xsl:for-each>
    </tbody>
  </table>
</xsl:template>

<xsl:template name="css_filelist">
  <h2>List of <xsl:value-of select="count(/data/files/file)"/> Files</h2>

  <table class="list" cellspacing="1" cellpadding="0">
    <thead>
          <tr>
            <th class="nr">#</th>
            <th class="name">Name</th>
            <th class="rules">Rules</th>
          </tr>
    </thead>
    <tbody>
      <xsl:for-each select="/data/files/file">
        <xsl:sort select="@name"/>

        <xsl:variable name="myname"><xsl:value-of select="@name"/></xsl:variable>

        <tr>
          <xsl:attribute name="class">
            <xsl:choose>
              <xsl:when test="position() mod 2 = 0">even</xsl:when>
              <xsl:otherwise>odd</xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
        
          <a name="file_{translate($myname, '/', '-')}"/>
          <td><xsl:value-of select="position()"/></td>
          <td><a href="files/file_{translate($myname, '/', '-')}.html"><xsl:value-of select="$myname"/></a></td>
          <td><xsl:value-of select="count(/data/rules/rule[file = $myname])"/></td>
        </tr>
      </xsl:for-each>
    </tbody>
  </table>
</xsl:template>


<xsl:template name="css_rulelist">
  <h2>List of <xsl:value-of select="count(/data/rules/rule)"/> Rules</h2>

  <table class="list" cellspacing="1" cellpadding="0">
    <thead>
          <tr>
            <th class="nr">#</th>
            <th class="name">Name</th>
            <th class="objects">Objects</th>
            <!--
            <th class="author">Author</th>
            <th class="properties">Properties</th>
            -->
            <th class="details">Details</th>
          </tr>
    </thead>
    <tbody>
      <xsl:for-each select="/data/rules/rule">
        <tr>
          <xsl:attribute name="class">
            <xsl:choose>
              <xsl:when test="position() mod 2 = 0">even</xsl:when>
              <xsl:otherwise>odd</xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
        
        
          <a name="rule_{@wellid}"/>
          <td><xsl:value-of select="@wellid"/></td>
          <td>
            <xsl:choose>
              <xsl:when test="short"><xsl:value-of select="short"/></xsl:when>
              <xsl:otherwise>-</xsl:otherwise>
            </xsl:choose>
          </td>
          <td>
            <xsl:for-each select="objects/object">
              <xsl:value-of select="."/><br/>
            </xsl:for-each>
          </td>
          <!--
          <td>
            <xsl:choose>
              <xsl:when test="info">
                <a href="mailto:{info/email}"><xsl:value-of select="info/author"/></a>
              </xsl:when>
              <xsl:otherwise>&#160;</xsl:otherwise>
            </xsl:choose>
          </td>
          <td><xsl:value-of select="count(properties/property)"/></td>
          -->
          <td><a href="rules/rule_{@wellid}.html">Details...</a></td>
        </tr>
      </xsl:for-each>
    </tbody>
  </table>
</xsl:template>

</xsl:stylesheet>
