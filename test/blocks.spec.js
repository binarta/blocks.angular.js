describe('bin.blocks', function () {

    beforeEach(module('bin.blocks'));

    describe('bin-blocks controller', function () {
        var $rootScope, $timeout, ctrl, config, search, topics, restClient;

        beforeEach(inject(function (_$rootScope_, $controller, _$timeout_, _config_, binartaSearch, topicRegistryMock, restServiceHandler) {
            $rootScope = _$rootScope_;
            $timeout = _$timeout_;
            config = _config_;
            search = binartaSearch;
            topics = topicRegistryMock;
            restClient = restServiceHandler;

            config.baseUri = 'base/';
            config.namespace = 'namespace';
            ctrl = $controller('binBlocksController', {$scope: {}}, {partition: 'partition', count: '10'});
        }));

        it('templateUrl is on ctrl', function () {
            expect(ctrl.templateUrl).toEqual('partials/blocks/partition-blocks.html');
        });

        it('search is triggered', function () {
            expect(search).toHaveBeenCalledWith({
                entity: 'catalog-item',
                action: 'findByPartition',
                locale: 'default',
                subset: {
                    count: '10',
                    offset: 0
                },
                filters: {
                    type: 'uiBlocks',
                    partition: 'partition'
                },
                sortings: [{
                    on: 'priority',
                    orientation: 'asc'
                }],
                success: jasmine.any(Function)
            });
        });

        describe('on search success', function () {
            var results = [{id: 'block1'}, {id: 'block2'}];

            beforeEach(function () {
                search.calls[0].args[0].success(results);
            });

            it('blocks are available', function () {
                expect(ctrl.blocks).toEqual(results);
            });
        });

        describe('when edit.mode notification is received', function () {
            beforeEach(function () {
                topics['edit.mode'](true);
            });

            it('edit is active', function () {
                expect(ctrl.edit).toBeTruthy();
            });

            it('disable edit mode', function () {
                topics['edit.mode'](false);

                expect(ctrl.edit).toBeFalsy();
            });
        });

        describe('on add new block', function () {
            var deferred;

            beforeEach(inject(function ($q) {
                deferred = $q.defer();
                restClient.andReturn(deferred.promise);

                ctrl.blocks = [{id: 'block1'}, {id: 'block2'}];
                ctrl.addBlock();
            }));

            it('perform rest call', function () {
                expect(restClient).toHaveBeenCalledWith({
                    scope: {},
                    params: {
                        method: 'PUT',
                        url: 'base/api/entity/catalog-item',
                        data: {
                            namespace: 'namespace',
                            locale: 'default',
                            type: 'uiBlocks',
                            partition: 'partition'
                        },
                        withCredentials: true
                    }
                });
            });

            describe('on success', function () {
                beforeEach(function () {
                    deferred.resolve({
                        data: {
                            id: 'newBlock'
                        }
                    });
                    $rootScope.$digest();
                });

                it('block is added', function () {
                    expect(ctrl.blocks).toEqual([{id: 'newBlock', cssClass: 'added'}, {id: 'block1'}, {id: 'block2'}]);
                });

                it('after some time', function () {
                    $timeout.flush();

                    expect(ctrl.blocks[0]).toEqual({id: 'newBlock'});
                });
            });
        });
    });

    describe('bin-block controller', function () {
        var $rootScope, $timeout, ctrl, config, restClient;
        var block = {
            id: 'blockId',
            partition: 'partition'
        };

        beforeEach(inject(function (_$rootScope_, $controller, _$timeout_, _config_, restServiceHandler) {
            $rootScope = _$rootScope_;
            $timeout = _$timeout_;
            config = _config_;
            restClient = restServiceHandler;

            config.baseUri = 'base/';
            ctrl = $controller('binBlockController', {$scope: {}}, {block: block});
            ctrl.blocks = [block];
        }));

        it('templateUrl is on ctrl', function () {
            expect(ctrl.templateUrl).toEqual('partials/blocks/partition-block.html');
        });

        describe('on remove', function () {
            var deferred;

            beforeEach(inject(function ($q) {
                deferred = $q.defer();
                restClient.andReturn(deferred.promise);

                ctrl.removeBlock();
            }));

            it('perform rest call', function () {
                expect(restClient).toHaveBeenCalledWith({
                    scope: {},
                    params: {
                        method: 'DELETE',
                        url: 'base/api/entity/catalog-item?id=blockId',
                        withCredentials: true
                    }
                });
            });

            it('apply css class', function () {
                expect(block.cssClass).toEqual('removed');
            });

            describe('after some time', function () {
                beforeEach(function () {
                    $timeout.flush();
                });

                it('remove from UI', function () {
                    expect(ctrl.blocks).toEqual([]);
                });

                describe('on remove failed', function () {
                    beforeEach(function () {
                        deferred.reject();
                        $rootScope.$digest();
                        $timeout.flush();
                    });

                    it('re-add removed block to UI', function () {
                        expect(ctrl.blocks).toEqual([{
                            id: 'blockId',
                            partition: 'partition',
                            cssClass: 'added'
                        }]);
                    });
                });
            });
        });
    });
});