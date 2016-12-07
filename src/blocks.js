(function () {
    angular.module('bin.blocks', ['binarta.search', 'notifications', 'bin.blocks.templates', 'bin.edit'])
        .directive('binBlocks', ['$templateCache', '$timeout', 'ngRegisterTopicHandler', BinBlocksDirective])
        .component('binBlocks', new BinBlocksComponent())
        .component('binBlock', new BinBlockComponent());


    function BinBlocksDirective($templateCache, $timeout, topics) {
        return {
            restrict: 'E',
            scope: {
                partition: '@',
                type: '@',
                count: '@',
                readOnly: '@'
            },
            controller: 'BinartaSearchController',
            controllerAs: 'ctrl',
            bindToController: true,
            template: $templateCache.get('bin-blocks.html'),
            link: function (scope) {
                var delay = 300;
                var ctrl = scope.ctrl;
                var count = parseInt(ctrl.count || 100);

                ctrl.init({
                    entity: 'catalog-item',
                    context: 'search',
                    filters: {
                        type: ctrl.type,
                        partition: ctrl.partition
                    },
                    sortings: [
                        {on: 'priority', orientation: 'desc'}
                    ],
                    subset: {count: count},
                    autosearch: true,
                    noMoreResultsNotification: false
                });

                ctrl.templateUrl = 'partials/blocks' + ctrl.partition + 'blocks.html';

                ctrl.active = ctrl.readOnly == undefined;

                topics(scope, 'edit.mode', function (editModeActive) {
                    ctrl.edit = editModeActive;
                });

                ctrl.blockRemoved = function (block) {
                    block.cssClass = 'removed';
                    $timeout(function () {
                        ctrl.results.splice(ctrl.results.indexOf(block), 1);
                    }, delay);
                };

                ctrl.addBlock = function (args) {
                    args.item.defaultName = 'block';
                    args.submit();
                };

                ctrl.blockAdded = function (block) {
                    block.cssClass = 'added';
                    ctrl.subset.offset++;
                    $timeout(function () {
                        delete block.cssClass;
                    }, delay);
                    ctrl.results.unshift(block);
                };
            }
        }
    }



    function BinBlocksComponent() {
        this.bindings = {
            partition: '@',
            type: '@',
            count: '@',
            readOnly: '@'
        };

        this.templateUrl = 'bin-blocks.html';

        this.controllerAs = 'ctrl';

        this.controller = function () {
            var ctrl= this;
            var delay = 300;
            var count = parseInt(ctrl.count || 100);

            ctrl.init({
                entity: 'catalog-item',
                context: 'search',
                filters: {
                    type: ctrl.type,
                    partition: ctrl.partition
                },
                sortings: [
                    {on: 'priority', orientation: 'desc'}
                ],
                subset: {count: count},
                autosearch: true,
                noMoreResultsNotification: false
            });

            ctrl.templateUrl = 'partials/blocks' + ctrl.partition + 'blocks.html';

            ctrl.active = ctrl.readOnly == undefined;

            topics(scope, 'edit.mode', function (editModeActive) {
                ctrl.edit = editModeActive;
            });

            ctrl.blockRemoved = function (block) {
                block.cssClass = 'removed';
                $timeout(function () {
                    ctrl.results.splice(ctrl.results.indexOf(block), 1);
                }, delay);
            };

            ctrl.addBlock = function (args) {
                args.item.defaultName = 'block';
                args.submit();
            };

            ctrl.blockAdded = function (block) {
                block.cssClass = 'added';
                ctrl.subset.offset++;
                $timeout(function () {
                    delete block.cssClass;
                }, delay);
                ctrl.results.unshift(block);
            };

        }
    }


    function BinBlockComponent() {
        // use src instead of block, block is deprecated
        this.bindings = {
            src: '=',
            block: '='
        };

        this.require = {
            blocksCtrl: '^^binBlocks'
        };

        this.controllerAs = 'ctrl';

        this.controller = function () {
            var ctrl = this;

            if (ctrl.block != undefined) {
                ctrl.src = ctrl.block;
            }

            ctrl.$onInit = function () {

                ctrl.edit = ctrl.blocksCtrl.edit;

                ctrl.active = ctrl.blocksCtrl.active;

                ctrl.blockRemoved = function () {
                    ctrl.blocksCtrl.blockRemoved(ctrl.src);
                }
            }
            ctrl.templateUrl = 'partials/blocks' + ctrl.src.partition + 'block.html';
        };

        this.templateUrl = 'bin-block.html';
    }

    function BinBlockDirective($templateCache) {
        return {
            restrict: 'E',
            require: '^^binBlocks',
            scope: {
                src: '='
            },
            controller: function () {
                this.templateUrl = 'partials/blocks' + this.src.partition + 'block.html';
            },
            controllerAs: 'ctrl',
            bindToController: true,
            template: $templateCache.get('bin-block.html'),
            link: function (scope, element, attrs, blocksCtrl) {
                var ctrl = scope.ctrl;

                ctrl.edit = blocksCtrl.edit;

                ctrl.active = blocksCtrl.active;

                ctrl.blockRemoved = function () {
                    blocksCtrl.blockRemoved(ctrl.src);
                }
            }
        }
    }
})();
