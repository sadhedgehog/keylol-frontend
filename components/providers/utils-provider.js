﻿(function () {
    "use strict";

    keylolApp.provider("utils", function () {
        var _config = {};
        return {
            config: function (config) {
                if (config) {
                    _config = config;
                }
                return _config;
            },
            $get: [
                "$q", "union", "upyun",
                function ($q, union, upyun) {
                    function Utils() {
                        var self = this;
                        var uniqueId = 1;

                        self.supportWebp = $q(function (resolve, reject) {
                            var img = new Image();
                            img.onload = function () {
                                if (img.width > 0 && img.height > 0) {
                                    resolve();
                                } else {
                                    reject();
                                }
                            };
                            img.onerror = function () {
                                reject();
                            };
                            img.src = "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA"; // detect lossy webp
                        });

                        self.byteLength = function (str) {
                            var s = 0;
                            for (var i = str.length - 1; i >= 0; i--) {
                                var code = str.charCodeAt(i);
                                if (code <= 0xff) s++;
                                else if (code > 0xff && code <= 0xffff) s += 2;
                                if (code >= 0xDC00 && code <= 0xDFFF) {
                                    i--;
                                    s++;
                                } //trail surrogate
                            }
                            return s;
                        };

                        self.createGeetest = function (product, onSuccess) {
                            if (typeof window.activateGeetest === "undefined") {
                                window.activateGeetest = {};
                            }
                            var id = self.uniqueId();
                            var readyDeferred = $q.defer();
                            var successDeferred = $q.defer();
                            var refreshDefered;
                            activateGeetest[id] = function () {
                                var gee = new Geetest({
                                    gt: _config.geetestId,
                                    product: product,
                                    https: location.protocol === "https:"
                                });
                                gee.onSuccess(function () {
                                    successDeferred.resolve(gee);
                                    if (refreshDefered)
                                        refreshDefered.resolve(gee);
                                });
                                readyDeferred.resolve(gee);
                            };
                            if (typeof window.Geetest === "undefined") {
                                var s = document.createElement("script");
                                s.src = "//api.geetest.com/get.php?callback=activateGeetest[" + id + "]";
                                document.body.appendChild(s);
                            } else {
                                activateGeetest[id]();
                            }
                            return {
                                id: id,
                                ready: readyDeferred.promise,
                                success: successDeferred.promise,
                                refresh: function () {
                                    refreshDefered = $q.defer();
                                    readyDeferred.promise.then(function (gee) {
                                        gee.refresh();
                                    });
                                    return refreshDefered.promise;
                                }
                            };
                        };

                        self.uniqueId = function () {
                            return uniqueId++;
                        };

                        self.arrayUnique = function (arr) {
                            if (arr.length === 0) {
                                return arr;
                            }
                            arr.sort();
                            var re = [arr[0]];
                            for (var i = 1; i < arr.length; i++) {
                                if (arr[i] !== re[re.length - 1]) {
                                    re.push(arr[i]);
                                }
                            }
                            return re;
                        };

                        self.getPointType = function (type) {
                            if (type === "Game") {
                                return "游戏";
                            }
                            if (type === "Genre") {
                                return "类型";
                            }
                            if (type === "Manufacturer") {
                                return "厂商";
                            }
                            if (type === "Platform") {
                                return "平台";
                            }
                        };

                        self.getPointFirstName = function (point) {
                            return point[point.PreferredName + "Name"];
                        };

                        self.getPointSecondName = function (point) {
                            if (point.PreferredName === "Chinese")
                                return point.EnglishName;
                            else if (point.PreferredName === "English")
                                return point.ChineseName;
                        };

                        self.addRecentBroswe = function (type, name, idCode) {
                            if (!union.$localStorage.recentBrowse) {
                                union.$localStorage.recentBrowse = [];
                            }
                            var inHistoryIndex = -1;
                            for (var i in union.$localStorage.recentBrowse) {
                                if (union.$localStorage.recentBrowse[i].type === type) {
                                    if (union.$localStorage.recentBrowse[i].idCode === idCode) {
                                        inHistoryIndex = i;
                                    }
                                }
                            }
                            if (inHistoryIndex !== -1) {
                                union.$localStorage.recentBrowse.splice(inHistoryIndex, 1);
                            }
                            union.$localStorage.recentBrowse.unshift({
                                type: type,
                                idCode: idCode,
                                name: name
                            });
                            while (union.$localStorage.recentBrowse.length > 5) {
                                union.$localStorage.recentBrowse.pop();
                            }
                        };

                        self.modelValidate = {
                            steamBindingTokenId: function (str, errorObj, modelName) {
                                if (!str) {
                                    errorObj[modelName] = "SteamBindingTokenId cannot be empty.";
                                    return false;
                                }
                                return true;
                            },
                            idCode: function (str, errorObj, modelName) {
                                if (!/^[A-Z0-9]{5}$/.test(str)) {
                                    errorObj[modelName] = "Only 5 uppercase letters and digits are allowed in IdCode.";
                                    return false;
                                }
                                return true;
                            },
                            username: function (str, errorObj, modelName) {
                                var usernameLength = self.byteLength(str);
                                if (usernameLength < 3 || usernameLength > 16) {
                                    errorObj[modelName] = "UserName should be 3-16 bytes.";
                                    return false;
                                }
                                if (!/^[0-9A-Za-z\u4E00-\u9FCC]+$/.test(str)) {
                                    errorObj[modelName] = "Only digits, letters and Chinese characters are allowed in UserName.";
                                    return false;
                                }
                                return true;
                            },
                            password: function (str, errorObj, modelName) {
                                if (str.length < 6) {
                                    errorObj[modelName] = "Passwords must be at least 6 characters.";
                                    return false;
                                }
                                return true;
                            },
                            gamerTag: function (str, errorObj, modelName) {
                                if (self.byteLength(str) > 40) {
                                    errorObj[modelName] = "GamerTag should not be longer than 40 bytes.";
                                    return false;
                                }
                                return true;
                            }
                        };

                        self.modelErrorDetect = {
                            steamBindingTokenId: function (message) {
                                if (/cannot be empty/.test(message))
                                    return "empty";
                                return "unknown";
                            },
                            idCode: function (message) {
                                if (/Only.*allowed/.test(message))
                                    return "format";
                                else if (/already used/.test(message))
                                    return "used";
                                return "unknown";
                            },
                            username: function (message) {
                                if (/should.*bytes/.test(message))
                                    return "length";
                                else if (/Only.*allowed/.test(message))
                                    return "format";
                                else if (/already.*used/.test(message))
                                    return "used";
                                return "unknown";
                            },
                            password: function (message) {
                                if (/least.*characters/.test(message))
                                    return "length";
                                else if (/not correct/.test(message))
                                    return "incorrect";
                                else if (/cannot be empty/.test(message))
                                    return "empty";
                                return "unknown";
                            },
                            email: function (message) {
                                if (/already taken/.test(message))
                                    return "used";
                                else if (/is invalid/.test(message))
                                    return "malformed";
                                else if (/cannot be empty/.test(message))
                                    return "empty";
                                else if (/doesn't exist/.test(message))
                                    return "inexistent";
                                else if (/locked out/.test(message))
                                    return "lockedout";
                                else if (/Login failed/.test(message))
                                    return "failed";
                                return "unknown";
                            },
                            gamerTag: function (message) {
                                if (/not be longer than/.test(message))
                                    return "length";
                                return "unknown";
                            }
                        };

                        self.escapeHtml = function (unsafe) {
                            return unsafe
                                .replace(/&/g, "&amp;")
                                .replace(/</g, "&lt;")
                                .replace(/>/g, "&gt;")
                                .replace(/"/g, "&quot;")
                                .replace(/'/g, "&#039;");
                        };

                        self.timelineLoadCount = 20;

                        self.timelineShowDelay = 150;

                        self.firefoxLinkFix = function (event) {
                            if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                                var newWindow = window.open($(event.currentTarget).attr("href"), "newwindow", "width=300, height=250");
                                newWindow.close();
                                event.preventDefault();
                            }
                        };

                        self.getVoteColor = function (i) {
                            return ["terrible", "bad", "not-bad", "good", "awesome"][i];
                        };
                    }

                    return new Utils();
                }
            ]
        };
    });
})();