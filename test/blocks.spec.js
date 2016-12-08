describe('bin.blocks module', function () {

    beforeEach(module('bin.blocks'));

    var $componentController, $timeout, search, searchArgs, topics;

    beforeEach(inject(function (_$componentController_, _$timeout_, binartaSearch, topicRegistry) {
        $componentController = _$componentController_;
        $timeout = _$timeout_;
        search = binartaSearch;
        topics = topicRegistry;

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
            src = {id: 1};
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
    });
});
