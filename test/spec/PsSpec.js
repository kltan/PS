describe("P$", function () {
    "use strict";

    afterEach(function () {
        P$.destroyAll("test");
    });

    it("should throw errors when namespace is not defined", function () {
        expect(function () {
            P$();
        }).toThrow("Please specify a namespace");
    });

    it("should throw error if trying to instantiate an undefined namespace", function () {
        expect(function () {
            P$("test");
        }).toThrow("The constructor for test has not been defined, use P$.define first");
    });

    it("should pass arguments to constructor on creation", function () {
        var spy = jasmine.createSpy();
        P$.define("test", spy);
        P$("test", [1,2,3]);
        expect(spy).toHaveBeenCalledWith(1,2,3);
    });

});

describe("P$.define", function(){
    "use strict";

    afterEach(function () {
        P$.destroyAll("test");
    });

    it("should run the constructor when an instance is created", function () {
        var init = jasmine.createSpy();
        P$.define("test", init);
        P$("test");
        expect(init).toHaveBeenCalled();
    });

    it("should return a P$.global instance when instantiated", function () {
        P$.define("test", function () {
        });
        expect(P$("test").constructor).toBe(P$.global);
    });


});

describe("P$.global", function () {
    "use strict";

    afterEach(function () {
        P$.destroyAll("test");
    });

    it("should populate it's instance number and namespace correctly", function () {
        var instance = P$.global("test", 10);
        expect(instance.prop.instance).toBe(10);
        expect(instance.prop.namespace).toBe("test");
    });

    it("should have connect on off trigger one", function () {
        var instance = P$.global("test", 10);

        expect(instance.on).toBe(P$.global.prototype.on);
        expect(instance.off).toBe(P$.global.prototype.off);
        expect(instance.trigger).toBe(P$.global.prototype.trigger);
        expect(instance.one).toBe(P$.global.prototype.one);
        expect(instance.connect).toBe(P$.global.prototype.connect);
    });
});

describe("P$.destroyAll", function () {
    "use strict";

    afterEach(function () {
        P$.destroyAll("test");
    });

    it("should clean up multiple instances", function () {
        var instance1, instance2;
        var func1 = jasmine.createSpy();
        var func2 = jasmine.createSpy();
        var func3 = jasmine.createSpy();

        P$.define("test", func3);
        instance1 = P$("test").on("event1", func1);
        instance2 = P$("test").on("event2", func2);
        instance1.trigger("event1");
        instance2.trigger("event2");
        expect(func1.calls.count()).toBe(1);
        expect(func2.calls.count()).toBe(1);
        instance1.trigger("event1");
        instance2.trigger("event2");
        expect(func1.calls.count()).toBe(2);
        expect(func2.calls.count()).toBe(2);
        P$.destroyAll("test");
        instance1.trigger("event1");
        instance2.trigger("event2");
        expect(func1.calls.count()).toBe(2);
        expect(func2.calls.count()).toBe(2);
    });
});

describe("P$.findAll", function () {
    "use strict";

    var instance1, instance2;
    var func1;
    var func2;
    var func3;

    beforeEach(function () {
        P$.destroyAll("test");
        func1 = jasmine.createSpy();
        func2 = jasmine.createSpy();
        func3 = jasmine.createSpy();
        P$.define("test", func3);
        instance1 = P$("test").on("event1", func1);
        instance2 = P$("test").on("event2", func2);
    });

    afterEach(function () {
        instance1 = null;
        instance2 = null;
        func1 = null;
        func2 = null;
        func3 = null;
        P$.destroyAll("test");
    });

    it("should find multiple instances, and return correct length", function () {
        expect(P$.findAll("test").length).toBe(2);
    });

    it("should have on off trigger one", function () {
        var instances;
        instances = P$.findAll("test");

        expect(instances.on).toBe(P$.findAll.prototype.on);
        expect(instances.off).toBe(P$.findAll.prototype.off);
        expect(instances.trigger).toBe(P$.findAll.prototype.trigger);
        expect(instances.one).toBe(P$.findAll.prototype.one);
    });
});

describe("P$instance.on", function () {
    "use strict";

    var instance;
    var func1;
    var func2;

    beforeEach(function () {
        P$.define("test", function () {
            this.on("some event", func1);
        });
        func1 = jasmine.createSpy();
        func2 = jasmine.createSpy();
        instance = P$("test").on("some late binding event", func2);
    });

    afterEach(function () {
        instance = null;
        func1 = null;
        func2 = null;
        P$.destroyAll("test");
    });

    it("should listen to module event on the constructor", function () {
        expect(func1.calls.count()).toBe(0);
        P$("test").trigger("some event").trigger("some event");
        expect(func1.calls.count()).toBe(2);
    });

    it("should listen to module event after instantiated", function () {
        expect(func2.calls.count()).toBe(0);
        instance.trigger("some late binding event").trigger("some late binding event");
        expect(func2.calls.count()).toBe(2);
    });

    it("should listen to global event", function () {
        P$.global("global event").on("fire event", func2);
        expect(func2.calls.count()).toBe(0);
        // fire + clean up
        P$.global("global event").trigger("fire event").trigger("fire event").destroy();
        expect(func2.calls.count()).toBe(2);
    });

    it("should work with unicode events", function () {
        expect(func1.calls.count()).toBe(0);
        P$.global("全体")
            .on("解散", func1)
            .trigger("解散");

        expect(func1.calls.count()).toBe(1);
    });
});

describe("P$instance.one", function () {
    "use strict";

    var instance;
    var func1;
    var func2;

    beforeEach(function () {
        P$.define("test", function () {
            this.one("some event", func1);
        });
        func1 = jasmine.createSpy();
        func2 = jasmine.createSpy();
        instance = P$("test").one("some late binding event", func2);
    });

    afterEach(function () {
        instance = null;
        func1 = null;
        func2 = null;
        P$.destroyAll("test");
    });

    it("should listen once to module event on the constructor", function () {
        expect(func1.calls.count()).toBe(0);
        P$("test").trigger("some event").trigger("some event");
        expect(func1.calls.count()).toBe(1);
    });

    it("should listen once to module event after initialization", function () {
        expect(func2.calls.count()).toBe(0);
        instance.trigger("some late binding event").trigger("some late binding event");
        expect(func2.calls.count()).toBe(1);
    });

    it("should listen once to global event", function () {
        P$.global("global event").one("fire event", func2);
        expect(func2.calls.count()).toBe(0);
        // fire + clean up
        P$.global("global event").trigger("fire event").trigger("fire event").destroy();
        expect(func2.calls.count()).toBe(1);
    });
});

describe("P$instance.off", function () {
    "use strict";

    var instance;
    var func1;
    var func2;

    beforeEach(function () {
        P$.define("test", function () {
            this.on("some event", func1);
        });
        func1 = jasmine.createSpy();
        func2 = jasmine.createSpy();
        instance = P$("test").on("some late binding event", func2);
    });

    afterEach(function () {
        instance = null;
        func1 = null;
        func2 = null;
        P$.destroyAll("test");
    });

    it("should stop listen to global events", function () {
        expect(func2.calls.count()).toBe(0);
        P$.global("some global")
            .on("fire me", func2)
            .trigger("fire me")
            .trigger("fire me");
        expect(func2.calls.count()).toBe(2);
        P$.global("some global")
            .off("fire me")
            .trigger("fire me")
            .trigger("fire me");
        expect(func2.calls.count()).toBe(2);
    });

    it("should stop listen to module events", function () {
        expect(func1.calls.count()).toBe(0);
        instance.trigger("some event");
        expect(func1.calls.count()).toBe(1);
        instance.trigger("some event");
        expect(func1.calls.count()).toBe(2);
        instance
            .off("some event")
            .trigger("some event");
        expect(func1.calls.count()).toBe(2);
    });
});

describe("P$instance.trigger", function () {
    "use strict";

    var instance;
    var func1;
    var func2;

    beforeEach(function () {
        P$.define("test", function () {
            this.on("some event", func1);
        });
        func1 = jasmine.createSpy();
        func2 = jasmine.createSpy();
        instance = P$("test").on("some late binding event", func2);
    });

    afterEach(function () {
        instance = null;
        func1 = null;
        func2 = null;
        P$.destroyAll("test");
    });

    it("should trigger global events", function () {
        expect(func2.calls.count()).toBe(0);
        P$.global("some global")
            .on("fire me", func2)
            .trigger("fire me")
            .trigger("fire me");
        expect(func2.calls.count()).toBe(2);
    });

    it("should trigger module events", function () {
        expect(func1.calls.count()).toBe(0);
        instance.trigger("some event");
        expect(func1.calls.count()).toBe(1);
        instance.trigger("some event");
        expect(func1.calls.count()).toBe(2);
    });
});

describe("P$instance.connect", function () {
    "use strict";

    afterEach(function () {
        P$.destroyAll("test");
    });

    it("should cause event to fire in a cascading fashion", function () {
        var func1 = jasmine.createSpy();
        var func2 = jasmine.createSpy();
        var func3 = jasmine.createSpy();
        var instance;

        expect(func1.calls.count()).toBe(0);
        expect(func2.calls.count()).toBe(0);

        P$.define("test", func3);
        instance = P$("test");
        instance
            .on("event1", func1)
            .on("event2", func2)
            .connect({"event1" : "event2"})
            .trigger("event1");

        expect(func1.calls.count()).toBe(1);
        expect(func2.calls.count()).toBe(1);

    });
});

describe("P$instance.destroy", function () {
    "use strict";

    afterEach(function () {
        P$.destroyAll("test");
    });

    it("should stop listen to all event and prevent all P$instance methods", function () {
        var func1 = jasmine.createSpy();
        var func2 = jasmine.createSpy();
        var func3 = jasmine.createSpy();
        var instance;

        expect(func1.calls.count()).toBe(0);
        expect(func2.calls.count()).toBe(0);

        P$.define("test", func3);
        instance = P$("test");
        instance
            .on("event1", func1)
            .on("event2", func2)
            .destroy()
            .trigger("event1")
            .trigger("event2");

        expect(func1.calls.count()).toBe(0);
        expect(func2.calls.count()).toBe(0);
    });
});

