<!DOCTYPE html>
<html>
  <head>
    <title>
      <?php
      	/*
      	 * Print the <title> tag based on what is being viewed.
      	 */
      	global $page, $paged;

      	wp_title( '|', true, 'right' );

      	// Add the blog name.
      	bloginfo( 'name' );

      	// Add the blog description for the home/front page.
      	$site_description = get_bloginfo( 'description', 'display' );
      	if ( $site_description && ( is_home() || is_front_page() ) )
      		echo " | $site_description";

      	// Add a page number if necessary:
      	if ( $paged >= 2 || $page >= 2 )
      		echo ' | ' . sprintf( __( 'Page %s', 'twentyeleven' ), max( $paged, $page ) );
      	?>
    </title>
    <link href="http://resources.qooxdoo.org/stylesheets/reset.css" rel="stylesheet" type="text/css" />
    <link href="http://resources.qooxdoo.org/stylesheets/base.css" rel="stylesheet" type="text/css" />
    <link href="http://resources.qooxdoo.org/stylesheets/layout.css" rel="stylesheet" type="text/css" />
    <link href="http://resources.qooxdoo.org/stylesheets/pages.css" rel="stylesheet" type="text/css" />
    <link href="http://resources.qooxdoo.org/stylesheets/shCore.css" rel="stylesheet" type="text/css" />
    <link href="http://resources.qooxdoo.org/stylesheets/shCore.css" rel="stylesheet" type="text/css" />
    <link href="http://resources.qooxdoo.org/stylesheets/shThemeDefault.css" rel="stylesheet" type="text/css" />
    <link rel="profile" href="http://gmpg.org/xfn/11" />
    <link rel="stylesheet" type="text/css" media="all" href="<?php bloginfo( 'stylesheet_url' ); ?>" />
    <link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />
    <link rel="shortcut icon" href="http://resources.qooxdoo.org/images/qx-favicon.png" />
    <!--[if lt IE 9]>
    <script src="http://resources.qooxdoo.org/javascripts/html5shiv.js">
    <![endif]-->
    <meta http-equiv="content-type" content="text/html; charset=utf-8" />
    <?php
    	/* We add some JavaScript to pages with the comment form
    	 * to support sites with threaded comments (when in use).
    	 */
    	if ( is_singular() && get_option( 'thread_comments' ) )
    		wp_enqueue_script( 'comment-reply' );

    	/* Always have wp_head() just before the closing </head>
    	 * tag of your theme, or you will break many plugins, which
    	 * generally use this hook to add elements to <head> such
    	 * as styles, scripts, and meta tags.
    	 */
    	wp_head();
    ?>
    <script type="text/javascript">
      var _gaq = _gaq || [];
      _gaq.push(['_setAccount', 'UA-415440-1']);
      _gaq.push(['_setDomainName', 'qooxdoo.org']);
      _gaq.push(['_trackPageview']);
      (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
      })();
    </script>
  </head>
  <body <?php body_class("blog"); ?>>
    <div id="main-wrapper">
    <div id="header-wrapper">
      <section id="header">
        <h1><a href="http://qooxdoo.org">qooxdoo</a></h1>
        <nav>
          <ul>
            <!--
            <li>
              <a class="" href="http://qooxdoo.org">home</a>
            </li>
            -->
            <li>
              <a class="active" href="http://news.qooxdoo.org">blog</a>
            </li>
            <li>
              <a class="" href="http://qooxdoo.org/demos">demos</a>
            </li>
            <li>
              <a class="" href="http://qooxdoo.org/downloads">downloads</a>
            </li>
            <li>
              <a href="http://qooxdoo.org/docs">docs</a>
            </li>
            <li>
              <a class="" href="http://qooxdoo.org/community">community</a>
            </li>
          </ul>
        </nav>
        <script type="template" id="search-options-template">
          <select>
            <option value="site">Site</option>
            <option value="manual">Manual</option>
            <option value="blog">Blog</option>
            <option value="bugs">Bugs</option>
          </select>
        </script>
        <script type="template" id="search-site-template">
          <form action="http://qooxdoo.org/" id="search-form">
            <input type="hidden" name="do" value="search">
            <input type="search" name="id" placeholder="Search"></input>
          </form>
        </script>
        <script type="template" id="search-blog-template">
          <form method="get" id="searchform" action="/" id="search-form">
            <input type="search" class="field" name="s" id="s" placeholder="Search">
          </form>
        </script>
        <script type="template" id="search-manual-template">
          <form action="http://manual.qooxdoo.org/devel/search.html" id="search-form">
            <input type="search" name="q" placeholder="Search"></input>
          </form>
        </script>
        <script type="template" id="search-bugs-template">
          <form action="http://bugs.qooxdoo.org/buglist.cgi" id="search-form">
            <input type="search" name="quicksearch" placeholder="Search"></input>
          </form>
        </script>
        <div id="search">
        </div>
      </section>
      <div class="decoration">
      </div>
    </div>
    <section id="wrapper" class="show">
      <section id="main">
        <section id="breadcrumb">
          <a href="http://qooxdoo.org" title="home">Home</a>
          »
          <a href="http://news.qooxdoo.org">Blog</a>
        </section>  
        <section id="content">
