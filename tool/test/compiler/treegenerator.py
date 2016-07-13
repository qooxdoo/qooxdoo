#!/usr/bin/env python
# -*- coding: utf-8 -*-
e = 0
s = 1
b = 2

tests = [
        (e,"1"),
        (e,"+1"),
        (e,"-1"),
        (e,"1+2"),
        (e,"1+2+3"),
        (e,"1+2*3"),
        (e,"(1+2)*3"),
        (e,"(1)"),
        (e,"{}"),
        (e,"1 ? 2 : 3"),
        (e,"{1: 'one', 2: 'two'}"),
        (e,"{1: 'one', 2: 'two', 3: 'three'}"),
        (e,"foo[1]"),                                 # DEVIATION: using <variable><identifier "foo">
        (e,"foo[bar]"),
        (e,"foo['bar']"),
        (e,"(1,)"),
        (e,"(1, 2)"),
        (e,"[1, 2, 3]"),
        (e,"[,1, , 3,]"),                             # Elisions
        (e,"1.0*2+3"),
        (e,"'hello'+'world'"),
        (e,"foo.bar"),
        (e,"foo.bar()"),
        (e,"foo.bar[0]"),
        (e,"foo.bar[baz]"),
        (e,"1 + hello"),
        (e,"'hello'[0]"),
        (e,"hello()"),
        (e,"hello(1,2,3)"),
        (e,"function () { a = 1; }"),
        (e,"function foo() { a = 1; }"),
        (e,"function foo(a,b) { a = 1; }"),
        (e,"function foo(a,b) { a = 1; b = 2;}"),
        (e,"([dojo._listener, del, node_listener][listener]).remove(obj, event, handle);"), # from bug#2178
        # statements
        (s,"var a = 1, b;"),                          # DEVIATION: using assigment/2 
        (s,"var a = 'foo \\' bar';"),                 # scanner has to provide "foo ' bar" literal
        (s,"while(a<10){ b.append(a); }"),
        (e,"i=2"),
        (e,"2"),
        (s,"for(i=0; i<j; i++){ a=3; }"),
        (s,"for(i=0, j=a; i<j; i++){ a=3; }"),
        (s,"for(var i=0, j=a; i<j; i++){ a=3; }"),
        (s,"for(i in j){}"),
        (s,"for(var key in config){process(key);}"),
        (s,"for(a[i++] in o);"),
        (e,"qx.Class.define('foo', {extend: object, bar: function() {return 1;}})"),
        (e,"qx.Class.define('foo', {\n  extend: object,\n  bar: function() {return 1;}\n  }\n)"),
        # regexp literals
        (s,"var a = /123/;"),
        (s,"var a = /123/mgi;"),
        (e,"foo(1, /a.*b/mgi)"),
        (s,"var a = /a.*/;"),
        (s,r"var a = /^ab.*?[f-g]+x\/yz[^\.\/]?a.*\\/;"),
        (s,r"var a = /^(?:(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(.\d+)?)?((?:[+-](\d{2}):(\d{2}))|Z)?)?$/;"),  # from bug#2180
        (s,"var a = 10/123/2;"),
        # pre-/post-ops
        (e,"++i"),
        (e,"i++"),
        (e,"++a[0]"),
        (e,"a[0]++"),
        (e,"++(a[0])"),
        (e,"(a[0])++"),
        (e,"--i"),
        (e,"i--"),
        # comments
        (s,"/* this is a comment */\nvar a = 4711;"),
        (s,"var a = 4711;/* this is a post-comment */"),
        (s,"/* this is a \n * multi-line comment */\nvar a = 4711;"),
        (s,"var a = /* this is an embedded comment */4711;"),
        (e,"function (/* comment in args */x) {var a=4711;}"),
]
