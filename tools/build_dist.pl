#!/usr/bin/perl 

=pod 
 $Id$
  
Packaging script for qooxdoo. Call with --help to get usage information 
packages only JavaScript source, no CSS or anything else.
=cut

use Getopt::Std;
use File::Find;
use XML::Simple;

$Getopt::Std::STANDARD_HELP_VERSION = 1;


our($opt_f, $opt_p, $opt_b, $opt_e, %packages, %dependencies, %excludedirs);

getopts('f:p:b:e:d:');

# process command line arguments
my $outputFile = $opt_f || 'qooxdoo.js';
my $package = $opt_p;
my $basedir = $opt_b || '.';
my $fileSuffix = $opt_e || '.js';

if ( !$package ) {
    print "The -p option is mandatory. Run '$0 --help' if you need more information\n";
    exit;
}


%excludedirs = ( 'CVS' => 1, '.cache' => 1, 'public' => 1);

# read in package and dependency definition file
my $xmldata;
{ local undef $/; $xmldata = <DATA>; }
my $ref = XMLin($xmldata);

foreach (keys %{$ref->{'package'}} ) {
    my $classes = $ref->{'package'}->{$_}->{class};
    if ( ref $classes ) { $packages{$_} = $classes; } 
    else { $packages{$_} = [$classes]; }
    
    my $depends = $ref->{'package'}->{$_}->{depends};
    if ( ref $depends ) { $dependencies{$_} = $depends; } 
    else { $dependencies{$_} = $depends ? [$depends] : [] ; }
}


# support to build multiple package at once, by supporting names separated by blanks 
my @packageNames = split /\s/, $package;


#####################################################################
#
# and now comes the real fun
#
#####################################################################

#
# @neededFiles will contain the file names, in appropriate order, that should be packed into a single file
# $text will contain all text from all these filenames
# %fileLocations is a mapping of filenames to their real/relative location in filesystem
#
our ($text, @neededFiles, %fileLocations);


# resolve dependencies
foreach (@packageNames) { push @neededFiles, get_dependencies($_); }
my %t = ();
@neededFiles = grep ++$t{$_} < 2, @neededFiles;

# put all the files into $text
find(\&searchFiles, ($basedir));
appendFiles();


# remove unnecessary stuff like comments and whitespace
print "Now compressing ".@neededFiles ." files \n";

$text =~ s/\/\*!?(?:.|[\r\n])*?\*\///gm;  # multi-line comments, see http://ostermiller.org/findcomment.html
$text =~ s|//.*\n||g;                   # single-line comments see http://perlmonks.thepen.com/117150.html

# cleanup '{', '}', '(', ')' ';' 
$text =~ s|(\s+\{)|{|gm;
$text =~ s|(\s+\})|}|gm;
$text =~ s|(\s+\()|(|gm;
$text =~ s|(\s+\))|)|gm;
$text =~ s|(\{\s+)|{|gm;
$text =~ s|(\}\s+)|}|gm;
$text =~ s|(\(\s+)|(|gm;
$text =~ s|(\)\s+)|)|gm;
$text =~ s|(\;\s+)|;|gm;
$text =~ s|(\;\s+[^a-zA-Z])|;|gm;

# shrink around '=='
$text =~ s|\s+==|==|gm;
$text =~ s|==\s+|==|gm;

# shrink around '!='
$text =~ s|"\s+\!=|!=|gm;
$text =~ s|\!=\s+|!=|gm;

# shrink around '='
$text =~ s|\s+=|=|gm;
$text =~ s|=\s+|=|gm; 

# shrink around ','
$text =~ s|\s+,|,|gm;
$text =~ s|,\s+|,|gm;

  # shrink around ':'
$text =~ s|\s+:|:|gm;
$text =~ s|:\s+|:|gm;

# shrink around '?'
$text =~ s|\s+\?|?|gm;
$text =~ s|\?\s+|?|gm;

# shrink around '+'
$text =~ s|\s+\+|+|gm;
$text =~ s|\+\s+|+|gm;

  # shrink around '-'
$text =~ s|\s+\-|-|gm;
$text =~ s|\-\s+|-|gm;

# shrink around '*'
$text =~ s|\s+\*|*|gm;
$text =~ s|\*\s+|*|gm;

# shrink around '/'
$text =~ s|\s+\/|/|gm;
$text =~ s|\/\s+|/|gm;

# shrink around '<'
$text =~ s|\s+\<|<|gm;
$text =~ s|\<\s+|<|gm;

# shrink around '>'
$text =~ s|\s+\>|>|gm;
$text =~ s|\>\s+|>|gm;

# shrink around ']'
$text =~ s|\s+\]|]|gm;
$text =~ s|\]\s+|]|gm;

# shrink around '['
$text =~ s|\s+\[|[|gm;
$text =~ s|\[\s+|[|gm;

# shrink around '||'
$text =~ s|\s+\|\|||||gm;
$text =~ s|\|\|\s+||||gm;

# shrink around '&&'
$text =~ s|\s+\&\&|&&|gm;
$text =~ s|\&\&\s+|&&|gm;

# strip extra white space
$text =~ s|\s{2,}| |gm; 

$text =~ s/\s*\n$//gm;                  # remove empty lines
$text =~ s/^\s*//gm;                    # remove whitespace from beginning of line
$text =~ s/\n/ /gm;                      # put all on one line


# write modified $text to file
print "Writing file $outputFile! \n";

open OUTFILE, "+>$outputFile" or die "Can't open file '".$outputFile."' for output";
print OUTFILE "/* Built with following packages-string: '$package' */";
print OUTFILE $text;
close OUTFILE;


####################################################################
#  
# private subroutines
#
####################################################################

=pod
 private subroutine (searchFiles):
 wanted subroutine for File::Find's find
=cut
sub searchFiles {
    my $filename = $_;
    
    # only continue, if we are processing a file we want to process, Cool, eh?
    return unless grep {  $filename eq $_; } @neededFiles; 

    # throw out directories listed in %excludedirs
    return if grep { (index $File::Find::name, $_) != -1 } keys %excludedirs;#$inexclude == 1;
    
    $fileLocations{$filename} = $File::Find::name;
}

=pod
 private subroutine (appendFiles): 
 loop over @neededFiles and content of all files to $text
=cut 
sub appendFiles() {
    local $/ = undef;  
    foreach (@neededFiles) {
        open F, $fileLocations{$_} 
             or die "Can't open '$fileLocations{$_}' for dependency $_! \n".
                    "Have you set the basedir option? Currently set to '$basedir'";
        $text .= <F> and print "Appending contents of $fileLocations{$_} \n";
        close F;
    }
}

=pod
 private subroutine (get_dependencies): 
=cut
sub get_dependencies {
    # list of package names that will be packed into outputFile
    my @depStack = ();
    add_dependencies($_[0], \@depStack);
    push @depStack, $_[0];
    
    # throw out duplicates first, then iterate over all packages and put their 
    # files in an array; 
    # then add specified suffix to all files before returning this list
    my (%temp, @files) = ();
    grep { push @files, @{$packages{$_}}; } grep ++$temp{$_} < 2, @depStack;
    return grep { $_ .= $fileSuffix if $_ ; } @files;
}

=pod
 private subroutine (add_dependencies): 
 recursive subroutine to get names of files, that the provided package is dependent on
=cut
sub add_dependencies {
    my ($packageName, $stackRef) = @_;
    die "invalid package referenced '$packageName'\nYour dependency definitions are wrong!" 
        unless $packages{$packageName};
    
    foreach ( @{$dependencies{$packageName}} ) { add_dependencies($_, $stackRef); }
    push @$stackRef, @{$dependencies{$packageName}};
}

=pod
 private subroutine (HELP_MESSAGE): 
 print usage information 
=cut
sub HELP_MESSAGE() {
    my $out = shift;
print  $out "\nAvailable parameters:\n".
"  -f <file_name>     of the output file (set to 'qooxdoo.js' if not specified). NOTE: File will be truncated\n".
"  -e <file_ending>   suffix of the input files (default is '.js')\n".
"  -b <base_dir>      base directory from which searching for dependencies should\n".
"                     be started (defaults to current directory)\n".
"  -p <package>   comma-separated list of package names that should be packed into the output file.\n\n";       
} 

__DATA__



<?xml version="1.0" ?>
<dependencies>

  <package name="core">
    <class>QxExtend</class>
    <class>QxObject</class>
  </package>
  
  <package name="event">
    <depends>core</depends>
    
    <class>QxEvent</class>
    <class>QxDataEvent</class>
  </package>

  <package name="debug">
    <depends>core</depends>
    
    <class>QxDebug</class> 
  </package> 

  <package name="target">
    <depends>event</depends>
    
    <class>QxTarget</class>
  </package>
  
  <package name="manager">
    <depends>core</depends>
    
    <class>QxManager</class>  
  </package>
  
  <package name="range">
    <depends>manager</depends>
    
    <class>QxRangeManager</class>
  </package>  

  <package name="dom">
    <depends>core</depends>
    
    <class>QxClient</class>
    <class>QxDom</class>    
  </package>
  
  <package name="variable">
    <depends>core</depends>
    
    <class>QxVariable</class>
    <class>QxInteger</class>
    <class>QxNumber</class>
    <class>QxString</class>
  </package>
  
  <package name="color">
    <depends>variable</depends>
    
    <class>QxColor</class>
  </package>
  
  <package name="textile">
    <depends>variable</depends>
    
    <class>QxTextile</class>
  </package>
  
  <package name="command">
    <depends>core</depends>
    <depends>application</depends>
    
    <class>QxCommand</class>
  </package>

  <package name="widget">
    <depends>target</depends>
    <depends>dom</depends>
    <depends>color</depends>

    <class>QxBorder</class>
    <class>QxWidget</class>  
  </package>  
  
  <package name="eventmanager">
    <depends>event</depends>
    <depends>target</depends>
    <depends>manager</depends>    

    <class>QxMouseEvent</class>
    <class>QxKeyEvent</class>
    <class>QxEventManager</class>
  </package>
  
  <package name="focusmanager">
    <depends>event</depends>
    <depends>target</depends>
    <depends>manager</depends>    

    <class>QxFocusEvent</class>
    <class>QxFocusManager</class>
  </package>  

  <package name="application">
    <depends>widget</depends>
    <depends>eventmanager</depends>
    <depends>focusmanager</depends>
    
    <class>QxApplication</class>
    <class>QxClientWindow</class>
    <class>QxBlocker</class>
    <class>QxClientDocument</class>    
  </package>
  
  <package name="timer">
    <depends>manager</depends>
  
    <class>QxTimerManager</class>
    <class>QxTimer</class>
  </package>
  
  <package name="data">
    <depends>event</depends>
    <depends>manager</depends>    
    <depends>timer</depends>
  
    <class>QxData</class>
    <class>QxXmlHttpLoader</class>
    <class>QxDataManager</class>
  </package>  

  <package name="selection">
    <depends>core</depends>
    <depends>manager</depends>    
   
    <class>QxSelectionStorage</class>
    <class>QxSelectionManager</class>
  </package>
   
  <package name="radio">
    <depends>manager</depends>
  
    <class>QxRadioButtonManager</class>
  </package>  
  
  <package name="inline">
    <depends>widget</depends>
    
    <class>QxInline</class>
  </package>
  
  <package name="terminator">
    <depends>widget</depends>
    
    <class>QxTerminator</class>
  </package>
  
  <package name="container">
    <depends>widget</depends>
    
    <class>QxContainer</class>  
  </package>  

  <package name="image">
    <depends>manager</depends>
    <depends>terminator</depends>

    <class>QxImageManager</class>
    <class>QxImagePreloaderManager</class>
    <class>QxImagePreloader</class>
    <class>QxImage</class>
  </package>
 
  <package name="form">
    <depends>widget</depends>

    <class>QxForm</class>
    <class>QxTextField</class>
    <class>QxPasswordField</class>
    <class>QxTextArea</class>
    <class>QxFieldSet</class>
  </package>
  
  <package name="formsel">
    <depends>atom</depends>
    <depends>radio</depends>
    
    <class>QxInputCheckIcon</class>
    <class>QxCheckBox</class>
    <class>QxRadioButton</class>
  </package> 
  
  <package name="atom">
    <depends>widget</depends>
    <depends>image</depends>
    <depends>container</depends>
  
    <class>QxAtom</class>
    <class>QxButton</class>
  </package>
  
  <package name="popup">
    <depends>atom</depends>

    <class>QxPopupManager</class>
    <class>QxPopup</class>
  </package>
  
  <package name="tooltip">
    <depends>popup</depends>
    <depends>timer</depends>
    
    <class>QxToolTipManager</class>
    <class>QxToolTip</class>
  </package>
  
  <package name="toolbar">
    <depends>widget</depends>
    <depends>atom</depends>
    <depends>radio</depends>
    
    <class>QxToolBar</class>
    <class>QxToolBarPart</class>
    <class>QxToolBarButton</class>
    <class>QxToolBarSeparator</class>
    <class>QxToolBarCheckBox</class>
    <class>QxToolBarRadioButton</class>
    <class>QxToolBarMenuButton</class>
  </package>
  
  <package name="menu">
    <depends>popup</depends>
    <depends>manager</depends>
    <depends>timer</depends>
    
    <class>QxMenuManager</class>
    <class>QxMenu</class>
    <class>QxMenuButton</class>
    <class>QxMenuCheckBox</class>
    <class>QxMenuRadioButton</class>
    <class>QxMenuSeparator</class>
  </package>  

  <package name="menubar">
    <depends>widget</depends>
    <depends>menu</depends>    
    
    <class>QxMenuBar</class>
    <class>QxMenuBarButton</class>
  </package>
  
  <package name="list">
    <depends>widget</depends>
    <depends>atom</depends>
    <depends>selection</depends>
  
    <class>QxList</class>
    <class>QxListItem</class>
  </package>
  
  <package name="combobox">
    <depends>list</depends>
    <depends>widget</depends>
    <depends>image</depends>
    
    <class>QxComboBox</class>
  </package>
  
  <package name="tree">
    <depends>widget</depends>  
    
    <class>QxTreeElement</class>
    <class>QxTreeFile</class>
    <class>QxTreeFolder</class>
    <class>QxTree</class>
  </package>
  
  <package name="dragndrop">
    <depends>event</depends>  
    <depends>manager</depends>
    <depends>image</depends>
    
    <class>QxDragEvent</class>
    <class>QxDragAndDropManager</class>
  </package>
  
  <package name="tabcore">
    <depends>radio</depends>
    <depends>atom</depends>

    <class>QxTabPage</class>
    <class>QxTab</class>
  </package>
  
  <package name="tabbar">
    <depends>widget</depends>
    <depends>tabcore</depends>
    
    <class>QxTabFrame</class>
    <class>QxTabBar</class>
    <class>QxTabPane</class>
  </package>
  
  <package name="barselector">
    <depends>widget</depends>
    <depends>tabcore</depends>
    
    <class>QxBarSelectorFrame</class>
    <class>QxBarSelectorBar</class>
    <class>QxBarSelectorPane</class>
    <class>QxBarSelectorPage</class>
    <class>QxBarSelectorButton</class>
  </package>
  
  <package name="iframe"> 
    <depends>widget</depends>
    
    <class>QxIframe</class>
  </package>
  
  <package name="listview">
    <depends>widget</depends>
    <depends>timer</depends>
    <depends>image</depends>
    
    <class>QxListView</class>
  </package>
  
  <package name="spinner">
    <depends>widget</depends>
    <depends>range</depends>
    <depends>image</depends>
    
    <class>QxSpinner</class>
  </package>  
  
  <package name="window">
    <depends>manager</depends>
    <depends>popup</depends>
    
    <class>QxWindowManager</class>
    <class>QxWindow</class>
  </package>
  
  <package name="nativewindow">
    <depends>target</depends>
    
    <class>QxNativeWindow</class>
  </package>
  
  
  
  
  <package name="all">
    <depends>application</depends>
    <depends>textile</depends>
    <depends>data</depends>
    <depends>inline</depends>
    <depends>popup</depends>
    <depends>tooltip</depends>
    <depends>toolbar</depends>
    <depends>menubar</depends>
    <depends>list</depends>
    <depends>combobox</depends>
    <depends>tree</depends>
    <depends>dragndrop</depends>   
    <depends>form</depends>
    <depends>formsel</depends>
    <depends>tabbar</depends>
    <depends>barselector</depends>
    <depends>iframe</depends>
    <depends>listview</depends>
    <depends>spinner</depends>
    <depends>window</depends>
  </package>
  
</dependencies>

  
