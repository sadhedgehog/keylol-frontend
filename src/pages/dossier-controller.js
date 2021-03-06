﻿(function () {
    class DossierController {
        constructor($scope, pageHead, stateTree, $state, $location, pageLoad, $http, notification, $window, $element, apiEndpoint) {
            // $scope.changePage =  index => {
            //     $scope.currentPage = index;
            //     switch (index) {
            //         case 0:
            //             $scope.templist = null;
            //             $http.get(`${apiEndpoint}states/aggregation/user/dossier/selected-articles`,{
            //                 params: {
            //                     user_id: stateTree.aggregation.user.basicInfo.id,
            //                     page: 1,
            //                 },
            //             }).then(response => {
            //                 $scope.tempList = response.data;
            //             }, response => {
            //                 notification.error('发生未知错误，请重试或与站务职员联系',response);
            //             });
            //             break;
            //         case 1:
            //             $scope.templist = null;
            //             $http.get(`${apiEndpoint}states/aggregation/user/subscribed-points`,{
            //                 params: {
            //                     user_id: stateTree.aggregation.user.basicInfo.id,
            //                     page: 1,
            //                 },
            //             }).then(response => {
            //                 $scope.tempList = response.data;
            //             }, response => {
            //                 notification.error('发生未知错误，请重试或与站务职员联系',response);
            //             });
            //     }
            // };

            let fetchPromise;
            if (!$location.path().match(/\/user\/[^\/]*\/?$/)) {
                if (stateTree.empty || (stateTree.aggregation && stateTree.aggregation.user
                    && stateTree.aggregation.user.basicInfo && stateTree.aggregation.user.basicInfo.idCode === $state.params.user_id_code) ) {
                    fetchPromise = pageLoad('aggregation.user.dossier');
                } else {
                    fetchPromise = pageLoad('aggregation.user', { entrance: 'dossier' });
                }
                fetchPromise.then(() => {
                    pageHead.setTitle(`${stateTree.aggregation.user.basicInfo.userName} - 档案 - 其乐`);
                    $scope.theme = {
                        main: stateTree.aggregation.user.basicInfo.themeColor,
                        light: stateTree.aggregation.user.basicInfo.lightThemeColor,
                        logo: stateTree.aggregation.user.basicInfo.logo,
                    };
                    // $scope.tabArray = [
                    //     { name: `${stateTree.aggregation.user.dossier.articleCount} 篇文章` },
                    //     { name: `${stateTree.aggregation.user.dossier.subscribedPointCount} 个订阅据点` },
                    // ];

                    // $scope.articlePageCount = parseInt((stateTree.aggregation.user.dossier.articleCount - 1) / 10) + 1;
                    // $scope.subscribePageCount = parseInt((stateTree.aggregation.user.dossier.subscribePointCount - 1) / 10) + 1;
                });
            }

            $scope.stateTree = stateTree;


            const $$window = $($window);
            const scrollCallback = () => {
                const shouldWindowScrollTop = $$window.scrollTop() + 94;
                const windowHeight = $$window.height();
                const elementOffsetTop = $element.offset().top;
                const $elementHeight = $element.height();
                if (shouldWindowScrollTop + windowHeight > elementOffsetTop + $elementHeight) {
                    $scope.$apply(() => {
                        $http.get(`${apiEndpoint}states/aggregation/user/timeline`, {
                            params: $state.params,
                        }).then(response => {
                            stateTree.aggregation.user.timeline = response.data;
                        }, response => {
                            notification.error({ message: '发生未知错误，请重试或与站务职员联系' }, response);
                        });
                        $$window.unbind('scroll', scrollCallback);
                        cancelListenRoute();
                    });
                }
            };
            $$window.bind('scroll.loadTimeline', scrollCallback);

            const cancelListenRoute = $scope.$on('$destroy', () => {
                $$window.unbind('scroll', scrollCallback);
                cancelListenRoute();
            });
        }
    }

    keylolApp.controller('DossierController', DossierController);
}());
