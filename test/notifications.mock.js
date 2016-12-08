angular.module('notifications', [])
    .service('topicRegistry', function () {
        this.subscribe = jasmine.createSpy('subscribe');
        this.unsubscribe = jasmine.createSpy('unsubscribe');
    });