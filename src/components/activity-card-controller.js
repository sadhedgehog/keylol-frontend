﻿(function () {
    class ActivityCardController {
        constructor(utils, $http, notification, stateTree) {
            $.extend(this,{
                utils,
                $http,
                notification,
                stateTree,
            });
            this.relatedPoints = {
                mainPoint: this.object.pointBasicInfo,
                attachedPoints: this.object.attachedPoints,
            };

            this.vm = {
                content: '',
            };
            this.submitLock = false;

            this.commentsManager = {
                count: this.object.commentCount,
                currentPage: 1,
                pages: [],
                pageCount: parseInt((this.object.commentCount - 1) / 10) + 1,
            };
            this.commentsManager.pages[0] = this.object.comments;

            if (stateTree.currentUser &&
                (stateTree.currentUser.roles.indexOf('Operator') > -1 || stateTree.currentUser.id === this.object.authorBasicInfo.id)) {
                this.canModerate = true;
            }
        }

        showSourceList($event) {
            this.showSourceListPopup({
                templateUrl: 'src/popup/source-list.html',
                controller: 'SourceListController as sourceList',
                event: $event,
                attachSide: 'bottom',
                align: 'center',
                offsetX: 0,
                offsetY: 20,
                inputs: {
                  object: this.relatedPoints,
                },
            });
        }

        showMenu($event) {
            this.showSharedPopup({
                templateUrl: 'src/popup/timeline-card-menu.html',
                controller: 'TimelineCardMenuController as timelineCardMenu',
                event: $event,
                attachSide: 'right',
                align: 'top',
                offsetX: -220,
                offsetY: 0,
                inputs: {
                    origin: {
                        popup: this.showSharedPopup,
                        event: $event,
                    },
                    content: this.object,
                    options: {
                        inActivity: true,
                    },
                },
            });
        }
        
        submit() {
            this.submitLock = true;
            const submitObj = {
                content: this.vm.content,
                activityId: this.object.id,
            };

            this.$http.post(`${apiEndpoint}activity-comment`,submitObj).then(response => {
                this.notification.success('提交成功');
                this.vm.content = '';
                this.sync(response.data);
                this.submitLock = false;
            }, response => {
                this.notification.error('发生未知错误，请重试或与站务职员联系', response);
                this.submitLock = false;
            });
        }

        changePage (newPage, oldPage) {
            if (this.commentsManager.pages[newPage - 1]) {
                this.commentsManager.currentPage = newPage;
                return ;
            }

            if (!this.changePageLock) {
                this.changePageLock = true;
                this.$http.get(`${apiEndpoint}states/content/activity/comments`,{
                    params: {
                        activity_id: this.object.id,
                        page: newPage,
                    },
                }).then(response => {
                    this.commentsManager.currentPage = newPage;
                    this.commentsManager.pages[newPage - 1] = response.data;
                    this.changePageLock = false;
                }, response => {
                    this.changePageLock = false;
                });
            }
        }

        sync (sid) {
            this.commentsManager.pageCount = parseInt((sid - 1) / 10) + 1;
            this.commentsManager.currentPage = this.commentsManager.pageCount;
            console.log(this.commentsManager.pages.length);
            this.$http.get(`${apiEndpoint}states/content/activity/comments`,{
                params: {
                    activity_id: this.object.id,
                    page: this.commentsManager.currentPage,
                },
            }).then(response => {
                this.commentsManager.pages[this.commentsManager.currentPage - 1] = response.data;
                this.commentsManager.count = response.data.length + (this.commentsManager.currentPage - 1) * 10;
            }, response => {

            });
        }
    }

    keylolApp.component('activityCard', {
        templateUrl: 'src/components/activity-card.html',
        controller: ActivityCardController,
        controllerAs: 'activityCard',
        bindings: {
            object: '<',
            theme: '<',
        },
    });
}());
