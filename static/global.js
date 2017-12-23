function pageReady(callback, resizeCallback) {
    var supportTouch = ("createTouch" in document);
    window.supportTouch = supportTouch;

    var ua = navigator.userAgent;

    var isWebkit = false;
    if (/AppleWebKit\/\d+\.\d+/.test(ua)) {
        isWebkit = true;
    }
    window.isWebkit = isWebkit;

    var isAndroid = false;
    // if (/Android (\d+\.\d+)/.test(ua)){
    //     isAndroid = true;
    // }
    window.isAndroid = isAndroid;

    var isInWechat = false;
    var isInMqzone = false;
    var isInMqq = false;
    // if (/MicroMessenger/.test(ua)) {
    //     isInWechat = true;
    // } else if (/Qzone/.test(ua)) {
    //     isInMqzone = true;
    // } else if (/QQ\/\d+\.\d+\.\d+\.\d+/.test(ua)) {
    //     isInMqq = true;
    // }
    window.isInWechat = isInWechat;
    window.isInMqzone = isInMqzone;
    window.isInMqq = isInMqq;

    window.baseUrl = ["http://", location.host, location.pathname.substring(0, location.pathname.lastIndexOf("/")+1)].join("");

    window.onorientationchange = function(){pageResize(resizeCallback);};
    window.onresize = function(){pageResize(resizeCallback);};
    pageResize(resizeCallback);
    if (callback) {
        callback();
    }
}

function pageResize(callback) {
    if (window.supportTouch || window.isWebkit) {
        var $wrapperOuter = $("#wrapperOuter");
        var phoneWidth = $wrapperOuter.width();
        var phoneHeight = $wrapperOuter.height();
        var phoneRatio = phoneWidth / phoneHeight;

        var viewWidth = phoneWidth;
        var $wrapperInner = $(".wrapper-inner");
        if (phoneRatio > 0.695) { // 640 x 920
            viewWidth = phoneHeight * 0.695; // 640 x 920
            var viewWidthRatio = Math.round(viewWidth * 100 / phoneWidth).toFixed(2);
            $wrapperInner.css("width", [viewWidthRatio, "%"].join(""));
            $wrapperInner.css("left", [(100-viewWidthRatio)*0.5, "%"].join(""));
        } else {
            $wrapperInner.css("width", "100%");
            $wrapperInner.css("left", "0");
        }

        window.phoneScale = viewWidth / 320;
        document.body.style.fontSize = [16 * window.phoneScale, "px"].join("");
    } else {
        document.getElementById("wrapperOuter").style.width = "640px";
        document.getElementById("wrapperOuter").style.left = "50%";
        document.getElementById("wrapperOuter").style.marginLeft = "-320px";

        window.phoneScale = 2;
        document.body.style.fontSize = [16 * window.phoneScale, "px"].join("");
    }

    if (callback) {
        window.setTimeout(callback, 0);
    }
}

function pageGetParam(pKey) {
    var queryStr = window.location.search;
    if (queryStr.length > 0) {
        var qMark = queryStr.indexOf("?");
        if (qMark >= 0) {
            queryStr = queryStr.substr(qMark+1);
            var queryList = queryStr.split("&");
            for (var queryIndex in queryList) {
                var queryRow = queryList[queryIndex];
                var queryPair = queryRow.split("=");
                if (queryPair.length >= 2) {
                    var queryKey = queryPair[0];
                    if (queryKey == pKey) {
                        var queryVal = decodeURIComponent(queryPair[1]);
                        return queryVal;
                    }
                }
            }
        }
    }
    return "";
}

function pageGetCookie(c_name) {
    if (document.cookie.length > 0) {
        var mCookies = document.cookie.split(";");
        for (var i in mCookies) {
            var mCookie = mCookies[i];
            var mCookiePair = mCookie.split("=");
            if (mCookiePair.length >= 2) {
                var mCookieName = mCookiePair[0].trim();
                if (mCookieName == c_name) {
                    return decodeURIComponent(mCookiePair[1]);
                }
            }
        }
    }
    return "";
}
function pageSetCookie(c_name, c_value, c_domain) {
    if (c_domain) {
        document.cookie = c_name + "=" + encodeURIComponent(c_value) + "; domain=" + c_domain + "; path=/";
    } else {
        document.cookie = c_name + "=" + encodeURIComponent(c_value);
    }
}


function pageLoadScript(filepath, onloadCallback) {
    var scriptDom = document.createElement("script");
    scriptDom.onload = scriptDom.onreadystatechange = onloadCallback;
    scriptDom.type = "text/javascript";
    scriptDom.src = filepath;
    document.body.appendChild(scriptDom);
}

function pageRecordPV(vUrl) {
    if (!vUrl) {
        vUrl = location.pathname;
    }
    if (typeof(pgvMain) == 'function') {

    } else {

    }
}
function pageRecordClick(hottag) {
    if (typeof(pgvSendClick) == 'function') {

    } else {

    }
}

function preventEventPropagation(evt) {
    var e = evt || window.event;
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    return false;
}

function authorizeByPtlogin() {

}
function authorizeByWechatRecirect() {

}

function sharePageByShuoshuoApi(shareData, shareUrl) {


}
function sharePageByQZoneApi(shareImg, shareUrl) {

}
function sharePageByQZoneRedirect(shareImg, shareUrl) {

}

function launchApp(appUrl, installUrl, tips, replace) {

}
function launchAppInMQzone(appUrl, installUrl, tips, replace) {
    if (mqq.support("mqq.ui.openUrl")) {
        var startTime = new Date();
        mqq.invoke("ui", "openUrl", {
            url:appUrl,
            target:2
        });

        window.setTimeout(function(){
            var endTime = new Date();
            var duration = endTime - startTime;
            if(duration >= 1000) {
                return;
            }

            if (tips && tips.length > 0) {
                window.alert(tips);
            }
            if (installUrl && installUrl.length > 0) {
                if (replace) {
                    window.location.replace(installUrl);
                } else {
                    window.location = installUrl;
                }
            }
        }, 800);
    } else {
        launchAppInMBrowser(appUrl, installUrl, tips, replace);
    }
}
function launchAppInMBrowser(appUrl, installUrl, tips, replace) {

}

function distanceBetweenPoints(p1, p2) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    return distance;
}

function angleBetweenPoints(p1, p2) {
    var angle = 0;
    if (p2.y > p1.y) {
        if (p2.x > p1.x) {
            angle = Math.atan((p2.y-p1.y)/(p2.x-p1.x));
        } else if (p2.x < p1.x) {
            angle = Math.PI - Math.atan((p2.y-p1.y)/(p1.x-p2.x));
        } else {
            angle = Math.PI * 0.5;
        }
    } else if (p2.y < p1.y) {
        if (p2.x > p1.x) {
            angle = Math.PI * 2 - Math.atan((p1.y-p2.y)/(p2.x-p1.x));
        } else if (p2.x < p1.x) {
            angle = Math.PI + Math.atan((p1.y-p2.y)/(p1.x-p2.x));
        } else {
            angle = Math.PI * 1.5;
        }
    } else {
        if (p2.x >= p1.x) {
            angle = 0;
        } else {
            angle = Math.PI;
        }
    }
    return angle;
}
