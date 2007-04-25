package Qooxdoo::Services::qooxdoo::test;

# qooxdoo - the new era of web development
#
# http://qooxdoo.org
#
# Copyright:
#   2006-2007 Nick Glencross
#
# License:
#   LGPL: http://www.gnu.org/licenses/lgpl.html
#   EPL: http://www.eclipse.org/org/documents/epl-v10.php
#   See the LICENSE file in the project's top-level directory for details.
#
# Authors:
#  * Nick Glencross

# This is the standard qooxdoo test class.  There are tests for each of the
# primitive types here, along with standard named tests "echo", "sink" and
# "sleep".

# Each of the methods should be fairly self-explanatory

use strict;

use Qooxdoo::JSONRPC;

# Specify method accessibility.  Default value is configured in server,
# but may be overridden on a per-method basis here.
#
# @param method
#   The name of the method (without the leading "method_") to be tested
#   for accessibility.
#
# @param defaultAccessibility
#   The default accessibility configured in the server.  (See @return for
#   possible values.)
#
# @param bScriptTransportInUse (not yet implemented)
#   Boolean indicating whether the current request was issued via
#   ScriptTransport.
#
# @param bDefaultScriptTransportAllowed (not yet implemented)
#   Boolean specifying the default value for allowing requests via
#   ScriptTransport. 
#
# @return
#   One of these values:
#     Accessibility_Public
#     Accessibility_Domain
#     Accessibility_Session
#     Accessibility_Fail

sub GetAccessibility
{
    my ($method, $defaultAccessibility) = @_;

    # This flag can be used to enable/disable the ACL checks
    my $acl_disabled = 1;
    return $defaultAccessibility if $acl_disabled;

    my %acl = (echo       => Qooxdoo::JSONRPC::Accessibility_Domain,
               getInteger => Qooxdoo::JSONRPC::Accessibility_Session,
               getString  => Qooxdoo::JSONRPC::Accessibility_Public);

    return $acl{$method} || $defaultAccessibility;
}


sub method_echo
{
    my $error  = shift;
    my @params = @_;

    my $count  = 1+$#params;

    if ($count != 1)
    {
        $error->set_error (Qooxdoo::JSONRPC::JsonRpcError_ParameterMismatch,
                           "Expected 1 parameter, but got $count");
        return $error;
    }
    
    return "Client said: [$params[0]]";
}


sub method_sink 
{
    my $error  = shift;
    my @params = @_;

    # We're never supposed to return. Just sleep for a very long time
    sleep 240;
}


sub method_sleep
{
    my $error  = shift;
    my @params = @_;

    my $count  = 1+$#params;

    if ($count != 1)
    {
        $error->set_error (Qooxdoo::JSONRPC::JsonRpcError_ParameterMismatch,
                           "Expected 1 parameter, but got $count");
        return $error;
    }
    
    sleep ($params[0]);

    return $params[0];
}


sub method_getInteger 
{
    return 1;
}


sub method_getFloat
{
    return 1/3;
}


sub method_getString
{
    return "Hello world";
}


sub method_getBadString
{
    return "<!DOCTYPE HTML \"-//IETF//DTD HTML 2.0//EN\">";
}


sub method_getArrayInteger
{
    return [1, 2, 3, 4];
}


sub method_getArrayString
{
    return ["one", "two", "three", "four"];
}


sub method_getObject
{
    # XXX This isn't a real Object. The JSON module does not appear to
    # support both 'selfconvert' and 'convblessed', which is what we
    # ideally need

    # Return a hash, but not blessed
    return {test => 1};
}


sub method_getTrue
{
    return JSON::True;
}


sub method_getFalse
{
    return JSON::False;
}


sub method_getNull
{
    return JSON::Null;
}


sub method_isInteger
{
    my $error  = shift;
    my @params = @_;

    return Qooxdoo::JSONRPC::json_bool ($params[0] =~ /^[\-\+\d]+$/);
}


sub method_isFloat
{
    my $error  = shift;
    my @params = @_;

    return Qooxdoo::JSONRPC::json_bool ($params[0] =~ /^[\-\+\d\.]+$/);
}


sub method_isString
{
    my $error  = shift;
    my @params = @_;

    return Qooxdoo::JSONRPC::json_bool (ref $params[0] eq '');
}


sub method_isBoolean
{
    my $error  = shift;
    my @params = @_;

    my $param = $params[0];

    my $is_true = ref $param eq 'JSON::NotString'
        && defined $param->{value}
        && ($param->{value} eq 'true' ||
            $param->{value} eq 'false');
    
    return Qooxdoo::JSONRPC::json_bool ($is_true);
}


sub method_isArray
{
    my $error  = shift;
    my @params = @_;

    return Qooxdoo::JSONRPC::json_bool (ref $params[0] eq 'ARRAY');
}


sub method_isObject
{
    my $error  = shift;
    my @params = @_;

    return Qooxdoo::JSONRPC::json_bool (ref $params[0] eq 'HASH');
}


sub method_isNull
{
    my $error  = shift;
    my @params = @_;

    my $param = $params[0];

    my $is_null = ref $param eq 'JSON::NotString'
        && !defined $param->{value};
    
    return Qooxdoo::JSONRPC::json_bool ($is_null);
}


sub method_getParams
{
    my $error  = shift;
    my @params = @_;

    return @params;
}       


sub method_getParam
{
    my $error  = shift;
    my @params = @_;

    return $params[0];
}       


sub method_getCurrentTimestamp
{
    my $now = time;

    return {now  => $now,
            json => new Qooxdoo::JSONRPC::Date ($now)};
}


sub method_getError
{
    my $error  = shift;
    my @params = @_;

    $error->set_error(23, "This is an application-provided error");
    return $error;
}



1;
