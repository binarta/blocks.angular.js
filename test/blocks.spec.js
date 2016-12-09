describe('bin.blocks module', function () {

    beforeEach(module('bin.blocks'));

    var $componentController, $timeout, search, searchArgs, topics, editModeRenderer, updateCatalogItem;

    beforeEach(inject(function (_$componentController_, _$timeout_, binartaSearch, topicRegistry, _editModeRenderer_,
                                _updateCatalogItem_) {
        $componentController = _$componentController_;
        $timeout = _$timeout_;
        search = binartaSearch;
        topics = topicRegistry;
        editModeRenderer = _editModeRenderer_;
        updateCatalogItem = _updateCatalogItem_;

        searchArgs = {
            action: 'search',
            entity: 'catalog-item',
            filters: {},
            sortings: [{
                on: 'priority',
                orientation: 'desc'
            }],
            subset: {},
            success: jasmine.any(Function)
        };
    }));

    describe('binBlocks component', function () {
        var ctrl, partition, type, results;

        beforeEach(function () {
            partition = '/partition/';
            type = 'type';
            results = [
                {id: 1}
            ]
        });

        describe('with partition, type and count', function () {
            beforeEach(function () {
                searchArgs.filters.type = type;
                searchArgs.filters.partition = partition;
                searchArgs.subset.count = 1;
                searchArgs.subset.offset = 0;
                ctrl = $componentController('binBlocks', null, {partition: partition, type: type, count: 1});
            });

            it('templateUrl is available', function () {
                expect(ctrl.templateUrl).toEqual('partials/blocks' + partition + 'blocks.html');
            });

            it('search is executed', function () {
                expect(search).toHaveBeenCalledWith(searchArgs);
            });

            describe('on search success', function () {
                beforeEach(function () {
                    search.calls.mostRecent().args[0].success(results);
                });

                it('results are available', function () {
                    expect(ctrl.results).toEqual(results);
                });

                it('is allowed to add more items', function () {
                    expect(ctrl.isAddNewItemAllowed()).toBeTruthy();
                });

                it('is allowed to remove an item', function () {
                    expect(ctrl.isRemoveItemAllowed()).toBeTruthy();
                });

                describe('on search for more', function () {
                    beforeEach(function () {
                        ctrl.searchForMore();
                    });

                    it('search is executed', function () {
                        searchArgs.subset.offset = 1;
                        expect(search.calls.mostRecent().args[0].subset).toEqual({
                            count: 1,
                            offset: 1
                        });
                    });

                    describe('on seach success', function () {
                        beforeEach(function () {
                            search.calls.mostRecent().args[0].success([{id: 2}]);
                        });

                        it('new results are added to result-set', function () {
                            expect(ctrl.results).toEqual([{id: 1}, {id:2}]);
                        });

                        describe('calling search for more again after search success', function () {
                            beforeEach(function () {
                                search.calls.reset();
                                ctrl.searchForMore();
                            });

                            it('search is triggered again', function () {
                                expect(search.calls.mostRecent().args[0].subset).toEqual({
                                    count: 1,
                                    offset: 2
                                });
                            });

                            describe('on success with no more results', function () {
                                beforeEach(function () {
                                    search.calls.mostRecent().args[0].success([]);
                                });

                                describe('and calling search for more again', function () {
                                    beforeEach(function () {
                                        search.calls.reset();
                                        ctrl.searchForMore();
                                    });

                                    it('search is not triggered again', function () {
                                        expect(search).not.toHaveBeenCalled();
                                    });
                                });
                            });
                        });
                    });

                    describe('on search success with duplicates', function () {
                        beforeEach(function () {
                            search.calls.mostRecent().args[0].success([{id: 1}, {id: 2}]);
                        });

                        it('new results are added to result-set and duplicated are ignored', function () {
                            expect(ctrl.results).toEqual([{id: 1}, {id:2}]);
                        });
                    });
                });

                describe('triggering search for more multiple times', function () {
                    beforeEach(function () {
                        search.calls.reset();
                        ctrl.searchForMore();
                        ctrl.searchForMore();
                        ctrl.searchForMore();
                    });

                    it('search is only triggered once', function () {
                        expect(search.calls.count()).toEqual(1);
                    });
                });

                describe('on add block', function () {
                    var block = {id: 'add'};
                    var submitSpy;

                    beforeEach(function () {
                        submitSpy = jasmine.createSpy('spy');

                        ctrl.addBlock({
                            item: block,
                            submit: submitSpy
                        });
                    });

                    it('defaultName is set on item', function () {
                        expect(block.defaultName).toEqual('block');
                    });

                    it('submit handler is called', function () {
                        expect(submitSpy).toHaveBeenCalled();
                    });

                    describe('on block added', function () {
                        beforeEach(function () {
                            ctrl.blockAdded(block);
                        });

                        it('set css class on block', function () {
                            expect(block.cssClass).toEqual('added');
                        });

                        it('new block is added to results', function () {
                            expect(ctrl.results[0]).toEqual(block);
                        });

                        describe('after 300ms', function () {
                            beforeEach(function () {
                                $timeout.flush(300);
                            });

                            it('css class on block is removed', function () {
                                expect(block.cssClass).toBeUndefined();
                            });
                        });
                    });
                });

                describe('on block removed', function () {
                    var block;

                    beforeEach(function () {
                        block = results[0];
                        ctrl.blockRemoved(block);
                    });

                    it('set css class on block', function () {
                        expect(block.cssClass).toEqual('removed');
                    });

                    describe('after 300ms', function () {
                        beforeEach(function () {
                            $timeout.flush(300);
                        });

                        it('block is removed from results', function () {
                            expect(ctrl.results).toEqual([]);
                        });
                    });
                });
            });

            describe('search for more before success', function () {
                beforeEach(function () {
                    search.calls.reset();
                    ctrl.searchForMore();
                });

                it('does not execute search', function () {
                    expect(search).not.toHaveBeenCalled();
                });
            });

            it('listens on edit.mode event', function () {
                expect(topics.subscribe).toHaveBeenCalledWith('edit.mode', jasmine.any(Function));
            });

            it('on edit.mode', function () {
                topics.subscribe.calls.mostRecent().args[1](true);
                expect(ctrl.isEditing()).toBeTruthy();
                topics.subscribe.calls.mostRecent().args[1](false);
                expect(ctrl.isEditing()).toBeFalsy();
            });

            describe('on destroy', function () {
                beforeEach(function () {
                    ctrl.$onDestroy();
                });

                it('unsubscribe from edit.mode event', function () {
                    var listener = topics.subscribe.calls.mostRecent().args[1];
                    expect(topics.unsubscribe).toHaveBeenCalledWith('edit.mode', listener);
                });
            });
        });

        describe('with max', function () {
            beforeEach(function () {
                searchArgs.filters.type = type;
                searchArgs.filters.partition = partition;
                searchArgs.subset.count = 1;
                searchArgs.subset.offset = 0;
                ctrl = $componentController('binBlocks', null, {partition: partition, type: type, count: 1, max: 1});
                search.calls.mostRecent().args[0].success(results);
            });

            it('not allowed to add more items', function () {
                expect(ctrl.isAddNewItemAllowed()).toBeFalsy();
            });

            describe('on add block', function () {
                var block = {id: 'add'};
                var submitSpy;

                beforeEach(function () {
                    submitSpy = jasmine.createSpy('spy');

                    ctrl.addBlock({
                        item: block,
                        submit: submitSpy
                    });
                });

                it('submit handler is called', function () {
                    expect(submitSpy).not.toHaveBeenCalled();
                });
            });
        });

        describe('with min', function () {
            beforeEach(function () {
                searchArgs.filters.type = type;
                searchArgs.filters.partition = partition;
                searchArgs.subset.count = 1;
                searchArgs.subset.offset = 0;
                ctrl = $componentController('binBlocks', null, {partition: partition, type: type, count: 1, min: 1});
                search.calls.mostRecent().args[0].success(results);
            });

            it('not allowed to remove an item', function () {
                expect(ctrl.isRemoveItemAllowed()).toBeFalsy();
            });
        });

        describe('with partition and type', function () {
            beforeEach(function () {
                searchArgs.filters.type = type;
                searchArgs.filters.partition = partition;
                searchArgs.subset.count = 100;
                searchArgs.subset.offset = 0;
                ctrl = $componentController('binBlocks', null, {partition: partition, type: type});
            });

            it('search is executed', function () {
                expect(search).toHaveBeenCalledWith(searchArgs);
            });
        });

        describe('with partition', function () {
            beforeEach(function () {
                searchArgs.filters.type = 'uiBlocks';
                searchArgs.filters.partition = partition;
                searchArgs.subset.count = 100;
                searchArgs.subset.offset = 0;
                ctrl = $componentController('binBlocks', null, {partition: partition});
            });

            it('search is executed', function () {
                expect(search).toHaveBeenCalledWith(searchArgs);
            });
        });
    });

    describe('binBlock component', function () {
        var ctrl, src, partition, blocksCtrl, blockRemovedSpy, editingSpy;

        beforeEach(function () {
            src = {id: 1, type: 'type', link: 'link', linkTarget: '_blank'};
            partition = '/partition/';
            blockRemovedSpy = jasmine.createSpy('spy');
            editingSpy = jasmine.createSpy('spy').and.returnValue(true);
            blocksCtrl = {
                partition: partition,
                blockRemoved: blockRemovedSpy,
                isEditing: editingSpy
            };
        });

        describe('when block is given', function () {
            beforeEach(function () {
                ctrl = $componentController('binBlock', null, {block: src});
            });

            it('src is available', function () {
                expect(ctrl.src).toEqual(src);
            });
        });

        describe('when src is given', function () {
            beforeEach(function () {
                ctrl = $componentController('binBlock', null, {src: src});
            });

            it('src is available', function () {
                expect(ctrl.src).toEqual(src);
            });

            describe('on init', function () {
                beforeEach(function () {
                    ctrl.blocksCtrl = blocksCtrl;
                    ctrl.$onInit();
                });

                it('templateUrl is available', function () {
                    expect(ctrl.templateUrl).toEqual('partials/blocks' + partition + 'block.html');
                });

                it('edit is passed through', function () {
                    expect(ctrl.isEditing()).toBeTruthy();
                });

                it('not linkable', function () {
                    expect(ctrl.isLinkable()).toBeFalsy();
                });

                describe('on block removed', function () {
                    beforeEach(function () {
                        ctrl.blockRemoved();
                    });

                    it('block removed on parent is called', function () {
                        expect(blockRemovedSpy).toHaveBeenCalledWith(src);
                    });
                });
            });
        });

        describe('when block is linkable', function () {
            beforeEach(function () {
                ctrl = $componentController('binBlock', null, {src: src, linkable: 'true'});
            });

            describe('on init', function () {
                beforeEach(function () {
                    ctrl.blocksCtrl = blocksCtrl;
                    ctrl.$onInit();
                });

                it('is linkable', function () {
                    expect(ctrl.isLinkable()).toBeTruthy();
                });

                describe('on update link', function () {
                    beforeEach(function () {
                        ctrl.updateLink();
                    });

                    it('edit mode renderer is opened', function () {
                        expect(editModeRenderer.open).toHaveBeenCalledWith({
                            templateUrl: 'bin-blocks-edit-link.html',
                            scope: jasmine.any(Object)
                        });
                    });

                    describe('with renderer scope', function () {
                        var scope;

                        beforeEach(function () {
                            scope = editModeRenderer.open.calls.mostRecent().args[0].scope;
                        });

                        it('previous link is available', function () {
                            expect(scope.link).toEqual(src.link);
                            expect(scope.target).toEqual(true);
                        });

                        describe('on submit', function () {
                            beforeEach(function () {
                                scope.link = 'updated';
                                scope.submit();
                            });

                            it('is working', function () {
                                expect(scope.working).toBeTruthy();
                            });

                            it('item is updated', function () {
                                expect(updateCatalogItem).toHaveBeenCalledWith({
                                    data: {
                                        context: 'update',
                                        id: src.id,
                                        type: src.type,
                                        link: scope.link,
                                        linkTarget: '_blank'
                                    },
                                    success: jasmine.any(Function),
                                    error: jasmine.any(Function)
                                });
                            });

                            describe('on update success', function () {
                                beforeEach(function () {
                                    updateCatalogItem.calls.mostRecent().args[0].success();
                                });

                                it('renderer is closed', function () {
                                    expect(editModeRenderer.close).toHaveBeenCalled();
                                });

                                it('src is updated with link', function () {
                                    expect(src.link).toEqual(scope.link);
                                    expect(src.linkTarget).toEqual('_blank');
                                });
                            });

                            describe('on update error', function () {
                                beforeEach(function () {
                                    updateCatalogItem.calls.mostRecent().args[0].error();
                                });

                                it('is not working', function () {
                                    expect(scope.working).toBeFalsy();
                                });

                                it('show violation', function () {
                                    expect(scope.violation).toEqual(true)
                                });
                            });

                            describe('and link should not open in a new tab', function () {
                                beforeEach(function () {
                                    scope.target = false;
                                    scope.submit();
                                });

                                it('item is updated', function () {
                                    expect(updateCatalogItem).toHaveBeenCalledWith({
                                        data: {
                                            context: 'update',
                                            id: src.id,
                                            type: src.type,
                                            link: scope.link,
                                            linkTarget: ''
                                        },
                                        success: jasmine.any(Function),
                                        error: jasmine.any(Function)
                                    });
                                });

                                describe('on update success', function () {
                                    beforeEach(function () {
                                        updateCatalogItem.calls.mostRecent().args[0].success();
                                    });

                                    it('src is updated with link', function () {
                                        expect(src.link).toEqual(scope.link);
                                        expect(src.linkTarget).toEqual('');
                                    });
                                });
                            });
                        });

                        it('on cancel', function () {
                            scope.cancel();
                            expect(editModeRenderer.close).toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });
});
