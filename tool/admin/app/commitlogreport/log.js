/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This is a node.js script capable of fetching all commit logs of the current 
 * git repository in the given range. The range can be specified as first 
 * command line argument. Here are some examples:
 * 
 *   Starting with e0e763ce596fe1bbc0a235434d8593f9a4ba6734 to the current revision
 *   * e0e763ce596fe1bbc0a235434d8593f9a4ba6734..HEAD 
 * 
 * The sript creates for every developer two files. One containing only the 
 * hash, date and commit message. The second one also contains the changed 
 * files.
 * 
 * The script is tested with node v0.2.6 and git version 1.7.3.2 on Mac OSX.
 */

// require all needed stuff
var sys = require('util'),
    fs = require('fs'),
    exec  = require('child_process').exec;

// get the range as second argument
var range = process.argv[2];

// error handling if no range is given
if (range == undefined) {
  console.log('Please give a git range as first argument.');
  console.log('example: node log.js e0e763ce596fe1bbc0a235434d8593f9a4ba6734..HEAD');
  return;
}

// use § and replace later in case " is in a comment
var gitCommand = 'git log ' + 
  '--pretty=format:\'{§hash§: §%H§, §from§ : §%an§, §date§ : §%ad§, §subject§ : §%s§},\'' + 
  ' "' + range + '"';

// global storage for the loaded commits
var commits;

// run the git command
exec(gitCommand, {maxBuffer: 2000000*1024}, function (error, stdout, stderr) {

  // error handling
  if (error !== null) {
    console.log('could not query the git log: ' + error + stderr);
    return;
  }

  // first, replace all ", then replace all § to "
  stdout = stdout.replace(/\\/g, "");
  stdout = stdout.replace(/\t/g, " ");
  stdout = stdout.replace(/\"/g, "\\\"");
  stdout = stdout.replace(/§/g, "\"");

  // get the log data
  commits = JSON.parse('[' + stdout.substring(0, stdout.length - 1) + ']');

  sys.print((commits.length-1) + ' commits to process:\n');
  loadFiles(0);
});

// helper to get the modified files for each hash in the given range
// (this method will be called recursivly)
var loadFiles = function(i) {
  // break for the recursion
  if (i == commits.length -1) {
    sys.print('\nDONE!\n\n')
    // done loading the files
    writeFiles();
    return;
  }
  // git command for fetching the changed files
  var gitCommand = 'git show --pretty="format:" --name-only ' + commits[i].hash;
  exec(gitCommand, {maxBuffer: 2000000*1024}, function (error, stdout, stderr) {
    // error handling
    if (error !== null) {
      console.log('Could not get changed files for ' + commits[i].hash + ': ' + error);
      return;
    }
    // save the files for the current commit
    commits[i]["files"] = stdout;

    sys.print('.');
    loadFiles(i+1);
  });
}

// Finalizing the data scructure, format the output and write it
var writeFiles = function() {
  // map of arrays for each developer containing his commits including changed files
  var logs = {};
  // map of arrays for each developer containing his commits without changed files
  var logsWithoutFiles = {};

  // split up the message for every developer
  for (var i=0; i < commits.length; i++) {
    var commit = commits[i];
    var name = commit.from;
    
    // create the array initially
    if (!logs[name]) {
      logs[name] = [];
      logsWithoutFiles[name] = [];
    }
    
    // format the output including the files
    logs[name].push("Hash : " + commit.hash);
    logs[name].push("Date : " + commit.date);
    logs[name].push("Subject : " + commit.subject);
    logs[name].push("Files : " + commit.files);
    
    // format the output without the files
    logsWithoutFiles[name].push("Hash : " + commit.hash);
    logsWithoutFiles[name].push("Date : " + commit.date);
    logsWithoutFiles[name].push("Subject : " + commit.subject);
    logsWithoutFiles[name].push(""); // adds an empty line between each commit
  };
    
  // write a file for each developer with the file names
  for (var name in logs) {
    fs.writeFile('log ' + name + ' files.txt', logs[name].join('\n'), function(name) {
      return function(err) {
        if (err) throw err;
        sys.print('Saved log with files for ' + name + '.\n');    
      }
    }(name));
  }

  // write a file for each developer without the file bane
  for (var name in logsWithoutFiles) {
    fs.writeFile('log ' + name + '.txt', logsWithoutFiles[name].join('\n'), function(name) {
      return function(err) {
        if (err) throw err;
        sys.print('Saved log for ' + name + '.\n');    
      }
    }(name));
  }
}