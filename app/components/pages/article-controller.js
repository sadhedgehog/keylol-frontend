﻿(function () {
    "use strict";

    keylolApp.controller("ArticleController", [
        "pageTitle", "$scope", "$sce", "union", "$routeParams", "$http", "getAndFlushComments",
        function (pageTitle, $scope, $sce, union, $routeParams, $http, getAndFlushComments) {
            union.article = {};
            union.summary = {};
            union.pageElements = {};
            union.comments = [];
            union.hotComments = [];
            if ($routeParams.author && $routeParams.article) {
                $http.get(apiEndpoint + "article/" + $routeParams.author + "/" + $routeParams.article)
                    .then(function (response) {
                        var article = response.data;
                        pageTitle.set(article.Title + " - 其乐");
                        article.Content = $sce.trustAsHtml(article.Content);
                        for (var i in article.AttachedPoints) {
                            article.AttachedPoints[i].mainName = article.AttachedPoints[i][article.AttachedPoints[i].PreferedName + "Name"];
                        }
                        article.isMyArticle = (union.$localStorage.user.IdCode == article.AuthorIdCode);
                        if (article.Vote) {
                            switch (article.Vote) {
                                case "Positive":
                                    article.Vote = "好评";
                                    break;
                                case "Negative":
                                    article.Vote = "差评";
                                    break;
                            }
                        }
                        $.extend(union.article, article);

                        getAndFlushComments(article, null, "hot");
                        getAndFlushComments(article, 1, "page");
                        union.pageElements.changePage = function (oldPage, newPage) {
                            getAndFlushComments(article, newPage, "page");
                        };
                    }, function (error) {
                        alert("未知错误");
                        console.error(error);
                    });
                $http.get(apiEndpoint + "user/" + $routeParams.author, {
                    params: {
                        includeProfilePointBackgroundImage: true,
                        idType: "IdCode"
                    }
                }).then(function (response) {
                    var author = response.data;
                    var summary = {
                        actions: [],
                        head: {
                            mainHead: author.UserName,
                            subHead: author.GamerTag
                        },
                        avatar: author.AvatarImage,
                        background: author.ProfilePointBackgroundImage,
                        pointSum: {
                            type: "个人",
                            readerNum: 157,
                            articleNum: 48
                        }
                    };
                    $.extend(union.summary, summary);
                    if (author.IdCode != union.$localStorage.user.IdCode){
                        $http.get(apiEndpoint + "user-point-subscription", {
                            params: {
                                pointId: author.Id
                            }
                        }).then(function (response) {
                            if (response.data) {
                                union.summary.actions.push({
                                    text: "已订阅",
                                    extraClass: "subscribed"
                                });
                            } else {
                                summary.actions.push({
                                    text: "订阅",
                                    clickAction: function(){
                                        var that = this;
                                        $http.post(apiEndpoint + "user-point-subscription", {}, {
                                            params: {
                                                pointId: author.Id
                                            }
                                        }).then(function (response) {
                                            summary
                                        }, function (error) {
                                            alert("未知错误");
                                            console.error(error);
                                        });
                                    }
                                });
                            }
                        }, function (error) {
                            alert("未知错误");
                            console.error(error);
                        });
                    }
                }, function (error) {
                    alert("未知错误");
                    console.error(error);
                });
            }
            pageTitle.set("文章 - 其乐");
        }
    ]);
})();