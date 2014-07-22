;(function (window, $) {
    "use strict";

    if ($ === undefined) {
        throw "jQuery is needed";
    }

    var instanceCounter = 1;

    // unique instance number
    var random = Math.floor(Math.random() * 500000);

    // this will make spaces disappear, jQuery treats spaces as separate events
    var eventHash = function (str) {
        var i, hex, result = "";
        str = str.toString();

        for (i = 0; i < str.length; i += 1) {
            hex = str.charCodeAt(i).toString(16);
            result += ("000" + hex).slice(-4);
        }

        return "event" + random + result;
    };

    // nice trick seen in https://gist.github.com/rwaldron/705311
    // empty jQuery object where we just use the jQuery events directly
    var $jQueryObj = $({});

    // these are data containers that powers the P$ world
    var instances = {};
    var constructors = {};

    var P$ = function(namespace, args){
        var instance;

        if (!namespace) {
            throw "Please specify a namespace";
        }

        // we create an instance if constructor was defined
        if ($.isFunction(constructors[namespace])) {
            // using the singleton but we add uniqueness to it
            // so that global cannot communicate with instance
            // instead using P$.find to get all instances of the namespace
            instance = P$.global(namespace, instanceCounter);
            instanceCounter += 1;

            // keeping track of the instances
            instances[namespace] = instances[namespace] || [];
            instances[namespace].push(instance);

            if ($.isArray(args) && args.length) {
                constructors[namespace].apply(instance, args);
            }
            else {
                constructors[namespace].call(instance);
            }
            return instance;
        }
        else {
            throw "The constructor for " + namespace + " has not been defined, use P$.define first";
        }
    };

    // our PubSub constructor, define constructor, and create instances
    P$.define = function (namespace, construct) {

        if (!namespace) {
            throw "Namespace must be defined";
        }

        if (!construct) {
            throw "Constructor must be defined";
        }

        // if constructor is provided, this is just definition
        if ($.isFunction(construct)) {
            // bad situation, you cannot redefine a module
            if ($.isFunction(constructors[namespace])) {
                throw "Module cannot be redefined";
            }

            constructors[namespace] = construct;
        }
    };

    // our PubSub global/singleton constructor
    P$.global = function (namespace, instanceNo) {
        if (!(this instanceof P$.global)) {
            return new P$.global(namespace, instanceNo);
        }
        this.___namespace = namespace || "";
        this.___instance = instanceNo || "";
        this.___events = [];
        this.___killed = false;
        this.___name = '';
    };

    P$.destroyAll = function (namespace) {
        var i;
        if (namespace === undefined) {
            instances = [];
            constructors = [];
            return;
        }
        if (instances[namespace]) {
            if (instances[namespace].length) {
                for (i = 0; i < instances[namespace].length; i = i + 1) {
                    instances[namespace][i].___killed = true;
                    // remove all events
                    instances[namespace][i].off("*");
                }
            }
            delete instances[namespace];
        }

        if (constructors[namespace]) {
            delete constructors[namespace];
        }
    };

    // finding all the instances with the same namespace
    P$.findAll = function (namespace) {
        if (!(this instanceof P$.findAll)) {
            return new P$.findAll(namespace);
        }
        this.___namespace = namespace;
        this.length = $.isArray(instances[this.___namespace]) ? instances[this.___namespace].length : 0;
    };

    // index is not used but we cannot help it
    /*jshint unused:true */
    $.each(["on", "one", "off", "trigger"], function (index, key) {

        // singleton
        P$.global.prototype[key] = function () {
            var that, args, event;
            // making sure pointers that we couldn't de-reference cannot do anything after destroyAll
            if (this.___killed === false) {
                that = this;
                args = $.makeArray(arguments);
                event = eventHash(this.___namespace + this.___instance + "_" + args[0]);

                if (key === "on" || key === "one") {
                    // don't define an event without callback
                    if (!$.isFunction(args[1])) {
                        throw "Events '" + args[0] + "' needs a callback";
                    }
                    // keeping track of events for cleaning up
                    that.___events.push(event);
                    // we don't pass any extra arguments for on and one
                    $jQueryObj[key](event, function () {
                        // jQuery passes the event obj that is useless to us, stripping that out
                        var innerArgs = $.makeArray(arguments).slice(1) || [];
                        args[1].apply(that, innerArgs);
                    });
                }
                // P$.off("*");
                else if (key === "off" && args[0] === "*" && this.___events) {
                    $jQueryObj.off(this.___events.join(" "));
                }
                else {
                    // the arguments structured for $obj.trigger("myevent", [1,2,3]);
                    event = $.isArray(args[1]) && args[1].length ? [event].concat([args[1]]) : [event];
                    $jQueryObj[key].apply($jQueryObj, event);
                }
            }
            return this;
        };

        P$.findAll.prototype[key] = function () {
            var args = $.makeArray(arguments);
            var i;
            for (i = 0; i < this.length; i += 1) {
                instances[this.___namespace][i][key].apply(instances[this.___namespace][i], args);
            }
            return this;
        };
    });

    P$.global.prototype.destroy = function () {
        var i;
        this.___killed = true;
        this.off("*");

        // those with instance property are modules otherwise global
        if (this.___instance && instances[this.___namespace]) {
            for (i = 0; i < instances[this.___namespace].length; i += 1) {
                // found our instance, removing
                if (instances[this.___namespace][i] === this) {
                    if (length === 1) {
                        delete instances[this.___namespace];
                    },
                    else if (i === length - 1) {
                        instances[this.___namespace].pop();
                    }
                    else {
                        instances[this.___namespace][i] = instances[this.___namespace][length - 1];
                        instances[this.___namespace].pop();
                    }
                }
            }
        }

        return this;
    };

    P$.global.prototype.connect = function (map) {
        var that = this;
        for (var key in map) {
            // we only want user defined property not object prototype chain
            if (map.hasOwnProperty(key)) {
                /*jshint loopfunc: true */
                that.on(key, function () {
                    that.trigger(map[key]);
                });
            }
        }

        return this;
    };

    window.P$ = P$;

})(window, window.jQuery);
