<!DOCTYPE html>
<html>
  <head>
    <title>
      <?php echo hsc($conf['title'])?> &raquo; <?php tpl_pagetitle()?>
    </title>

    <link href="<?php print $conf['assetshost'] ?>/stylesheets/reset.css" rel="stylesheet" type="text/css" />
    <link href="<?php print $conf['assetshost'] ?>/stylesheets/base.css" rel="stylesheet" type="text/css" />
    <link href="<?php print $conf['assetshost'] ?>/stylesheets/layout.css" rel="stylesheet" type="text/css" />
    <link href="<?php print $conf['assetshost'] ?>/stylesheets/pages.css" rel="stylesheet" type="text/css" />

    <!-- TODO: Load from script on demand -->
    <link href="<?php print $conf['assetshost'] ?>/stylesheets/shCore.css" rel="stylesheet" type="text/css" />
    <link href="<?php print $conf['assetshost'] ?>/stylesheets/shThemeDefault.css" rel="stylesheet" type="text/css" />

    <!--[if lt IE 9]>
    <script src="<?php print $conf['assetshost'] ?>/javascripts/html5shiv.js">
    <![endif]-->

    <!-- Dokuwiki -->
    <?php tpl_metaheaders()?>
    <link rel="shortcut icon" href="http://resources.qooxdoo.org/images/qx-favicon.png" />

    <meta http-equiv="content-type" content="text/html; charset=utf-8" />

     <?php if ($ACT == 'show')
      {
        // Google Analytics Integration
        print "<script type='text/javascript'>
          var _gaq = _gaq || [];
          _gaq.push(['_setAccount', 'UA-415440-1']);
          _gaq.push(['_setDomainName', 'qooxdoo.org']);
          _gaq.push(['_trackPageview']);

          (function() {
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
          })();
        </script>";
      }
     ?>
  </head>
  <body id="<?php print str_replace(":", "-", $INFO['id']) ?>" class="<?php print str_replace(":", " ", $INFO['id']) ?> dokuwiki">

    <div id="main-wrapper">
    <?php
      function is_in_section($section, $current) {
        $sections = split(":", $current);
        return $sections[0] == $section;
      }
    ?>

    <?php if (is_in_section("contrib", $ID)) {?>
    <div class="alert">
      This section is maintained by the
      <a href="/community">qooxdoo community</a>.
      Here is how you can <a href="/community/contribution">contribute</a>.
    </div>
    <?php } ?>

    <!-- HEADER -->
    <div id="header-wrapper">
      <?php @include(dirname(__FILE__).'/header.html') ?>
    </div>

    <?php if(isset($INFO['userinfo'])) { ?>
      <div id="control">
        <form action="<?php print wl($ID) ?>" method="GET">
          <input type="hidden" name="do" value="backlink">
          <input type="submit" value="Backlinks">
        </form>
        <?php tpl_button('index')?>
        <?php tpl_button('profile')?>
        <?php tpl_button('admin')?>
        <?php tpl_button('subscribe')?>
        <?php tpl_button('recent')?>
        <?php tpl_button('history')?>
        <?php tpl_button('edit')?>
      </div>
    <?php } ?>

    <!-- MAIN -->
    <?php if ($ACT == "show" && in_array($INFO['id'], split(" ", $conf['rawhtml']))) {?>
      <!-- RAW HTML -->
      <section id="wrapper" class="<?php print $ACT ?>">
        <!--
        <section id="breadcrumb">
          <?php tpl_youarehere() ?>
        </section>
        -->
        <?php tpl_content(false) ?>
      </section>
    <?php } else { ?>
      <section id="main" class="<?php print $ACT ?>">
        <section id="breadcrumb">
          <?php tpl_youarehere() ?>
        </section>
        <section id="content">
          <?php tpl_content(false) ?>
        </section>
        <section id="sidebar">
          <?php tpl_toc()?>
        </section>
      </section>
    <?php } ?>

    </div>
    <!-- FOOTER -->
    <div id="footer-wrapper">
      <?php @include(dirname(__FILE__).'/footer.html') ?>
    </div>

    <?php tpl_indexerWebBug() ?>

    </div>

    <script src="<?php print $conf['assetshost'] ?>/javascripts/q.js"></script>
    <script src="<?php print $conf['assetshost'] ?>/javascripts/q.domain.js"></script>
    <script src="<?php print $conf['assetshost'] ?>/javascripts/q.sticky.js"></script>
    <script src="<?php print $conf['assetshost'] ?>/javascripts/q.placeholder.js"></script>
    <script src="<?php print $conf['assetshost'] ?>/javascripts/shCore.js"></script>
    <script src="<?php print $conf['assetshost'] ?>/javascripts/shBrushJScript.js"></script>
    <script src="<?php print $conf['assetshost'] ?>/javascripts/application.js"></script>
    <?php
      // DokuWiki Search Engine?
      //print '<p style="visibility:hidden;height:0">';
      //tpl_indexerWebBug();
      //print '</p>';
    ?>
  </body>
</html>
