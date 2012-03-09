# Copyright (c) 2008-2009 Pedro Matiello <pmatiello@gmail.com>
#                         Zsolt Haraszti <zsolt@drawwell.net>
#
# Permission is hereby granted, free of charge, to any person
# obtaining a copy of this software and associated documentation
# files (the "Software"), to deal in the Software without
# restriction, including without limitation the rights to use,
# copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the
# Software is furnished to do so, subject to the following
# conditions:

# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
# OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
# HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
# WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
# FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
# OTHER DEALINGS IN THE SOFTWARE.


"""
Random graph generators.

@sort: generate
"""


# Imports
import graph as classes
from random import randint


# Generator

def generate(graph, num_nodes, num_edges, weight_range=(1, 1)):
    """
    Add nodes and random edges to the graph.
    
    @type  graph: graph
    @param graph: Graph.
    
    @type  num_nodes: number
    @param num_nodes: Number of nodes.
    
    @type  num_edges: number
    @param num_edges: Number of edges.

    @type  weight_range: tuple
    @param weight_range: tuple of two integers as lower and upper limits on randomly generated
    weights (uniform distribution).
    """
    # Discover if graph is directed or not
    directed = (type(graph) == classes.digraph)

    # Nodes first
    nodes = xrange(num_nodes)
    graph.add_nodes(nodes)
    
    # Build a list of all possible edges
    edges = []
    edges_append = edges.append
    for x in nodes:
        for y in nodes:
            if ((directed and x != y) or (x > y)):
                edges_append((x, y))
    
    # Randomize the list
    for i in xrange(len(edges)):
        r = randint(0, len(edges)-1)
        edges[i], edges[r] = edges[r], edges[i]
    
        # Add edges to the graph
        min_wt = min(weight_range)
        max_wt = max(weight_range)
    for i in xrange(num_edges):
        each = edges[i]
        graph.add_edge(each[0], each[1], wt = randint(min_wt, max_wt))
