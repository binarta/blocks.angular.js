(function () {
    angular.module('bin.blocks', ['binarta.search', 'notifications', 'bin.blocks.templates'])
        .directive('binBlocks', ['$templateCache', '$timeout', 'ngRegisterTopicHandler', BinBlocksDirective])
        .directive('binBlock', ['$templateCache', BinBlockDirective]);

    function BinBlocksDirective($templateCache, $timeout, topics) {
        return {
            restrict: 'E',
            scope: {
                partition: '@',
                count: '@'
            },
            controller: 'BinartaSearchController',
            controllerAs: 'ctrl',
            bindToController: true,
            template: $templateCache.get('bin-blocks.html'),
            link: function (scope) {
                var delay = 300;
                var ctrl = scope.ctrl;

                ctrl.init({
                    entity:'catalog-item',
                    context:'search',
                    locale: 'default',
                    filters:{
                        type: 'uiBlocks',
                        partition: ctrl.partition
                    },
                    sortings: [
                        {on:'priority', orientation:'desc'}
                    ],
                    subset:{count:parseInt(ctrl.count)},
                    autosearch:true,
                    noMoreResultsNotification: false
                });

                ctrl.templateUrl = 'partials/blocks' + ctrl.partition + 'blocks.html';

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

    function BinBlockDirective($templateCache) {
        return {
            restrict: 'E',
            require: '^^binBlocks',
            scope: {
                block: '='
            },
            controller: function () {
                this.templateUrl = 'partials/blocks' + this.block.partition + 'block.html';
            },
            controllerAs: 'ctrl',
            bindToController: true,
            template: $templateCache.get('bin-block.html'),
            link: function(scope, element, attrs, blocksCtrl) {
                var ctrl = scope.ctrl;

                ctrl.edit = blocksCtrl.edit;

                ctrl.blockRemoved = function () {
                    blocksCtrl.blockRemoved(ctrl.block);
                }
            }
        }
    }
})();