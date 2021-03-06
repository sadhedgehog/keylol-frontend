
(function () {
    class pointMenuController {
        constructor($scope, $window, $timeout, stores) {
            const arr = [
                this.object.oneStarCount,
                this.object.twoStarCount,
                this.object.threeStarCount,
                this.object.fourStarCount,
                this.object.fiveStarCount,
            ];

            let total = 0;
            for (let i = 0;i !== arr.length; i++) {
                total += arr[i];
            }

            if (this.object.type === 'game' || this.object.type === 'hardware') {
                this.specialMenu = {
                    header: {
                        type: 'point',
                        voteStats: {
                            '1': arr[0],
                            '2': arr[1],
                            '3': arr[2],
                            '4': arr[3],
                            '5': arr[4],
                        },
                        rating: this.rating,
                        totalEvaluate: total,
                        votePercent: this.object.averageRating,
                        titleCoverImage: this.object.titleCoverImage,
                        keylolAveragePlayedTime: this.object.keylolAveragePlayedTime,
                        totalPlayedTime: this.object.totalPlayedTime,
                        idCode: this.object.idCode,
                        inArticle: this.inArticle,
                    },
                    items: [],
                };

                if (this.object.steamAppId) {
                    const steamItem = {
                        type: 'item',
                        icon: 'dtb-steam',
                        text: 'Steam',
                        discount: this.object.steamDiscountedPrice ? `${parseInt((this.object.steamPrice - this.object.steamDiscountedPrice) / this.object.steamPrice * 100)}%` : undefined,
                        link: `http://store.steampowered.com/app/${this.object.steamAppId}`,
                    };
                    if (this.object.steamPrice) {
                        steamItem.subText = `¥ ${this.object.steamPrice}`;
                    } else if (this.object.steamPrice === 0) {
                        steamItem.subText = '免费';
                    }

                    if (this.object.steamDiscountedPrice) {
                        steamItem.subText = `¥ ${this.object.steamDiscountedPrice}`;
                    }
                    this.specialMenu.items.push(steamItem);
                }

                if (this.object.sonkwoProductId) {
                    const sonkwoItem = {
                        type: 'item',
                        icon: 'dtb-sonkwo',
                        text: '杉果',
                        link: `https://www.sonkwo.com/products/${this.object.sonkwoProductId}`,
                    };
                    if (this.object.sonkwoPrice) {
                        sonkwoItem.subText = `¥ ${this.object.sonkwoPrice}`;
                    } else if (this.object.sonkwoPrice === 0) {
                        sonkwoItem.subText = '免费';
                    }
                    this.specialMenu.items.push(sonkwoItem);
                }

                for (let i = 2;i !== stores.length; i++) {
                    if (this.object[`${stores[i].prefix}Link`] && this.object[`${stores[i].prefix}Link`] !== '') {
                        this.specialMenu.items.push({
                            type: 'item',
                            icon: stores[i].icon,
                            text: stores[i].name,
                            link: this.object[`${stores[i].prefix}Link`],
                            subText: this.object[`${stores[i].prefix}Price`],
                        });
                    }
                }
            } else {
                let gameCount = '';
                switch (this.object.type) {
                    case 'category': 
                        gameCount = `此类共 ${this.object.productCount} 部作品`;
                        break;
                    case 'platform':
                        gameCount = `平台上共 ${this.object.productCount} 部作品`;
                        break;
                    case 'vendor':
                        gameCount = `旗下共 ${this.object.productCount} 部作品`;
                        break;
                }

                this.specialMenu = {
                    header: {
                        type: 'point-other',
                        gameCount,
                        votePercent: this.object.averageRating !== undefined ? this.object.averageRating.toFixed(1) : undefined,
                        titleCoverImage: this.object.titleCoverImage,
                        idCode: this.object.idCode,
                        inArticle: this.inArticle,
                    },
                };
            }

            // 没有封面时的替代
            if (!this.specialMenu.header.titleCoverImage) {
                this.specialMenu.header.point = {
                    avatarImage: this.object.avatarImage,
                    chineseName: this.object.chineseName,
                    englishName: this.object.englishName,
                };
            }
        }
    }

    keylolApp.component('pointMenu', {
        templateUrl: 'src/sections/point-menu.html',
        controller: pointMenuController,
        controllerAs: 'pointMenu',
        bindings: {
            theme: '<',
            object: '<',
            rating: '<',
            inArticle: '<',
        },
    });
}());
