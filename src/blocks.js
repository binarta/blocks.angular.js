(function () {
    angular.module('bin.blocks', ['bin.blocks.templates', 'catalog', 'binarta.search', 'notifications', 'toggle.edit.mode', 'bin.edit'])
        .component('binBlocks', new BlocksComponent())
        .component('binBlock', new BlockComponent());

    function BlocksComponent() {
        this.templateUrl = 'bin-blocks.html';

        this.bindings = {
            partition: '@',
            type: '@',
            count: '@',
            max: '@',
            min: '@'
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

            ctrl.isAddNewItemAllowed = function () {
                if (!ctrl.results) return false;
                return !ctrl.max || ctrl.results.length < ctrl.max;
            };

            ctrl.isRemoveItemAllowed = function () {
                if (!ctrl.results) return false;
                return !ctrl.min || ctrl.results.length > ctrl.min;
            };

            ctrl.blockRemoved = function (block) {
                block.cssClass = 'removed';
                $timeout(function () {
                    ctrl.results.splice(ctrl.results.indexOf(block), 1);
                }, delay);
            };

            ctrl.addBlock = function (args) {
                if (ctrl.isAddNewItemAllowed()) {
                    args.item.defaultName = 'block';
                    args.submit();
                }
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
            src: '=?',
            linkable: '@'
        };

        this.controllerAs = 'ctrl';

        this.controller = ['$scope', 'editModeRenderer', 'updateCatalogItem', function ($scope, editModeRenderer, update) {
            var ctrl = this;
            ctrl.src = ctrl.src || ctrl.block;

            ctrl.$onInit = function () {
                ctrl.templateUrl = 'partials/blocks' +  ctrl.blocksCtrl.partition + 'block.html';
                ctrl.isEditing = ctrl.blocksCtrl.isEditing;
                ctrl.isRemoveItemAllowed = ctrl.blocksCtrl.isRemoveItemAllowed;

                ctrl.isLinkable = function () {
                    return ctrl.linkable == 'true';
                };

                ctrl.updateLink = function () {
                    if (ctrl.isLinkable()) {
                        var scope = $scope.$new();
                        scope.link = ctrl.src.link;
                        scope.cancel = editModeRenderer.close;

                        scope.submit = function () {
                            scope.violation = false;
                            scope.working = true;
                            update({
                                data: {
                                    context: 'update',
                                    id: ctrl.src.id,
                                    type: ctrl.src.type,
                                    link: scope.link
                                },
                                success: onSuccess,
                                error: onError
                            });

                            function onSuccess() {
                                ctrl.src.link = scope.link;
                                editModeRenderer.close();
                            }

                            function onError() {
                                scope.violation = true;
                                scope.working = false;
                            }
                        };

                        editModeRenderer.open({
                            templateUrl: 'bin-blocks-edit-link.html',
                            scope: scope
                        });
                    }
                };

                ctrl.blockRemoved = function () {
                    ctrl.blocksCtrl.blockRemoved(ctrl.src);
                }
            }
        }];
    }
})();
