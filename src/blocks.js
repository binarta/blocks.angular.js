(function () {
    angular.module('bin.blocks', ['config', 'bin.blocks.templates', 'angularx', 'catalog', 'binarta.search', 'notifications', 'toggle.edit.mode', 'bin.edit', 'rest.client'])
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

            this.$onInit = function () {
                this.type = this.type || 'uiBlocks';
                executeSearch();
            };

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
                        type: ctrl.type,
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

        this.controller = ['$scope', '$location', '$filter', 'config', 'editModeRenderer', 'updateCatalogItem', 'restServiceHandler', function ($scope, $location, $filter, config, editModeRenderer, updater, rest) {
            var ctrl = this, isRemoved;
            ctrl.src = ctrl.src || ctrl.block;

            ctrl.$onInit = function () {
                ctrl.templateUrl = 'partials/blocks' + ctrl.blocksCtrl.partition + 'block.html';
                ctrl.isEditing = ctrl.blocksCtrl.isEditing;
                ctrl.isRemoveItemAllowed = ctrl.blocksCtrl.isRemoveItemAllowed;

                ctrl.isLinkable = function () {
                    return ctrl.linkable == 'true';
                };

                ctrl.update = function (request, response) {
                    var data = {
                        context: 'update',
                        id: ctrl.src.id,
                        type: ctrl.src.type
                    };
                    data[request.key] = request.value;
                    update(data, {success: onSuccess, error: response.error});

                    function onSuccess() {
                        ctrl.src[request.key] = request.value;
                        response.success();
                    }
                };

                ctrl.remove = function () {
                    if (!ctrl.isRemoveItemAllowed() || isRemoved) return;
                    ctrl.working = true;
                    return rest({
                        params: {
                            method: 'DELETE',
                            withCredentials: true,
                            url: (config.baseUri || '') + 'api/entity/catalog-item?id=' + encodeURIComponent(ctrl.src.id)
                        }
                    }).then(function () {
                        isRemoved = true;
                        ctrl.blocksCtrl.blockRemoved(ctrl.src);
                    }).finally(function () {
                        ctrl.working = false;
                    });
                };

                ctrl.updateLink = function () {
                    if (!ctrl.isLinkable()) return;
                    var scope = $scope.$new();
                    scope.link = ctrl.src.link || 'http://';
                    scope.target = ctrl.src.linkTarget == '_blank';
                    scope.cancel = editModeRenderer.close;

                    scope.submit = function () {
                        scope.violation = false;
                        scope.working = true;
                        var target = scope.target ? '_blank' : '';
                        scope.link = $filter('binSanitizeUrl')(scope.link);

                        update({
                            context: 'update',
                            id: ctrl.src.id,
                            type: ctrl.src.type,
                            link: scope.link,
                            linkTarget: target
                        }, {
                            success: onSuccess,
                            error: onError
                        });

                        function onSuccess() {
                            ctrl.src.link = scope.link;
                            ctrl.src.linkTarget = target;
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
                };

                function update(request, response) {
                    updater({data: request, success: response.success, error: response.error, successNotification: false});
                }
            }
        }];
    }
})();
