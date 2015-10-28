(function () {
    "use strict";

    keylolApp.directive("pagination", [
        "$location",
        function ($location) {
            return {
                restrict: "E",
                templateUrl: "components/directives/pagination.html",
                scope: {
                    total: "=",
                    current: "=",
                    onPageChanged: "&",
                    pageHref: "&"
                },
                link: function (scope) {
                    scope.$watchGroup(["current", "total"], function () {
                        console.log(scope.total, scope.current);
                        scope.newPage = scope.current;
                        scope.hasLeftEllipsis = scope.current > 4;
                        scope.hasRightEllipsis = scope.total - scope.current > 4;

                        scope.leftPages = [];
                        if (!scope.hasLeftEllipsis) {
                            for (var i = 1; i < scope.current; i++) {
                                scope.leftPages.push(i);
                            }
                        } else {
                            scope.leftPages.push(scope.current - 1);
                        }

                        scope.rightPages = [];
                        if (!scope.hasRightEllipsis) {
                            for (var j = scope.current + 1; j <= scope.total; j++) {
                                scope.rightPages.push(j);
                            }
                        } else {
                            scope.rightPages.push(scope.current + 1);
                            scope.rightPages.push(scope.current + 2);
                        }
                    });

                    scope.changePage = function (newPage) {
                        scope.onPageChanged({oldPage: scope.current, newPage: newPage});
                    };

                    scope.submit = function () {
                        if (scope.newPage == scope.current) {
                            return;
                        }
                        var newPageHref = scope.pageHref(scope.newPage);
                        if (newPageHref) {
                            $location.url(newPageHref);
                        } else {
                            scope.changePage(parseInt(scope.newPage));
                        }
                    };
                }
            };
        }
    ]);
})();