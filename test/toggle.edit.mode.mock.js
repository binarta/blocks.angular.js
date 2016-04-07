angular.module('toggle.edit.mode', [])
    .service('editMode', function () {
        var self = this;

        this.bindEvent = function(ctx) {
            self.bindEventSpy = ctx;
        };
    })
    .service('editModeRenderer', function () {
        var self = this;

        this.open = function (ctx) {
            self.openSpy = ctx;
        };

        this.close = jasmine.createSpy('close');
    });