angular.module("bin.blocks.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("bin-block.html","<div ng-switch=\"ctrl.isEditing()\"><div ng-switch-when=\"true\" class=\"bin-block\" ng-class=\"ctrl.src.cssClass\"><bin-edit is-editable=\"ctrl.isLinkable() || ctrl.isRemoveItemAllowed()\"><bin-edit-actions><bin-edit-action action=\"ctrl.updateLink()\" ng-if=\"ctrl.isLinkable()\"><span><i class=\"fa fa-link\"></i></span> <span i18n=\"\" code=\"blocks.link.button\" read-only=\"\" ng-bind=\"::var\"></span></bin-edit-action><bin-edit-actions-selector for=\"delete\" danger=\"\" ng-if=\"ctrl.isRemoveItemAllowed()\"><span><i class=\"fa fa-trash-o\"></i></span> <span i18n=\"\" code=\"blocks.remove.item.button\" read-only=\"\" ng-bind=\"::var\"></span></bin-edit-actions-selector></bin-edit-actions><bin-edit-actions for=\"delete\" button-i18n-code=\"blocks.remove.item.confirm\"><bin-edit-action action=\"ctrl.remove()\" disabled=\"working\" danger=\"\"><span ng-hide=\"ctrl.working\"><i class=\"fa fa-trash-o\"></i></span> <span ng-show=\"ctrl.working\"><i class=\"fa fa-spinner fa-spin\"></i></span> <span i18n=\"\" code=\"blocks.remove.item.button\" read-only=\"\" ng-bind=\"::var\"></span></bin-edit-action></bin-edit-actions><bin-edit-body><div ng-include=\"ctrl.templateUrl\"></div></bin-edit-body></bin-edit></div><div ng-switch-default=\"\"><div ng-include=\"ctrl.templateUrl\"></div></div></div>");
$templateCache.put("bin-blocks-edit-link.html","<form ng-submit=\"submit()\"><div class=\"bin-menu-edit-body\"><div class=\"alert alert-danger\" ng-show=\"violation\"><i class=\"fa fa-exclamation-triangle fa-fw\"></i> <span i18n=\"\" code=\"clerk.menu.try.again.message\" read-only=\"\" ng-bind=\"::var\"></span></div><div class=\"form-group\"><label for=\"input-link\" i18n=\"\" code=\"blocks.link.label\" read-only=\"\" ng-bind=\"::var\"></label> <input type=\"text\" id=\"input-link\" ng-model=\"link\" ng-disabled=\"working\" autofocus=\"\"></div><div class=\"form-group\"><div class=\"checkbox-switch\"><input type=\"checkbox\" id=\"link-target-switch\" ng-model=\"target\"> <label for=\"link-target-switch\"></label> <span i18n=\"\" code=\"i18n.menu.link.target.label\" read-only=\"\" ng-bind=\"var\"></span></div></div></div><div class=\"bin-menu-edit-actions\"><button type=\"submit\" class=\"btn btn-primary\" ng-disabled=\"working\" i18n=\"\" code=\"clerk.menu.save.button\" read-only=\"\"><span ng-show=\"working\"><i class=\"fa fa-spinner fa-spin fa-fw\"></i></span> <span ng-bind=\"::var\"></span></button> <button type=\"reset\" class=\"btn btn-default\" ng-click=\"cancel()\" ng-disabled=\"working\" i18n=\"\" code=\"clerk.menu.cancel.button\" read-only=\"\" ng-bind=\"::var\"></button></div></form>");
$templateCache.put("bin-blocks.html","<div ng-switch=\"ctrl.isEditing() && ctrl.isAddNewItemAllowed()\"><div ng-switch-when=\"true\" class=\"bin-blocks\"><div class=\"bin-blocks-actions\" ng-controller=\"AddToCatalogController\"><div class=\"row\"><div class=\"col-xs-12\"><button type=\"button\" class=\"bin-btn bin-btn-floated bin-btn-primary\" ng-init=\"init({partition:ctrl.partition, type: ctrl.type, locale:\'default\', success: ctrl.blockAdded})\" ng-click=\"ctrl.addBlock({item: item, submit: submit})\" i18n=\"\" code=\"blocks.add.item.button\" read-only=\"\" ng-bind=\"::var\"></button></div></div><bin-violations src=\"violations[\'partition\']\" fade-after=\"7000\" code-prefix=\"blocks.add.item\"></bin-violations></div><div ng-include=\"ctrl.templateUrl\"></div></div><div ng-switch-default=\"\"><div ng-include=\"ctrl.templateUrl\"></div></div></div>");}]);