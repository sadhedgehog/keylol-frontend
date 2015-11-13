﻿(function () {
    "use strict";

    keylolApp.controller("LatestArticlesController", [
        "$scope", "$http", "apiEndpoint", "union",
        function ($scope, $http, apiEndpoint, union) {
            $scope.articles = union.$localStorage.latestArticles;
            $http.get(apiEndpoint + "article/latest").then(function (response) {
                union.$localStorage.latestArticles = $scope.articles = response.data;
            });
        }
    ]);
})();