package Qooxdoo::Services::qooxdoo::test;

#
# qooxdoo - the new era of web interface development
#
# Copyright:
#   (C) 2006 by Nick Glencross
#       All rights reserved
#
# License:
#   LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/
#
# Internet:
#   # http://qooxdoo.org
#
# Author:
#   * Nick Glencross
#     nick dot glencross at gmail dot com
#

# This is the standard qooxdoo test class.  There are tests for each of the
# primitive types here, along with standard named tests "echo", "sink" and
# "sleep".

# Each of the methods should be fairly self-explanatory

use strict;

use Qooxdoo::JSONRPC;

sub echo
{
    my $error  = shift;
    my @params = @_;

    my $count  = 1+$#params;

    if ($count != 1)
    {
        $error->set_error (Qooxdoo::JSONRPC::JsonRpcError_ParameterMismatch,
                           "Expected 1 parameter, but got " . $count);
        return $error;
    }
    
    return "Client said: [$params[0]]";
}


sub sink 
{
    my $error  = shift;
    my @params = @_;

    # We're never supposed to return. Just sleep for a very long time
    sleep 240;
}


sub sleep
{
    my $error  = shift;
    my @params = @_;

    my $count  = 1+$#params;

    if ($count != 1)
    {
        $error->set_error (Qooxdoo::JSONRPC::JsonRpcError_ParameterMismatch,
                           "Expected 1 parameter, but got " . $count);
        return $error;
    }
    
    sleep ($params[0]);

    return $params[0];
}


sub getInteger 
{
    return 1;
}


sub getFloat
{
    return 1/3;
}


sub getString
{
    return "Hello world";
}


sub getBadString
{
    return "<!DOCTYPE HTML \"-//IETF//DTD HTML 2.0//EN\">";
}


sub getArrayInteger
{
    return [1, 2, 3, 4];
}


sub getArrayString
{
    return ["one", "two", "three", "four"];
}


sub getObject
{
    # XXX This isn't a real Object. The JSON module does not appear to
    # support both 'selfconvert' and 'convblessed', which is what we need

    # Return a hash, but not blessed
    return {test => 1};
}


sub getTrue
{
    return JSON::True;
}


sub getFalse
{
    return JSON::False;
}


sub getNull
{
    return JSON::Null;
}


sub isInteger
{
    my $error  = shift;
    my @params = @_;

    return $params[0] =~ /^[\-\+\d]+$/ ? JSON::True : JSON::False;
}


sub isFloat
{
    my $error  = shift;
    my @params = @_;

    return $params[0] =~ /^[\-\+\d\.]+$/ ? JSON::True : JSON::False;
}


sub isString
{
    my $error  = shift;
    my @params = @_;

    return ref $params[0] eq '' ? JSON::True : JSON::False;
}


sub isBoolean
{
    my $error  = shift;
    my @params = @_;

    my $param = $params[0];

    my $is_true = ref $param eq 'JSON::NotString'
        && defined $param->{value}
    && ($param->{value} eq 'true' ||
        $param->{value} eq 'false');
    
    return $is_true ? JSON::True : JSON::False;
}


sub isArray
{
    my $error  = shift;
    my @params = @_;

    return ref $params[0] eq 'ARRAY' ? JSON::True : JSON::False;
}


sub isObject
{
    my $error  = shift;
    my @params = @_;

    return ref $params[0] eq 'HASH' ? JSON::True : JSON::False;
}


sub isNull
{
    my $error  = shift;
    my @params = @_;

    my $param = $params[0];

    my $is_null = ref $param eq 'JSON::NotString'
        && !defined $param->{value};
    
    return $is_null ? JSON::True : JSON::False;
}


sub getParams
{
    my $error  = shift;
    my @params = @_;

    return @params;
}       


sub getParam
{
    my $error  = shift;
    my @params = @_;

    return $params[0];
}       


sub getCurrentTimestamp
{
    my $now = time;

    return {now => $now,
            json => new Qooxdoo::JSONRPC::Date ($now)};
}


sub getError
{
    my $error  = shift;
    my @params = @_;

    $error->set_error(23, "This is an application-provided error");
    return $error;
}



1;
