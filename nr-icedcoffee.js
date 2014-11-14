/*
 * https://github.com/conceptuli/node-red-iced-coffeescript
 *
 * Copyright 2014 Conceptuli, LLC. All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 * 
 *    1. Redistributions of source code must retain the above copyright notice, this list of
 *       conditions and the following disclaimer.
 * 
 *    2. Redistributions in binary form must reproduce the above copyright notice, this list
 *       of conditions and the following disclaimer in the documentation and/or other materials
 *       provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY CONCEPTULI, LLC AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Coder of Salvation OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * The views and conclusions contained in the software and documentation are those of the
 * authors and should not be interpreted as representing official policies, either expressed
 * or implied, of Conceptuli, LLC
 */
module.exports = function(RED) {
    var util = require("util");
    var vm = require("vm");
    var fs = require('fs');
    var fspath = require('path');
    var iced = require('iced-coffee-script');

    function IcedCoffeeNode(n) {
        RED.nodes.createNode(this,n);
        this.name = n.name;
        this.func = n.func;
        this.topic = n.topic;
        this.context = {global:RED.settings.functionGlobalContext || {}};
        try {
            this.on("input", function(msg) {
                if (msg != null) {
                    var cs = "f";
                    try {
                        var results = eval( iced.compile( this.func, {sandbox:true} ) );
                        if (results == null) {
                            results = [];
                        } else if (results.length == null) {
                            results = [results];
                        }
                        if (msg._topic) {
                            for (var m in results) {
                                if (results[m]) {
                                    if (util.isArray(results[m])) {
                                        for (var n in results[m]) {
                                            results[m][n]._topic = msg._topic;
                                        }
                                    } else {
                                        results[m]._topic = msg._topic;
                                    }
                                }
                            }
                        }
                        this.send(results);

                    } catch(err) {
                        this.error(err.toString());
                    }
                }
            });
        } catch(err) {
            this.error(err);
        }
    }

    RED.nodes.registerType("iced-coffee",IcedCoffeeNode);
    RED.library.register("functions");
}