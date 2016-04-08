(function () {
    angular.module('bin.blocks', ['config', 'binarta.search', 'notifications', 'rest.client', 'bin.blocks.templates'])
        .controller('binBlocksController', ['$scope', '$timeout', 'config', 'binartaSearch', 'ngRegisterTopicHandler', 'restServiceHandler', BinBlocksController])
        .controller('binBlockController', ['$scope', '$timeout', 'config', 'restServiceHandler', BinBlockController])
        .directive('binBlocks', ['$templateCache', BinBlocksDirective])
        .directive('binBlock', ['$templateCache', BinBlockDirective]);

    var delay = 300;

    function BinBlocksController($scope, $timeout, config, search, topics, rest) {
        var self = this;
        this.templateUrl = 'partials/blocks/' + this.partition + '/blocks.html';
        var partition = '/' + this.partition + '/';

        topics($scope, 'edit.mode', function (editModeActive) {
            self.edit = editModeActive;
        });

        search({
            entity: 'catalog-item',
            action: 'findByPartition',
            locale: 'default',
            subset: {
                count: self.count,
                offset: 0
            },
            filters: {
                type: 'uiBlocks',
                partition: partition,
                sortBy: 'priority',
                sortOrder: 'desc'
            },
            success: function (results) {
                self.blocks = results;
            }
        });

        this.addBlock = function () {
            rest({
                scope: $scope,
                params: {
                    method: 'PUT',
                    url: (config.baseUri || '') + 'api/entity/catalog-item',
                    data: {
                        namespace: config.namespace,
                        locale: 'default',
                        type: 'uiBlocks',
                        partition: partition
                    },
                    withCredentials: true
                }
            }).then(function (result) {
                addBlockToList(self.blocks, result.data, $timeout);
            });
        };
    }

    function BinBlockController($scope, $timeout, config, rest) {
        var self = this;
        this.templateUrl = 'partials/blocks' + this.block.partition + 'block.html';

        this.removeBlock = function () {
            self.block.cssClass = 'removed';

            $timeout(function () {
                self.blocks.splice(self.blocks.indexOf(self.block), 1);
            }, delay);

            rest({
                scope: $scope,
                params: {
                    method: 'DELETE',
                    url: (config.baseUri || '') + 'api/entity/catalog-item?id=' + encodeURIComponent(self.block.id ),
                    withCredentials: true
                }
            }).then(function () {
            }, function () {
                $timeout(function () {
                    delete self.block.cssClass;
                    addBlockToList(self.blocks, self.block, $timeout);
                }, delay);
            });
        };
    }

    function addBlockToList(blocks, block, timeout) {
        block.cssClass = 'added';
        timeout(function () {
            delete block.cssClass;
        }, delay);
        blocks.unshift(block);
    }

    function BinBlocksDirective($templateCache) {
        return {
            restrict: 'E',
            scope: {
                partition: '@',
                count: '@'
            },
            controller: 'binBlocksController',
            controllerAs: 'ctrl',
            bindToController: true,
            template: $templateCache.get('bin-blocks.html')
        }
    }

    function BinBlockDirective($templateCache) {
        return {
            restrict: 'E',
            require: '^^binBlocks',
            scope: {
                block: '='
            },
            controller: 'binBlockController',
            controllerAs: 'ctrl',
            bindToController: true,
            template: $templateCache.get('bin-block.html'),
            link: function(scope, element, attrs, blocksCtrl) {
                scope.ctrl.edit = blocksCtrl.edit;
                scope.ctrl.blocks = blocksCtrl.blocks;
            }
        }
    }
})();