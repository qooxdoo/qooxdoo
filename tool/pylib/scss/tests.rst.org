SCSS TESTS
==========

INITIALIZATION
--------------

>>> from scss import Scss
>>> css = Scss()

VARIABLES
---------

http://xcss.antpaw.org/docs/syntax/variables

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... @variables {
    ...     $path = ../img/tmpl1/png;
    ...     $color1 = #FF00FF;
    ...     $border = border-top: 1px solid $color1;
    ... }
    ... .selector {
    ...     background-image: url($path/head_bg.png);
    ...     background-color: $color1;
    ...     $border;
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .selector {
        background-image: url(../img/tmpl1/png/head_bg.png);
        background-color: #f0f;
        border-top: 1px solid #f0f;
    }


NESTING CHILD OBJECTS
---------------------

http://xcss.antpaw.org/docs/syntax/children

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... .selector {
    ...     a {
    ...         display: block;
    ...     }
    ...     strong {
    ...         color: blue;
    ...     }
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .selector a {
        display: block;
    }
    .selector strong {
        color: #00f;
    }


    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... .selector {
    ...     self {
    ...         margin: 20px;
    ...     }
    ...     a {
    ...         display: block;
    ...     }
    ...     strong {
    ...         color: blue;
    ...     }
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .selector {
        margin: 20px;
    }
    .selector a {
        display: block;
    }
    .selector strong {
        color: #00f;
    }


    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... .selector {
    ...     self {
    ...         margin: 20px;
    ...     }
    ...     a {
    ...         display: block;
    ...     }
    ...     dl {
    ...         dt {
    ...             color: red;
    ...         }
    ...         dd {
    ...             self {
    ...                 color: gray;
    ...             }
    ...             span {
    ...                 text-decoration: underline;
    ...             }
    ...         }
    ...     }
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .selector {
        margin: 20px;
    }
    .selector a {
        display: block;
    }
    .selector dl dt {
        color: red;
    }
    .selector dl dd {
        color: gray;
    }
    .selector dl dd span {
        text-decoration: underline;
    }


EXTENDING OBJECTS
-----------------

http://xcss.antpaw.org/docs/syntax/extends

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... .basicClass {
    ...     padding: 20px;
    ...     background-color: #FF0000;
    ... }
    ... .specialClass extends .basicClass {}
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .basicClass,
    .specialClass {
        padding: 20px;
        background-color: red;
    }


    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... .basicClass {
    ...     padding: 20px;
    ...     background-color: #FF0000;
    ... }
    ... .specialClass extends .basicClass {
    ...     padding: 10px;
    ...     font-size: 14px;
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .basicClass,
    .specialClass {
        padding: 20px;
        background-color: red;
    }
    .specialClass {
        padding: 10px;
        font-size: 14px;
    }

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... .specialClass extends .basicClass {
    ...     padding: 10px;
    ...     font-size: 14px;
    ... }
    ... .specialLink extends .basicClass a {}
    ... .basicClass {
    ...     self {
    ...         padding: 20px;
    ...         background-color: #FF0000;
    ...     }
    ...     a {
    ...         text-decoration: none;
    ...     }
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .basicClass,
    .specialClass {
        padding: 20px;
        background-color: red;
    }
    .basicClass a,
    .specialClass a,
    .specialLink {
        text-decoration: none;
    }
    .specialClass {
        padding: 10px;
        font-size: 14px;
    }

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... .basicList {
    ...     li {
    ...         padding: 5px 10px;
    ...         border-bottom: 1px solid #000000;
    ...     }
    ...     dd {
    ...         margin: 4px;
    ...     }
    ...     span {
    ...         display: inline-block;
    ...     }
    ... }
    ... .roundBox {
    ...     some: props;
    ... }
    ... .specialClass extends .basicList & .roundBox {}
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .basicList li,
    .specialClass li {
        padding: 5px 10px;
        border-bottom: 1px solid #000;
    }
    .basicList dd,
    .specialClass dd {
        margin: 4px;
    }
    .basicList span,
    .specialClass span {
        display: inline-block;
    }
    .roundBox,
    .specialClass {
        some: props;
    }

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... .basicList {
    ...     li {
    ...         padding: 5px 10px;
    ...         border-bottom: 1px solid #000000;
    ...     }
    ...     dd {
    ...         margin: 4px;
    ...     }
    ...     span {
    ...         display: inline-block;
    ...     }
    ... }
    ... .specialClass {
    ...     dt extends .basicList li {}
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .basicList li,
    .specialClass dt {
        padding: 5px 10px;
        border-bottom: 1px solid #000;
    }
    .basicList dd {
        margin: 4px;
    }
    .basicList span {
        display: inline-block;
    }


MATH OPERATIONS
---------------

http://xcss.antpaw.org/docs/syntax/math

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... @variables {
    ...     $color = #FFF555;
    ... }
    ... .selector {
    ...     padding: [5px * 2];
    ...     color: [#ccc * 2];
    ...     // lets assume $color is '#FFF555'
    ...     background-color: [$color - #222 + #101010];
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .selector {
        padding: 10px;
        color: #fff;
        background-color: #ede343;
    }


    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... .selector {
    ...     padding: [(5px - 3) * (5px - 3)];
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .selector {
        padding: 4px;
    }


    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... .selector {
    ...     padding: [5em - 3em + 5px]px;
    ...     margin: [20 - 10] [30% - 10];
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .selector {
        padding: 31px;
        margin: 10 20%;
    }


SASS NESTING COMPATIBILITY
--------------------------

http://sass-lang.com/tutorial.html

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... /* style.scss */
    ... #navbar {
    ...   width: 80%;
    ...   height: 23px;
    ...
    ...   ul { list-style-type: none; }
    ...   li {
    ...     float: left;
    ...     a { font-weight: bold; }
    ...   }
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    #navbar {
        width: 80%;
        height: 23px;
    }
    #navbar ul {
        list-style-type: none;
    }
    #navbar li {
        float: left;
    }
    #navbar li a {
        font-weight: bold;
    }


    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... /* style.scss */
    ... .fakeshadow {
    ...   border: {
    ...     style: solid;
    ...     left: {
    ...       width: 4px;
    ...       color: #888;
    ...     }
    ...     right: {
    ...       width: 2px;
    ...       color: #ccc;
    ...     }
    ...   }
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .fakeshadow {
        border-style: solid;
        border-left-width: 4px;
        border-left-color: #888;
        border-right-width: 2px;
        border-right-color: #ccc;
    }


    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... /* style.scss */
    ... a {
    ...   color: #ce4dd6;
    ...   &:hover { color: #ffb3ff; }
    ...   &:visited { color: #c458cb; }
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    a {
        color: #ce4dd6;
    }
    a:hover {
        color: #ffb3ff;
    }
    a:visited {
        color: #c458cb;
    }


SASS VARIABLES COMPATIBILITY
----------------------------

http://sass-lang.com/tutorial.html

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... /* style.scss */
    ... $main-color: #ce4dd6;
    ... $style: solid;
    ...
    ... #navbar {
    ...   border-bottom: {
    ...     color: $main-color;
    ...     style: $style;
    ...   }
    ... }
    ...
    ... a {
    ...   color: $main-color;
    ...   &:hover { border-bottom: $style 1px; }
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    #navbar {
        border-bottom-color: #ce4dd6;
        border-bottom-style: solid;
    }
    a {
        color: #ce4dd6;
    }
    a:hover {
        border-bottom: solid 1px;
    }


SASS INTERPOLATION COMPATIBILITY
--------------------------------

http://sass-lang.com/tutorial.html

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... /* style.scss */
    ... $side: top;
    ... $radius: 10px;
    ...
    ... .rounded-#{$side} {
    ...   border-#{$side}-radius: $radius;
    ...   -moz-border-radius-#{$side}: $radius;
    ...   -webkit-border-#{$side}-radius: $radius;
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .rounded-top {
        border-top-radius: 10px;
        -moz-border-radius-top: 10px;
        -webkit-border-top-radius: 10px;
    }


SASS MIXINS COMPATIBILITY
-------------------------

http://sass-lang.com/tutorial.html

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... /* style.scss */
    ...
    ... @mixin rounded-top {
    ...   $side: top;
    ...   $radius: 10px;
    ...
    ...   border-#{$side}-radius: $radius;
    ...   -moz-border-radius-#{$side}: $radius;
    ...   -webkit-border-#{$side}-radius: $radius;
    ... }
    ...
    ... #navbar li { @include rounded-top; }
    ... #footer { @include rounded-top; }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    #navbar li {
        border-top-radius: 10px;
        -moz-border-radius-top: 10px;
        -webkit-border-top-radius: 10px;
    }
    #footer {
        border-top-radius: 10px;
        -moz-border-radius-top: 10px;
        -webkit-border-top-radius: 10px;
    }


    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... /* style.scss */
    ...
    ... @mixin rounded($side, $radius: 10px) {
    ...   border-#{$side}-radius: $radius;
    ...   -moz-border-radius-#{$side}: $radius;
    ...   -webkit-border-#{$side}-radius: $radius;
    ... }
    ...
    ... #navbar li { @include rounded(top); }
    ... #footer { @include rounded(top, 5px); }
    ... #sidebar { @include rounded(left, 8px); }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    #navbar li {
        border-top-radius: 10px;
        -moz-border-radius-top: 10px;
        -webkit-border-top-radius: 10px;
    }
    #footer {
        border-top-radius: 5px;
        -moz-border-radius-top: 5px;
        -webkit-border-top-radius: 5px;
    }
    #sidebar {
        border-left-radius: 8px;
        -moz-border-radius-left: 8px;
        -webkit-border-left-radius: 8px;
    }


    Support for ``@content``
    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... @mixin iphone {
    ...   @media only screen and (max-width: 480px) {
    ...     @content;
    ...   }
    ... }
    ...
    ... @include iphone {
    ...   body { color: red }
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    @media only screen and (max-width: 480px) {
        body {
            color: red;
        }
    }


SASS EXTEND COMPATIBILITY
-------------------------

http://sass-lang.com/docs/yardoc/file.SASS_REFERENCE.html#extend

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... .error {
    ...   border: 1px #f00;
    ...   background-color: #fdd;
    ... }
    ... .error.intrusion {
    ...   background-image: url("/image/hacked.png");
    ... }
    ... .seriousError {
    ...   @extend .error;
    ...   border-width: 3px;
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .error,
    .seriousError {
        border: 1px red;
        background-color: #fdd;
    }
    .error.intrusion,
    .seriousError.intrusion {
        background-image: url("/image/hacked.png");
    }
    .seriousError {
        border-width: 3px;
    }


### Multiple Extends

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... .error {
    ...   border: 1px #f00;
    ...   background-color: #fdd;
    ... }
    ... .attention {
    ...   font-size: 3em;
    ...   background-color: #ff0;
    ... }
    ... .seriousError {
    ...   @extend .error, .attention;
    ...   border-width: 3px;
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .error,
    .seriousError {
        border: 1px red;
        background-color: #fdd;
    }
    .attention,
    .seriousError {
        font-size: 3em;
        background-color: #ff0;
    }
    .seriousError {
        border-width: 3px;
    }

    Multiple Extends
    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... .bad {
    ...     color: red !important;
    ... }
    ... .error {
    ...   border: 1px #f00;
    ...   background-color: #fdd;
    ... }
    ... .attention {
    ...   font-size: 3em;
    ...   background-color: #ff0;
    ... }
    ... .seriousError {
    ...   @extend .error, .attention;
    ...   @extend .bad;
    ...   border-width: 3px;
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .bad, .seriousError {
        color: red !important;
    }
    .error, .seriousError {
        border: 1px red;
        background-color: #fdd;
    }
    .attention, .seriousError {
        font-size: 3em;
        background-color: #ff0;
    }
    .seriousError {
        border-width: 3px;
    }


    Placeholder Selectors: ``%foo``
    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... // This ruleset won't be rendered on its own.
    ... #context a%extreme {
    ...   color: blue;
    ...   font-weight: bold;
    ...   font-size: 2em;
    ... }
    ... .notice { @extend %extreme; }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    #context a.notice {
        color: #00f;
        font-weight: bold;
        font-size: 2em;
    }


FROM THE FORUM
--------------

http://groups.google.com/group/xcss/browse_thread/thread/6989243973938362#

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... body {
    ...     _width: expression(document.body.clientWidth > 1440? "1440px" : "auto");
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    body {
        _width: expression(document.body.clientWidth > 1440? "1440px" : "auto");
    }


http://groups.google.com/group/xcss/browse_thread/thread/2d27ddec3c15c385#

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... @variables {
    ...     $ie6 = *html;
    ...     $ie7 = *:first-child+html;
    ... }
    ... $ie6 {
    ...     .a  { color:white; }
    ...     .b  { color:black; }
    ... }
    ... $ie7 {
    ...     .a  { color:white; }
    ...     .b  { color:black; }
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    *html .a {
        color: #fff;
    }
    *html .b {
        color: #000;
    }
    *:first-child+html .a {
        color: #fff;
    }
    *:first-child+html .b {
        color: #000;
    }


http://groups.google.com/group/xcss/browse_thread/thread/04faafb4ef178984#

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... .basicClass {
    ...     padding: 20px;
    ...     background-color: #FF0000;
    ... }
    ... .specialClass extends .basicClass {
    ...     padding: 10px;
    ...     font-size: 14px;
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .basicClass,
    .specialClass {
        padding: 20px;
        background-color: red;
    }
    .specialClass {
        padding: 10px;
        font-size: 14px;
    }


ERRORS
------

http://groups.google.com/group/xcss/browse_thread/thread/5f4f3af046883c3b#

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... .some-selector { some:prop; }
    ... .some-selector-more { some:proop; }
    ... .parent {
    ...     self extends .some-selector {
    ...         height: auto
    ...     }
    ...     .children {
    ...         self extends .some-selector-more {
    ...             height: autoo
    ...         }
    ...     }
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .parent,
    .some-selector {
        some: prop;
    }
    .parent .children,
    .some-selector-more {
        some: proop;
    }
    .parent {
        height: auto;
    }
    .parent .children {
        height: autoo;
    }


http://groups.google.com/group/xcss/browse_thread/thread/540f8ad0771c053b#

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... .noticeBox {
    ...     self {
    ...         background-color:red;
    ...     }
    ...     span, p {
    ...         some: props
    ...     }
    ... }
    ... .errorBox extends .noticeBox {}
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .errorBox,
    .noticeBox {
        background-color: red;
    }
    .errorBox p,
    .errorBox span,
    .noticeBox p,
    .noticeBox span {
        some: props;
    }

http://groups.google.com/group/xcss/browse_thread/thread/b5757c24586c1519#

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... .mod {
    ...     self {
    ...         margin: 10px;
    ...     }
    ...     h1 {
    ...         font-size:40px;
    ...     }
    ... }
    ... .cleanBox extends .mod {
    ...     h1 {
    ...         font-size:60px;
    ...     }
    ... }
    ... .cleanBoxExtended extends .cleanBox {}
    ... .articleBox extends .cleanBox {}
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .articleBox,
    .cleanBox,
    .cleanBoxExtended,
    .mod {
        margin: 10px;
    }
    .articleBox h1,
    .cleanBox h1,
    .cleanBoxExtended h1,
    .mod h1 {
        font-size: 40px;
    }
    .articleBox h1,
    .cleanBox h1,
    .cleanBoxExtended h1 {
        font-size: 60px;
    }


TESTS
-----

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... @function percent-width(
    ...   $t,
    ...   $c
    ... ) {
    ...   $perc: ($t / $c) * 100%;
    ...   @return $perc;
    ... }
    ...
    ... a {
    ...   width: percent-width(12, 80);
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    a {
      width: 15%;
    }

http://sass-lang.com/docs/yardoc/file.SASS_REFERENCE.html

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... a {
    ...     $color: rgba(0.872536*255, 0.48481984*255, 0.375464*255, 1);
    ...     color: $color;
    ...     color: hsl(13.2, 0.661, 0.624);
    ...     color-hue: hue($color); // 60deg
    ...     color-saturation: saturation($color); // 60%
    ...     color-lightness: lightness($color); // 50%
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    a {
        color: rgb(87.254%, 48.482%, 37.546%);
        color: hsl(13.2, 66.1%, 62.4%);
        color-hue: 13.2deg;
        color-saturation: 66.1%;
        color-lightness: 62.4%;
    }

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... .functions {
    ...     opacify1: opacify(rgba(0, 0, 0, 0.5), 0.1); // rgba(0, 0, 0, 0.6)
    ...     opacify2: opacify(rgba(0, 0, 17, 0.8), 0.2); // #001
    ...
    ...     transparentize1: transparentize(rgba(0, 0, 0, 0.5), 0.1); // rgba(0, 0, 0, 0.4)
    ...     transparentize2: transparentize(rgba(0, 0, 0, 0.8), 0.2); // rgba(0, 0, 0, 0.6)
    ...
    ...     lighten1: lighten(hsl(0, 0%, 0%), 30%); // hsl(0, 0, 30)
    ...     lighten2: lighten(#800, 20%); // #e00
    ...
    ...     darken1: darken(hsl(25, 100%, 80%), 30%); // hsl(25deg, 100%, 50%)
    ...     darken2: darken(#800, 20%); // #200
    ...
    ...     saturate1: saturate(hsl(120, 30%, 90%), 20%); // hsl(120deg, 50%, 90%)
    ...     saturate2: saturate(#855, 20%); // #9e3f3f
    ...
    ...     desaturate1: desaturate(hsl(120, 30%, 90%), 20%); // hsl(120deg, 10%, 90%)
    ...     desaturate2: desaturate(#855, 20%); // #726b6b
    ...
    ...     adjust1: adjust-hue(hsl(120, 30%, 90%), 60deg); // hsl(180deg, 30%, 90%)
    ...     adjust2: adjust-hue(hsl(120, 30%, 90%), -60deg); // hsl(60deg, 30%, 90%)
    ...     adjust3: adjust-hue(#811, 45deg); // #886a11
    ...
    ...     mix1: mix(#f00, #00f, 50%); // purple
    ...     mix2: mix(#f00, #00f, 25%); // #4000bf
    ...     mix3: mix(rgba(255, 0, 0, 0.5), #00f, 50%); // rgba(64, 0, 191, 0.75)
    ...
    ...     percentage1: percentage(100px / 50px); // 200%
    ...
    ...     round1: round(10.4px); // 10px
    ...     round2: round(10.6px); // 11px
    ...
    ...     ceil1: ceil(10.4px); // 11px
    ...     ceil2: ceil(10.6px); // 11px
    ...
    ...     floor1: floor(10.4px); // 10px
    ...     floor2: floor(10.6px); // 10px
    ...
    ...     abs1: abs(10px); // 10px
    ...     abs2: abs(-10px); // 10px
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .functions {
        opacify1: rgba(0, 0, 0, 0.6);
        opacify2: #001;
        transparentize1: rgba(0, 0, 0, 0.4);
        transparentize2: rgba(0, 0, 0, 0.6);
        lighten1: hsl(0, 0%, 30%);
        lighten2: #e00;
        darken1: hsl(25, 100%, 50%);
        darken2: #200;
        saturate1: hsl(120, 50%, 90%);
        saturate2: #9e3f3f;
        desaturate1: hsl(120, 10%, 90%);
        desaturate2: #726b6b;
        adjust1: hsl(180, 30%, 90%);
        adjust2: hsl(60, 30%, 90%);
        adjust3: #886a11;
        mix1: purple;
        mix2: #4000bf;
        mix3: rgba(64, 0, 191, 0.75);
        percentage1: 200%;
        round1: 10px;
        round2: 11px;
        ceil1: 11px;
        ceil2: 11px;
        floor1: 10px;
        floor2: 10px;
        abs1: 10px;
        abs2: 10px;
    }

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... .coloredClass {
    ...     $mycolor: green;
    ...     padding: 20px;
    ...     background-color: $mycolor;
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
        .coloredClass {
            padding: 20px;
            background-color: green;
        }

    >>> css._scss_files = {}
    >>> css._scss_files['first.css'] = '''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... .specialClass extends .basicClass {
    ...     padding: 10px;
    ...     font-size: 14px;
    ... }
    ... '''
    >>> css._scss_files['second.css'] = '''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... .basicClass {
    ...     padding: 20px;
    ...     background-color: #FF0000;
    ... }
    ... '''
    >>> print css.compile() #doctest: +NORMALIZE_WHITESPACE
    .basicClass,
    .specialClass {
        padding: 20px;
        background-color: red;
    }
    .specialClass {
        padding: 10px;
        font-size: 14px;
    }


    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... a, button {
    ...     color: blue;
    ...     &:hover, .some & {
    ...         text-decoration: underline;
    ...     }
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    a,
    button {
        color: #00f;
    }
    .some a,
    .some button,
    a:hover,
    button:hover {
        text-decoration: underline;
    }


All styles defined for a:hover are also applied to .hoverlink:

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... a:hover { text-decoration: underline }
    ... .hoverlink { @extend a:hover }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .hoverlink,
    a:hover {
        text-decoration: underline;
    }


http://sass-lang.com/docs/yardoc/file.SASS_REFERENCE.html

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... #fake-links .link {@extend a}
    ...
    ... a {
    ...   color: blue;
    ...   &:hover {text-decoration: underline}
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    #fake-links .link,
    a {
        color: #00f;
    }
    #fake-links .link:hover,
    a:hover {
        text-decoration: underline;
    }


    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... @each $animal in puma, sea-slug, egret, salamander {
    ...   .#{$animal}-icon {
    ...     background-image: url('/images/#{$animal}.png');
    ...   }
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .puma-icon {
      background-image: url(/images/puma.png);
    }
    .sea-slug-icon {
      background-image: url(/images/sea-slug.png);
    }
    .egret-icon {
      background-image: url(/images/egret.png);
    }
    .salamander-icon {
      background-image: url(/images/salamander.png);
    }


TESTS FOR REPORTED ISSUES
-------------------------

### Issue #2 test

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... #{enumerate(".pull", 1, 24)} {
    ...   display: inline;
    ...   float: left;
    ...   position: relative;
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .pull-1, .pull-10, .pull-11, .pull-12, .pull-13, .pull-14, .pull-15,
    .pull-16, .pull-17, .pull-18, .pull-19, .pull-2, .pull-20, .pull-21,
    .pull-22, .pull-23, .pull-24, .pull-3, .pull-4, .pull-5, .pull-6,
    .pull-7, .pull-8, .pull-9 {
      display: inline;
      float: left;
      position: relative;
    }


### Issue #4 test

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... $width: 150px;
    ... @mixin foo($width) {
    ...     width: $width;
    ... }
    ... $other_width: 100px;
    ... .foo {
    ...     @include foo($other_width);
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .foo {
      width: 100px;
    }


### Issue #5 test

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... $width: 1px;
    ... foo {
    ...     border: $width solid red;
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    foo {
      border: 1px solid red;
    }


### Issue #6 test

    >>> print css.compile('''
    ... @option compress:no, short_colors:yes, reverse_colors:yes;
    ... $type: monster;
    ... p {
    ...   @if $type == ocean {
    ...     color: blue;
    ...   } @else if $type == matador {
    ...     color: red;
    ...   } @else if $type == monster {
    ...     color: green;
    ...   } @else {
    ...     color: black;
    ...   }
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    p {
      color: green;
    }


### Issue #7 test

    >>> print css.compile('''
    ... @option compress: no, short_colors: no;
    ... a.button:hover {
    ... color: #000000;
    ... }
    ... button:hover {
    ... @extend a.button:hover;
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    a.button:hover, button:hover {
      color: #000000;
    }


### Issue #10 test
    >>> print css.compile('''
    ... @option compress: no, short_colors: no;
    ... .yellow {
    ...   color: yelow;
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    .yellow {
      color: yelow;
    }


### Issue #21 test

    >>> print css.compile('''
    ... @option compress:no, short_colors: no;
    ... h2 {
    ...     background: green;
    ...     @media screen{
    ...         background:blue;
    ...     }
    ... }
    ... h1 {
    ...     background:yellow;
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    h2 {
      background: #008000;
    }
    @media screen {
      h2 {
        background: #0000ff;
      }
    }
    h1 {
      background: #ffff00;
    }


### Issue #32 test

    >>> print css.compile('''
    ... @option compress:no, short_colors: no;
    ... @media (max-width:1024px) {
    ...   .wrap {
    ...     padding: 10px 0;
    ...   }
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    @media (max-width:1024px) {
      .wrap {
        padding: 10px 0;
      }
    }


### Issue #40 test

    >>> print css.compile('''
    ... @option compress:no, short_colors: no;
    ... a {
    ...   background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwA...");
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    a {
      background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwA...");
    }


### Issue #52 test

    >>> print css.compile('''
    ... @option compress:no;
    ... h1 {
    ...   background: url(//example.com/image.png);
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    h1 {
      background: url(//example.com/image.png);
    }


### Strings interpolation

    >>> print css.compile('''
    ... @option compress:no, short_colors: no;
    ... a {
    ...   $a: 'a';
    ...   $b: 'b';
    ...   $c: 'c';
    ...   $x: '';
    ...   A: $a$b$x$c;
    ...   B: '$a$b$x$c';
    ...   C: "$a$b$x$c";
    ...   D: #{$a}#{$b}#{$x}#{$c};
    ...   E: '#{$a}#{$b}#{$x}#{$c}';
    ...   F: "#{$a}#{$b}#{$x}#{$c}";
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    a {
      A: a b  c;
      B: $a$b$x$c;
      C: "$a$b$x$c";
      D: abc;
      E: abc;
      F: "abc";
    }


### Strings interpolation

    >>> print css.compile('''
    ... @option compress:no, short_colors: no;
    ... a {
    ...   @each $a in '', '_a' {
    ...     @each $b in '', '_b' {
    ...       @each $c in '', '_c' {
    ...         A: X#{$a}#{$b}#{$c};
    ...       }
    ...     }
    ...   }
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    a {
      A: X;
      A: X_c;
      A: X_b;
      A: X_b_c;
      A: X_a;
      A: X_a_c;
      A: X_a_b;
      A: X_a_b_c;
    }


### Compass excerpt

    >>> print css.compile('''
    ... @option compress:no, short_colors: no;
    ...
    ... $experimental-support-for-mozilla      : true !default;
    ... $experimental-support-for-webkit       : true !default;
    ... $experimental-support-for-opera        : true !default;
    ... $experimental-support-for-microsoft    : true !default;
    ... $experimental-support-for-khtml        : false !default;
    ...
    ... @mixin experimental($property, $value,
    ...   $moz      : $experimental-support-for-mozilla,
    ...   $webkit   : $experimental-support-for-webkit,
    ...   $o        : $experimental-support-for-opera,
    ...   $ms       : $experimental-support-for-microsoft,
    ...   $khtml    : $experimental-support-for-khtml,
    ...   $official : true
    ... ) {
    ...   @if $webkit  and $experimental-support-for-webkit    { -webkit-#{$property} : $value; }
    ...   @if $khtml   and $experimental-support-for-khtml     {  -khtml-#{$property} : $value; }
    ...   @if $moz     and $experimental-support-for-mozilla   {    -moz-#{$property} : $value; }
    ...   @if $ms      and $experimental-support-for-microsoft {     -ms-#{$property} : $value; }
    ...   @if $o       and $experimental-support-for-opera     {      -o-#{$property} : $value; }
    ...   @if $official                                        {         #{$property} : $value; }
    ... }
    ...
    ... $default-box-shadow-color: #333333 !default;
    ... $default-box-shadow-h-offset: 0px !default;
    ... $default-box-shadow-v-offset: 0px !default;
    ... $default-box-shadow-blur: 5px !default;
    ... $default-box-shadow-spread : false !default;
    ... $default-box-shadow-inset : false !default;
    ...
    ... @mixin box-shadow(
    ...   $shadow-1 : default,
    ...   $shadow-2 : false,
    ...   $shadow-3 : false,
    ...   $shadow-4 : false,
    ...   $shadow-5 : false,
    ...   $shadow-6 : false,
    ...   $shadow-7 : false,
    ...   $shadow-8 : false,
    ...   $shadow-9 : false,
    ...   $shadow-10: false
    ... ) {
    ...   @if $shadow-1 == default {
    ...     $shadow-1 : -compass-space-list(compact(if($default-box-shadow-inset, inset, false), $default-box-shadow-h-offset, $default-box-shadow-v-offset, $default-box-shadow-blur, $default-box-shadow-spread, $default-box-shadow-color));
    ...   }
    ...   $shadow : compact($shadow-1, $shadow-2, $shadow-3, $shadow-4, $shadow-5, $shadow-6, $shadow-7, $shadow-8, $shadow-9, $shadow-10);
    ...   @include experimental(box-shadow, $shadow,
    ...     -moz, -webkit, not -o, not -ms, not -khtml, official
    ...   );
    ... }
    ...
    ... a {
    ...   $drop-shadow-color: red;
    ...   $drop-shadow-blur: 4px;
    ...   $inner-shadow-color: rgba(0, 0, 0, 0.5);
    ...   $inner-shadow-blur: 40px !default;
    ...   $offset-x: 0;
    ...   $offset-y: -1px;
    ...   +box-shadow: $drop-shadow-color $offset-x $offset-y $drop-shadow-blur 0, $inner-shadow-color 0 0 $inner-shadow-blur inset;
    ... }
    ... ''') #doctest: +NORMALIZE_WHITESPACE
    a {
      -webkit-box-shadow: #ff0000 0 -1px 4px 0, rgba(0, 0, 0, 0.5) 0 0 40px inset;
      -moz-box-shadow: #ff0000 0 -1px 4px 0, rgba(0, 0, 0, 0.5) 0 0 40px inset;
      box-shadow: #ff0000 0 -1px 4px 0, rgba(0, 0, 0, 0.5) 0 0 40px inset;
    }


UNSUPPORTED
-----------

>>> UNSUPPORTED = """
... ADVANCED STUFF, NOT SUPPORTED (FROM SASS):
... --------------------------------------------------------------------------------
... >>> print css.compile('''
... ... @option compress:no, short_colors:yes, reverse_colors:yes;
... ... .mod {
... ...     margin: 10px;
... ... }
... ... .mod h1 {
... ...     font-size: 40px;
... ... }
... ... .cleanBox h1 extends .mod {
... ...     font-size: 60px;
... ... }
... ... ''') #doctest: +NORMALIZE_WHITESPACE
... .cleanBox h1,
... .mod {
...     margin: 10px;
... }
... .cleanBox h1,
... .mod h1 {
...     font-size: 40px;
... }
... .cleanBox h1 {
...     font-size: 60px;
... }
... 
... http://sass-lang.com/docs/yardoc/file.SASS_REFERENCE.html
... 
... Any rule that uses a:hover will also work for .hoverlink, even if they have other selectors as well
... >>> print css.compile('''
... ... @option compress:no, short_colors:yes, reverse_colors:yes;
... ... .comment a.user:hover { font-weight: bold }
... ... .hoverlink { @extend a:hover }
... ... ''') #doctest: +NORMALIZE_WHITESPACE
... .comment a.user:hover,
... .comment .hoverlink.user {
...     font-weight: bold;
... }
... 
... 
... Sometimes a selector sequence extends another selector that appears in another
... sequence. In this case, the two sequences need to be merged.
... While it would technically be possible to generate all selectors that could
... possibly match either sequence, this would make the stylesheet far too large.
... The simple example above, for instance, would require ten selectors. Instead,
... Sass generates only selectors that are likely to be useful.
... >>> print css.compile('''
... ... @option compress:no, short_colors:yes, reverse_colors:yes;
... ... #admin .tabbar a { font-weight: bold }
... ... #demo .overview .fakelink { @extend a }
... ... ''') #doctest: +NORMALIZE_WHITESPACE
... #admin .tabbar a,
... #admin .tabbar #demo .overview .fakelink,
... #demo .overview #admin .tabbar .fakelink {
...     font-weight: bold;
... }
... 
... --------------------------------------------------------------------------------
... """
