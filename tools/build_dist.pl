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


our($opt_f, $opt_p, $opt_b, $opt_e, $opt_d, %packages, %dependencies, %excludedirs);

getopts('f:p:b:e:d:');

# process command line arguments
my $outputFile = $opt_f || 'qooxdoo.js';
my $package = $opt_p;
my $basedir = $opt_b || '.';
my $fileSuffix = $opt_e || '.js';
my $dependenciesFile = $opt_d || './tools/dependencies.xml';

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
    return grep { $_ .= $fileSuffix; } @files;
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
"  -d <dep_xml_file>  location of dependency and package definition file (default is './dependencies.xml')\n".
"  -b <base_dir>      base directory from which searching for dependencies should\n".
"                     be started (defaults to current directory)\n".
"  -p <package>   comma-separated list of package names that should be packed into the output file.\n\n";       
} 

__DATA__



<?xml version="1.0" ?>
<dependencies>

  <package name="types">
    <class>QxColor</class>
    <class>QxInteger</class>
    <class>QxNumber</class>
    <class>QxString</class>
    <class>QxTextile</class>
    <class>QxVariable</class>
  </package>

  <package name="core">
    <depends>types</depends>
    <class>QxExtend</class>
    <class>QxObject</class>
    <class>QxClient</class>
    <class>QxDom</class>
    <class>QxDebug</class>
    <class>QxTarget</class>
    <class>QxData</class>
    <class>QxApplication</class>
    <class>QxClientWindow</class>
    <class>QxBorder</class>
    <class>QxTimer</class>
    <class>QxXmlHttpLoader</class>
  </package>
  
  <package name="events">
    <depends>core</depends>
    <class>QxEvent</class>
    <class>QxDataEvent</class>
    <class>QxFocusEvent</class>
    <class>QxKeyEvent</class>
    <class>QxMouseEvent</class>
  </package>
      
  <package name="managers">
    <depends>core</depends>
    <class>QxManager</class>
    <class>QxMenuManager</class>
    <class>QxDataManager</class>
    <class>QxEventManager</class>
    <class>QxFocusManager</class>
    <class>QxPopupManager</class>
    <class>QxToolTipManager</class>
    <class>QxTimerManager</class>
    <class>QxImagePreloaderManager</class>
  </package>
      
  <package name="basicwidget">
    <depends>events</depends>
    <depends>managers</depends>
    <class>QxWidget</class>
    <class>QxAtom</class>
    <class>QxClientDocument</class>
    <class>QxInline</class>
  </package>
  
  <package name="extrawidget">
    <depends>basicwidget</depends>
    <class>QxTerminator</class>
    <class>QxPopup</class>
    <class>QxButton</class>
    <class>QxContainer</class>
    <class>QxToolTip</class>
  </package>
  
  <package name="toolbar">
    <depends>basicwidget</depends>
    <class>QxToolBar</class>
    <class>QxToolBarPart</class>
    <class>QxToolBarButton</class>
    <class>QxToolBarSeparator</class>
    <class>QxToolBarCheckBox</class>
    <class>QxToolBarRadioButton</class>
    <class>QxToolBarMenuButton</class>
  </package>
  
  <package name="menu">
    <depends>extrawidget</depends>
    <class>QxMenu</class>
    <class>QxMenuButton</class>
    <class>QxMenuCheckBox</class>
    <class>QxMenuRadioButton</class>
    <class>QxMenuSeparator</class>
    <class>QxMenuBar</class>
    <class>QxMenuBarButton</class>
  </package>
  
  
  <package name="image">
    <depends>basicwidget</depends>
    <class>QxImagePreloader</class>
    <class>QxImage</class>
  </package>
  
  <package name="list">
    <depends>core</depends>
    <class>QxSelectionStorage</class>
    <class>QxSelectionManager</class>
    <class>QxList</class>
    <class>QxListItem</class>
    <class>QxComboBox</class>
  </package>
  
  <package name="popup">
    <depends>basicwidget</depends>  
  </package>
  
  <package name="tree">
    <depends>basicwidget</depends>  
    <class>QxTreeElement</class>
    <class>QxTreeFile</class>
    <class>QxTreeFolder</class>
    <class>QxTree</class>
  </package>
  
  <package name="dragndrop">
    <depends>core</depends>  
    <class>QxDragEvent</class>
    <class>QxDragAndDropManager</class>
  </package>
  
  <package name="input">
    <depends>basicwidget</depends>
    <class>QxForm</class>
    <class>QxTextField</class>
    <class>QxPasswordField</class>
    <class>QxTextArea</class>
    <class>QxInputCheckIcon</class>
    <class>QxRadioButtonManager</class>
    <class>QxRadioButton</class>
  </package>
  
  <package name="tabbar">
    <depends>basicwidget</depends>
    <class>QxTabFrame</class>
    <class>QxTabBar</class>
    <class>QxTabPane</class>
    <class>QxTabPage</class>
    <class>QxTab</class>
  </package>
  
  <package name="barselector">
    <depends>toolbar</depends>
    <depends>tabbar</depends>
    <class>QxBarSelectorFrame</class>
    <class>QxBarSelectorBar</class>
    <class>QxBarSelectorPane</class>
    <class>QxBarSelectorPage</class>
    <class>QxBarSelectorButton</class>
  </package>
  
  <package name="otherwidgets"> 
    <depends>basicwidget</depends>
    <depends>timer</depends>
    <class>QxListView</class>
    <class>QxFieldSet</class>
    <class>QxIframe</class>
  </package>

</dependencies>

