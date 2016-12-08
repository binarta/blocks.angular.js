(function () {
    angular.module('bin.blocks', ['binarta.search', 'notifications', 'bin.blocks.templates', 'bin.edit'])
        .component('binBlocks', new BlocksComponent())
        .component('binBlock', new BlockComponent());

    function BlocksComponent() {
        this.templateUrl = 'bin-blocks.html';

        this.bindings = {
            partition: '@',
            type: '@',
            count: '@'
        };

        this.controllerAs = 'ctrl';

        this.controller = ['$timeout', 'binartaSearch', 'topicRegistry', function ($timeout, search, topics) {
            var ctrl = this;
            var delay = 300;
            var count = parseInt(ctrl.count || 100);
            var offset = 0;
            var editing = false;
            var searchForMoreLock;
            ctrl.templateUrl = 'partials/blocks' + ctrl.partition + 'blocks.html';
            executeSearch();

            ctrl.searchForMore = function () {
                if (searchForMoreLock) return;
                offset += count;
                executeSearch();
            };

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
                $timeout(function () {
                    delete block.cssClass;
                }, delay);
                ctrl.results.unshift(block);
            };

            ctrl.isEditing = function () {
                return editing;
            };

            topics.subscribe('edit.mode', editModeListener);

            ctrl.$onDestroy = function () {
                topics.unsubscribe('edit.mode', editModeListener);
            };

            function editModeListener(editModeActive) {
                editing = editModeActive;
            }

            function executeSearch() {
                searchForMoreLock = true;

                search({
                    action: 'search',
                    entity: 'catalog-item',
                    filters: {
                        type: ctrl.type || 'uiBlocks',
                        partition: ctrl.partition
                    },
                    sortings: [{
                        on: 'priority',
                        orientation: 'desc'
                    }],
                    subset: {
                        count: count,
                        offset: offset
                    },
                    success: onSearchSuccess
                });
            }

            function onSearchSuccess(results) {
                if (!ctrl.results) ctrl.results = [];
                pushNewResults(results);
                if (results.length == count) searchForMoreLock = false;
            }

            function pushNewResults(results) {
                results.forEach(pushNewItemIfUnique);
            }

            function pushNewItemIfUnique(item) {
                var isUnique = true;
                ctrl.results.forEach(function (r) {
                    if (r.id == item.id) isUnique = false;
                });
                if (isUnique) ctrl.results.push(item);
            }
        }];
    }

    function BlockComponent() {
        this.templateUrl = 'bin-block.html';

        this.require = {
            blocksCtrl: '^^binBlocks'
        };

        this.bindings = {
            block: '=?',
            src: '=?'
        };

        this.controllerAs = 'ctrl';

        this.controller = function () {
            var ctrl = this;
            ctrl.src = ctrl.src || ctrl.block;

            ctrl.$onInit = function () {
                ctrl.templateUrl = 'partials/blocks' +  ctrl.blocksCtrl.partition + 'block.html';

                ctrl.isEditing = ctrl.blocksCtrl.isEditing;

                ctrl.blockRemoved = function () {
                    ctrl.blocksCtrl.blockRemoved(ctrl.src);
                }
            }
        }
    }
})();
