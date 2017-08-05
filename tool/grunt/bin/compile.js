#! /usr/local/bin/node

/**
 * syntax: $0 <file.js> -- parse JS file and write it to console again
 *
 * A simple deserializer-serializer (read parser-unparser) for JS files, using
 * Esprima and Escodegen.
 *
 * To test performance against tool/bin/compile.py -q.
 */

var fs = require('fs'),
    esprima = require('esprima'),
    escodegen = require('escodegen'),
    fname = process.argv[2];

var options = {
    tolerant: true,
    loc: true,
    range: true, 
};

try {
    content = fs.readFileSync(fname, 'utf-8');
    syntax = esprima.parse(content, options);
    //console.log(JSON.stringify(syntax, null, 4));
    var text = escodegen.generate(syntax);
    console.log(text);
} catch (e) {
    console.log('Error: ' + e.message);
    process.exit(1);
}
