﻿(function () {
    class PushEntryController {
        constructor(type, options, close, $element, $http, apiEndpoint, notification) {
            $.extend(this, {
                type,
                close,
                $element,
                $http,
                apiEndpoint,
                notification,
            });
            this.vm = {
                link: options.link,
            };
            this.files = {};
            this.formHeight = 73;
            this.expand = false;
            this.title = '推送新条目';

            switch (type) {
                case 'slideShow':
                    this.subTitle = '入口 - 广场 - 四格幻灯片';
                    this.captureUrl = 'entrance/discovery/slideshow-entries';
                    this.postUrl = 'slideshow-entry';
                    this.dataType = 'body';
                    this.inputList = [
                        {
                            element: 'textArea',
                            type: 'text',
                            style: 'long',
                            model: 'title',
                            label: '主标题',
                            tip: '概括核心思想，避免包含写作对象，如「这个世界需要暴白和英雄」',
                        },
                        {
                            element: 'textArea',
                            type: 'text',
                            style: 'long',
                            model: 'subtitle',
                            label: '副标题',
                            tip: '直接说明文章本质和写作对象，如「《守望先锋》首测印象」',
                        },
                        {
                            element: 'textArea',
                            type: 'text',
                            style: 'short',
                            model: 'author',
                            label: '作者',
                        },
                        {
                            element: 'textArea',
                            type: 'text',
                            style: 'short',
                            model: 'date',
                            label: '日期',
                            tip: '推荐使用「m月d日」的格式',
                        },
                        {
                            element: 'textArea',
                            type: 'text',
                            style: 'short',
                            model: 'minorTitle',
                            label: '滑卡标题',
                            tip: '一般为写作对象的中文名',
                        },
                        {
                            element: 'textArea',
                            type: 'text',
                            style: 'short',
                            model: 'minorSubtitle',
                            label: '滑卡副标题',
                            tip: '一般为写作对象的外文名',
                        },
                        {
                            element: 'uploadImage',
                            style: 'long',
                            model: 'backgroundImage',
                            label: '封面图片',
                        },
                    ];
                    break;
                case 'spotlightPoint':
                    this.subTitle = '入口 - 广场 - 六格滚轴';
                    this.postUrl = 'spotlight-point';
                    this.dataType = 'query';
                    this.inputList = [
                        {
                            element: 'textArea',
                            type: 'uic',
                            style: 'short',
                            model: 'pointIdCode',
                            label: '据点识别码',
                        },
                    ];
                    this.formHeight = 'auto';
                    this.expand = true;
                    break;
                case 'outpostPoint':
                    this.subTitle = '入口 - 据点 - 哨所';
                    this.postUrl = 'outpost-point';
                    this.dataType = 'query';
                    this.inputList = [
                        {
                            element: 'textArea',
                            type: 'uic',
                            style: 'short',
                            model: 'pointIdCode',
                            label: '据点识别码',
                        },
                    ];
                    this.formHeight = 'auto';
                    this.expand = true;
                    break;
                case 'spotlightArticle':
                    switch (options.articleType) {
                        case 'Review':
                            this.subTitle = '入口 - 广场 - 评';
                            break;
                        case 'Study':
                            this.subTitle = '入口 - 广场 - 研';
                            break;
                        case 'Story':
                            this.subTitle = '入口 - 广场 - 谈';
                            break;
                    }
                    this.captureUrl = 'entrance/discovery/spotlight-reviews';
                    this.captureOnlyArticle = true;
                    this.postUrl = 'spotlight-article';
                    this.dataType = 'body';
                    this.params = {
                        category: options.articleType,
                    };
                    this.inputList = [
                        {
                            element: 'textArea',
                            type: 'text',
                            style: 'long',
                            model: 'title',
                            label: '主标题',
                            tip: '一旦手动编辑，推送条目将不会和原文自动同步',
                        },
                        {
                            element: 'textArea',
                            type: 'text',
                            style: 'long',
                            model: 'subtitle',
                            label: '副标题',
                            tip: '一旦手动编辑，推送条目将不会和原文自动同步',
                        },
                        {
                            element: 'textArea',
                            type: 'uic',
                            style: 'short',
                            model: 'authorIdCode',
                            label: '作者识别码',
                            disabled: true,
                        },
                        {
                            element: 'textArea',
                            type: 'uic',
                            style: 'short',
                            model: 'pointIdCode',
                            label: '据点识别码',
                            disabled: true,
                        },
                    ];
                    break;
            }

            if (options.item) {
                $.extend(this.vm, options.item);
                if (type === 'spotlightArticle') {
                    this.vm.articleId = this.vm.id;
                    delete this.vm.id;

                    this.vm.link = `https://www.keylol.com/article/${this.vm.authorIdCode}/${this.vm.sidForAuthor}`;
                }

                this.title = '调整内容';
                this.formHeight = 'auto';
                this.expand = true;
            }
        }

        capture () {
            if (this.vm.link && !this.expand && !this.captureLock) {
                this.captureLock = true;
                this.$http.get(`${this.apiEndpoint}states/${this.captureUrl}/reference/?link=${this.vm.link}`).then(response => {
                    $.extend(this.vm, response.data);
                    if (this.type === 'spotlightArticle') {
                        this.vm.articleId = this.vm.id;
                        delete this.vm.id;
                    }
                    this.expand = true;
                    let detailHeight = 0;
                    const $detail = this.$element.find('form .info-detail');
                    if ($detail) {
                        detailHeight = $detail.height();
                    }
                    this.formHeight += detailHeight;
                    this.captureLock = false;
                }, response => {
                    this.notification.error({ message: '发生未知错误，请重试或与站务职员联系' }, response);
                    this.captureLock = false;
                });
            }
        }

        uploadImage ($file, $event, item) {
            if ($file) {
                item.showUploadPreview({
                    templateUrl: 'src/popup/upload-preview.html',
                    controller: 'UploadPreviewController as uploadPreview',
                    attachSide: 'left',
                    event: {
                        type: 'click',
                        currentTarget: $event.currentTarget,
                    },
                    align: 'top',
                    offsetX: 60,
                    offsetY: -25,
                    inputs: {
                        file: $file,
                        options: {
                            type: 'cover',
                        },
                    },
                }).then(popup => {
                    return popup.close;
                }).then(result => {
                    if (result) {
                        if (this.type === 'slideShow') {
                            this.vm.backgroundImage = result;
                        }
                    }
                });
            }
        }

        submit () {
            if (this.type === 'slideShow' && !this.vm.backgroundImage) {
                this.notification.error({ message: '四格幻灯片必须上传背景图' });
                return;
            }

            if (this.dataType === 'query') {
                this.$http.post(`${this.apiEndpoint}feed/${this.postUrl}`, {}, {
                    params: this.vm,
                }).then(response => {
                    this.notification.success({ message: '推送成功' });
                    this.close();
                }, error => {
                    this.notification.error({ message: '推送失败，请重试' }, error);
                });
            } else {
                if (this.vm.feedId) {
                    this.$http.put(`${this.apiEndpoint}feed/${this.postUrl}/${this.vm.feedId}`, this.vm, {
                        params: this.params,
                    }).then(response => {
                        this.notification.success({ message: '推送成功' });
                        this.close(this.vm);
                    }, error => {
                        this.notification.error({ message: '推送失败，请重试' }, error);
                    });
                } else {
                    this.$http.post(`${this.apiEndpoint}feed/${this.postUrl}`, this.vm, {
                        params: this.params,
                    }).then(response => {
                        this.notification.success({ message: '推送成功' });
                        this.close();
                    }, error => {
                        this.notification.error({ message: '推送失败，请重试' }, error);
                    });
                }
            }
        }
    }

    keylolApp.controller('PushEntryController', PushEntryController);
}());
