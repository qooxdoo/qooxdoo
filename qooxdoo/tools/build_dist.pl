#!/usr/bin/perl 

# 
# $Id$
#  
# Packaging script for qooxdoo. Call with --help to get usage information 
#   packages only JavaScript source, no CSS or anything else
#

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
my $dependenciesFile = $opt_d || 'dependencies.xml';

if ( !$package ) {
    print "The -p option is mandatory. Run '$0 --help' if you need more information\n";
    exit;
}


%excludedirs = ( 'CVS' => 1, '.cache' => 1, 'public' => 1);

# read in package and dependency definition file
my $ref = XMLin($dependenciesFile);

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
 loop over @neededFiles and content of all files to $text
=cut 
sub appendFiles() {
    local $/ = undef;  
    foreach (@neededFiles) {
        open F, $fileLocations{$_} or die "can't open ".$fileLocations{$_}." for depency ".$_;
        $text .= <F> and print "Appending contents of $fileLocations{$_} \n";
        close F;
    }
}

=pod
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
recursive subroutine to get names of files, that the provided package is dependent on
=cut
sub add_dependencies {
    my ($packageName, $stackRef) = @_;
    die "invalid package referenced '$packageName'\n" unless $packages{$packageName};
    
    foreach ( @{$dependencies{$packageName}} ) { add_dependencies($_, $stackRef); }
    push @$stackRef, @{$dependencies{$packageName}};
}

=pod print usage information 
=cut
sub HELP_MESSAGE() {
    my $out = shift;
    my $packagelist;
    foreach (keys %packages) { $packagelist .= "                 $_\n";}
print  $out
"  -f <file_name>     of the output file (set to 'qooxdoo.js' if not specified)\n".
"  -e <file_ending>   suffix of the input files (default is '.js')\n".
"  -d <dep_xml_file>  location of dependency and package definition file (default is './dependencies.xml')\n".
"  -b <base_dir>      base directory from which searching for dependencies should\n".
"                     be started (defaults to current directory)\n".
"  -p <package>   comma-separated list of package names that should be packed into the output file.\n".       
"                 Available packages are: (default is 'basicwidget'):\n".
"                 $packagelist";
                              
} 


