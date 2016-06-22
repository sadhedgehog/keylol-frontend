﻿(function () {
    class TimelineCardController {
        constructor($element, $timeout, utils, stateTree) {
            $.extend(this,{
                $element,
                $timeout,
                utils,
                stateTree,
            });
            this.state = 'close';
            this.hasScroller = true;
            this.currentFloor = 0;

            $timeout(() => {
                this.simpleHeight = $element.find('.display-card>.shortcut>.simple>p').height();
                this.simpleHidden = this.simpleHeight > 100;
            });
        }

        simpleExpand() {
            this.simpleHidden = false;
        }

        moveToFloor(index) {
            if (this.currentFloor === index) {
                this.currentFloor = 0;
                this.$timeout(() => {
                    this.currentFloor = index;
                });
            } else {
                this.currentFloor = index;
            }

            if (this.hasScroller) {
                if (this.scrollAnimation !== undefined) {
                    this.scrollAnimation.stop();
                }
                const e = this.$element.find('.review-list');
                this.scrollAnimation = e.animate({ scrollTop: e.find(`[data-floor-id='#${index}']`).position().top }, 1000);
            }
        }

        openReviewArea() {
            this.state = 'open';
        }

        showSourceList($event) {
            this.showSharedPopup({
                templateUrl: 'src/popup/source-list.html',
                controller: 'SourceListController as sourceList',
                event: $event,
                attachSide: 'bottom',
                align: 'center',
                offsetX: 0,
                offsetY: 20,
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
                    options: {
                        link: `${this.card.contentType}/${this.card.author.idCode}/${this.card.sidForAuthor}`,
                    },
                    content: this.card,
                },
            });
        }
    }

    keylolApp.component('timelineCard', {
        templateUrl: 'src/components/timeline-card.html',
        controller: TimelineCardController,
        controllerAs: 'timelineCard',
        bindings: {
            card: '<',
        },
    });
}());
