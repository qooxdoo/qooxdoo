.. _pages/interface_quickref#interfaces_quick_ref:

Interfaces Quick Ref
********************

This is a quick reference for the various features of a qooxdoo interface declaration. It uses an :doc:`EBNF-like syntax </pages/tool/ebnf_like>`.

It is much like a class declaration, with a more limited set of features. Properties are just names with empty map values.

::

    interface_decl  := 'qx.Interface.define' '(' '"' <name.space.InterfaceName> '"' ','
                         { feature_spec ',' }
                       ')'

    feature_spec    := 'extend'     ':' extend_spec      |
                       'statics'    ':' statics_spec     |
                       'properties' ':' properties_spec  |
                       'members'    ':' members_spec     |
                       'events'     ':' events_spec

    extend_spec     := <name.of.SuperInterface> |
                       '[' <name.of.SuperInterface1> ',' 
                           <name.of.SuperInterface2> ',' ... ']'

    statics_spec    := '{' 
                        { '"' <upper_case_key> '"' ':' js_primitive_value ',' }
                       '}'

    properties_spec := '{' 
                        { '"' <property_name> '"' ':' '{}' ',' } 
                       '}'

    members_spec    := c_map

    events_spec     := '{' 
                        { '"' <event_name> '"' ':' '"' qx_event_type '"' ',' }
                       '}'

    c_map           := '{' 
                        { <key> ':' ( js_primitive_value | 
                                      js_reference_value | 
                                      js_function_value  |
                                      js_function_call   ) ',' }
                       '}'

    js_function_value   := ? Javascript anonymous function 'function (...) 
                             {...}' ?
    js_function_call    := ? Javascript function call 'foo(...)' ?
    js_primitive_value  := ? any value from the Javascript primitive types ?
    js_reference_value  := ? any value from the Javascript reference types ?
    qx_event_type       := ? any qooxdoo event type class name, e.g. 
                             'qx.event.type.DataEvent' ?

