
function loadingStart(tipsContent, errorTips, iconUrl) {
    var isSupportTouch = window.supportTouch;
    $("#loadingSection .body div").unbind(isSupportTouch ? "touchend" : "click");
    if (tipsContent) {
        $("#loadingSection .body p").html(tipsContent);
        if (errorTips === true) {
            if (iconUrl) {
                $("#loadingSection .body img")[0].src = iconUrl;
            } else {
                $("#loadingSection .body img")[0].src = "";
            }
            $("#loadingSection .body img")[0].className = "";
            $("#loadingSection .body div").css("display", "");
            $("#loadingSection .body div").one(isSupportTouch ? "touchend" : "click", cropStop);
        } else {
            $("#loadingSection .body div").css("display", "none");
            $("#loadingSection .body img")[0].src = "";
            $("#loadingSection .body img")[0].className = "animate";
        }
    } else {
        $("#loadingSection .body div").css("display", "none");
        $("#loadingSection .body img")[0].src = "";
        $("#loadingSection .body img")[0].className = "animate";
        $("#loadingSection .body p").text("加载中请稍候");
    }
    $("#loadingSection").css("display", "");
}
function loadingStop() {
    $("#loadingSection").css("display", "none");
}

var canvasDom;
var canvasCtx;
var cropGesture = null;
function cropChoose(evt) {
    // if (window.isInWechat) {
    //     var wxHeadImgUrl = pageGetCookie("ttpt-wxheadimgurl");
    //     if (wxHeadImgUrl) {
    //         loadingStart("");
    //         $.get("api/getHeadIcon.php?url="+encodeURIComponent(wxHeadImgUrl), function(data, status, xhr){
    //             if (status == "success" && data.length > 0) {
    //                 var photoImg = new Image();
    //                 photoImg.onload = function(){
    //                     loadingStop();
    //                     cropLoaded(this);
    //                 }
    //                 photoImg.src = "data:image/jpeg;base64,"+data;
    //             } else {
    //                 loadingStop();
    //                 cropStart();
    //             }
    //         });
    //     } else {
    //         var wxState = pageGetParam("state");
    //         if (wxState) {
    //             cropStart();
    //         } else {
    //             authorizeByWechatRecirect();
    //         }
    //     }
    // } else if ((window.isInMqzone || !window.supportTouch) && window.p_uin.length > 0 && window.p_skey.length > 0) {
    //     loadingStart("");
    //     $.get("api/getHeadIcon.php", function(data, status, xhr){
    //         if (status == "success" && data.length > 0) {
    //             var photoImg = new Image();
    //             photoImg.onload = function(){
    //                 loadingStop();
    //                 cropLoaded(this);
    //             }
    //             photoImg.src = "data:image/jpeg;base64,"+data;
    //         } else {
    //             loadingStop();
    //             cropStart();
    //         }
    //     });
    // } else {
    //     cropStart();
    // }
    cropStart();
    return preventEventPropagation(evt);
}
function cropStart(evt) {
    var $upload = $("#uploadInput");
    $upload.unbind("change");
    $upload.one("change", cropChanged);
    $upload.trigger("click");

    if (window.isInMqq && window.self != window.top) {
        var followObj = {
            postcode: 'follow',
            data: {}
        }
        window.parent.postMessage(followObj, '*');
    }

    return preventEventPropagation(evt);
}
function cropStop(evt) {
    var isSupportTouch = window.supportTouch;

    cropGesture.unbindEvents();
    $("#cropBar .choose-btn").unbind(isSupportTouch ? "touchend" : "click");
    $("#cropBar .next-btn").unbind(isSupportTouch ? "touchend" : "click");

    $("#cropSection").css("display", "none");
    $("#cropMaskUp").css("visibility", "hidden");
    $("#cropMaskDown").css("visibility", "hidden");
    $("#cropImg").css("display", "none");
    $("#cropImg").attr("src", "");

    $("#uploadInput").unbind("change");

    loadingStop();

    return preventEventPropagation(evt);
}
function cropChanged(evt) {
    if (this.files.length <= 0) {
        cropStop();
        return preventEventPropagation(evt);
    }

    $("#cropSection").css("display", "");

    loadingStart("");
    var file = this.files[0];
    var reader = new FileReader();
    reader.onload = function() {
        // 转换二进制数据
        var binary = this.result;
        var binaryData = new BinaryFile(binary);
        // 获取exif信息
        var imgExif = EXIF.readFromBinaryFile(binaryData);

        var fullScreenImg = new Image();
        fullScreenImg.onload = function(){
            cropLoaded(this);
            loadingStop();
        }
        var mpImg = new MegaPixImage(file);
        mpImg.render(fullScreenImg, {maxWidth:960, maxHeight:960, orientation:imgExif.Orientation});
    }
    reader.readAsBinaryString(file);

    return preventEventPropagation(evt);
}
function cropLoaded(img) {
    var isSupportTouch = window.supportTouch;

    $("#cropSection").css("display", "");

    var $cropLayer = $("#cropLayer");

    var cropSectionHeight = $("#cropSection").height();
    var cropBarHeight = $("#cropBar").height();
    var cropLayerHeight = $cropLayer.height();
    var cropLayerOriginY = (cropSectionHeight - cropBarHeight - cropLayerHeight) * 0.5;
    $cropLayer.css("top", [cropLayerOriginY * 100/cropSectionHeight, "%"].join(""));
    $("#cropMaskUp").css("height", [cropLayerOriginY * 100/cropSectionHeight, "%"].join(""));
    $("#cropMaskUp").css("top", 0);
    $("#cropMaskUp").css("visibility", "visible");
    $("#cropMaskDown").css("height", [cropLayerOriginY * 100/cropSectionHeight, "%"].join(""));
    $("#cropMaskDown").css("top", [(cropLayerOriginY + cropLayerHeight) * 100/cropSectionHeight, "%"].join(""));
    $("#cropMaskDown").css("visibility", "visible");

    var imgWidth = img.width;
    var imgHeight = img.height;
    var ratioWidth = $cropLayer.width() / imgWidth;
    var ratioHeight = $cropLayer.height() / imgHeight;
    var ratio = ratioWidth > ratioHeight ? ratioWidth : ratioHeight;

    cropGesture.targetMinWidth = imgWidth * ratio;
    cropGesture.targetMinHeight = imgHeight * ratio;

    var imgOriginX = ($cropLayer.width() - cropGesture.targetMinWidth) * 0.5;
    var imgOriginY = ($cropLayer.height() - cropGesture.targetMinHeight) * 0.5;

    var $cropImg = $("#cropImg");
    $cropImg.css("display", "");
    $cropImg.width(cropGesture.targetMinWidth);
    $cropImg.height(cropGesture.targetMinHeight);
    $cropImg.css("left", [imgOriginX, "px"].join(""));
    $cropImg.css("top", [imgOriginY, "px"].join(""));
    $cropImg[0].src = img.src;

    cropGesture.unbindEvents();
    cropGesture.bindEvents();
    $("#cropBar .choose-btn").unbind(isSupportTouch ? "touchend" : "click");
    $("#cropBar .choose-btn").on(isSupportTouch ? "touchend" : "click", cropStart);
    $("#cropBar .next-btn").unbind(isSupportTouch ? "touchend" : "click");
    $("#cropBar .next-btn").on(isSupportTouch ? "touchend" : "click", cropConfirm);

    return false;
}
function cropConfirm(evt) {
    var canvasScale = canvasDom.height / $("#cropLayer").height();
    var $cropImg = $("#cropImg");
    var imgOrigin = {x:parseInt($cropImg.css("left")) || 0, y:parseInt($cropImg.css("top")) || 0};
    var imgSize = {width:$cropImg.width(), height:$cropImg.height()};
    canvasCtx.clearRect(0, 0, canvasDom.width, canvasDom.height);
    canvasCtx.drawImage($cropImg[0], imgOrigin.x * canvasScale, imgOrigin.y * canvasScale, imgSize.width * canvasScale, imgSize.height * canvasScale);
    var dataURL = "";
    if (window.isAndroid){
        var imgEncoder = new JPEGEncoder();
        dataURL = imgEncoder.encode(canvasCtx.getImageData(0, 0, canvasDom.width, canvasDom.height), 100, true);
    } else {
        dataURL = canvasDom.toDataURL("image/jpeg", 1.0);
    }
    var dataComponent = dataURL.split(",");
    if (dataComponent.length >= 2) {
        var dataBase64 = dataComponent[1];
        if (dataBase64.length > 0) {
            cropStop();
            hatStart(dataBase64);
        }
    }

    return preventEventPropagation(evt);
}

function hatStart(imgData) {
    $("#hatFace").attr("src", "data:image/jpeg;base64,"+imgData);

    $("#hatStamp")[0].className = "hat-stamp-on";
    $("#hatSection").css("display", "");

    var $hatLayer = $("#hatLayer");
    var hatSectionHeight = $("#hatSection").height();
    var hatBarHeight = $("#hatBar").height();
    var hatLayerHeight = $hatLayer.height();
    var hatLayerOriginY = (hatSectionHeight - hatBarHeight - hatLayerHeight) * 0.5;
    $hatLayer.css("top", [hatLayerOriginY * 100/hatSectionHeight, "%"].join(""));
    $("#hatMaskUp").css("height", [hatLayerOriginY * 100/hatSectionHeight, "%"].join(""));
    $("#hatMaskUp").css("top", 0);
    $("#hatMaskUp").css("visibility", "visible");
    $("#hatMaskDown").css("height", [hatLayerOriginY * 100/hatSectionHeight, "%"].join(""));
    $("#hatMaskDown").css("top", [(hatLayerOriginY + hatLayerHeight) * 100/hatSectionHeight, "%"].join(""));
    $("#hatMaskDown").css("visibility", "visible");

    var hatSectionWidth = $("#hatSection").width();
    var hatStampWidth = $("#hatStamp").width();
    $("#hatStamp").css("left", [(hatSectionWidth - hatStampWidth) * 0.5, "px"].join(""));
    $("#hatStamp").css("top", "0px");
}
function hatConfirm(evt) {
    // $('.background').css('display','none');
    $('.hat-anchor-ld').css('display','none');
    $('.hat-anchor-rd').css('display','none');
    $('#hatStamp').css('border','none');
    var str = $('#hatLayer');
    html2canvas([str.get(0)], {
        onrendered: function (canvas) {
            console.log(canvas);
            var dataurl = canvas.toDataURL('image/png');
            $('#shareImg').attr('src',dataurl);
            $('#saveSection').css('display','block');
        }
    });
}


function hatTouchStart(evt) {
    var touches = evt.touches || evt.originalEvent.touches;
    var touch = touches[0];
    var offset = {
        "x": touch.pageX,
        "y": touch.pageY
    };
    hatDragStart(offset, touch.target);

    return preventEventPropagation(evt);
}
function hatTouchMove(evt) {
    var touches = evt.touches || evt.originalEvent.touches;
    var touch = touches[0];
    var offset = {
        "x": touch.pageX,
        "y": touch.pageY
    };
    hatDragMove(offset);

    return preventEventPropagation(evt);
}
function hatTouchEnd(evt) {
    hatDragEnd();

    return preventEventPropagation(evt);
}
function hatMouseDown(evt) {
    var offset = {
        "x": evt.pageX,
        "y": evt.pageY
    };
    hatDragStart(offset, evt.srcElement);

    return preventEventPropagation(evt);
}
function hatMouseMove(evt) {
    var offset = {
        "x": evt.pageX,
        "y": evt.pageY
    };
    hatDragMove(offset);

    return preventEventPropagation(evt);
}
function hatMouseUp(evt) {
    hatDragEnd();

    return preventEventPropagation(evt);
}
var hatMode = null;
var hatOrigin = {};
var hatFrom = {};
function hatDragStart(pos, tgt) {
    var $hatStamp = $("#hatStamp");
    var hatStampTransform = $hatStamp.css("-webkit-transform");
    $hatStamp.css("transform", "");
    $hatStamp.css("-webkit-transform", "");
    var hatStampOrigin = $hatStamp.offset();
    $hatStamp.css("transform", hatStampTransform);
    $hatStamp.css("-webkit-transform", hatStampTransform);
    var hatLayerOrigin = $("#hatLayer").offset();
    if ($(tgt).attr("anchor") == "1") {
        hatMode = "anchor";
        hatOrigin = {
            x:hatStampOrigin.left-hatLayerOrigin.left+hatStampOrigin.width*0.5,
            y:hatStampOrigin.top-hatLayerOrigin.top+hatStampOrigin.height*0.5,
            scale:parseFloat($hatStamp.attr("scale")),
            rotation:parseFloat($hatStamp.attr("rotation"))
        };
        hatFrom = {x:pos.x-hatLayerOrigin.left-hatOrigin.x, y:pos.y-hatLayerOrigin.top-hatOrigin.y};
    } else {
        hatMode = "drag";
        hatOrigin = {x:hatStampOrigin.left-hatLayerOrigin.left, y:hatStampOrigin.top-hatLayerOrigin.top};
        hatFrom = pos;
    }
}
function hatDragMove(pos) {
    var $hatStamp = $("#hatStamp");
    if (hatMode == "anchor") {
        var hatLayerOrigin = $("#hatLayer").offset();
        var hatTo = {x:pos.x-hatLayerOrigin.left-hatOrigin.x, y:pos.y-hatLayerOrigin.top-hatOrigin.y};

        var distanceFrom = distanceBetweenPoints({x:0,y:0}, hatFrom);
        var distanceTo = distanceBetweenPoints({x:0,y:0}, hatTo);
        var scale = hatOrigin.scale * distanceTo / distanceFrom;

        var rotationFrom = angleBetweenPoints({x:0,y:0}, hatFrom);
        var rotationTo = angleBetweenPoints({x:0,y:0}, hatTo);
        var rotation = hatOrigin.rotation + rotationTo - rotationFrom;
        var degree = rotation * 180 / Math.PI;

        $hatStamp.attr("scale", scale);
        $hatStamp.attr("rotation", rotation);

        $hatStamp.css("transform", "scale("+scale+") rotate("+degree+"deg)");
        $hatStamp.css("-webkit-transform", "scale("+scale+") rotate("+degree+"deg)");
    } else if (hatMode == "drag") {
        var offset = {x:pos.x-hatFrom.x, y:pos.y-hatFrom.y};
        var current = {x:hatOrigin.x+offset.x, y:hatOrigin.y+offset.y};
        $hatStamp.css("left", [current.x, "px"].join(""));
        $hatStamp.css("top", [current.y, "px"].join(""));
    }
}
function hatDragEnd() {
    hatMode = null;
}

function sharePageByPlatform(evt) {
    var cosid = $("#saveSection .retry-btn").data("cosid");
    var shareUrl = window.baseUrl + "index.html?id=" + cosid;
    var shareImg = $("#shareImg")[0].src;
    var imgData = $("#hatSection").data("result");
    if (window.supportTouch) {
        if (window.isInMqq && window.self != window.top) {
            var shareObj = {
                postcode: "share",
                data: {
                    title: $("meta[name=description]").attr("content"),
                    desc: document.title,
                    imageUrl: shareImg,
                    url: shareUrl
                }
            }
            window.parent.postMessage(shareObj, '*');
        } else {
            if (window.isInMqzone && imgData.length > 0 && window.p_uin.length > 0 && window.p_skey.length > 0) {
                sharePageByShuoshuoApi(imgData, window.baseUrl + "index.html");
            } else {
                $("#shareSection").css("display", "");
            }
        }
    } else {
        if (imgData && window.p_uin.length > 0 && window.p_skey.length > 0) {
            sharePageByShuoshuoApi(imgData, window.baseUrl + "index.html");
        } else {
            sharePageByQZoneRedirect(shareImg, shareUrl);
        }
    }

    return preventEventPropagation(evt);
}
function setShareParams(shareImg, shareUrl) {
    var shareTitle = $("meta[name=description]").attr("content");
    var shareDesc = document.title;
    if (window.isInWechat) {
        var shareParams = {
            title:shareTitle,
            desc:shareDesc,
            link:shareUrl,
            imgUrl:shareImg,
            success:function(){},
            cancel:function(){}
        };
        if (typeof(wx) == "object") {
            wx.onMenuShareTimeline(shareParams);
            wx.onMenuShareAppMessage(shareParams);
            wx.onMenuShareQQ(shareParams);
            wx.onMenuShareWeibo(shareParams);
            wx.onMenuShareQZone(shareParams);
        } else {
            loadScript("http://res.wx.qq.com/open/js/jweixin-1.0.0.js", function(){
                loadScript("http://tu.qq.com/websites/wxBridge.php", function(){
                    wx.ready(function(){
                        wx.onMenuShareTimeline(shareParams);
                        wx.onMenuShareAppMessage(shareParams);
                        wx.onMenuShareQQ(shareParams);
                        wx.onMenuShareWeibo(shareParams);
                        wx.onMenuShareQZone(shareParams);
                    });
                });
            });
        }
    } else if (window.isInMqq) {
        var shareParams = {
            share_url:shareUrl,
            title:shareTitle,
            desc:shareDesc,
            image_url:shareImg
        };
        if (typeof(mqq) == "object") {
            mqq.data.setShareInfo(shareParams);
        } else {
            loadScript("http://pub.idqqimg.com/qqmobile/qqapi.js?_bid=152", function(){
                mqq.data.setShareInfo(shareParams);
            });
        }
    } else if (window.isInMqzone) {
        if (typeof(QZAppExternal) == "object") {
            QZAppExternal.setShare(function(data){

            }, {
                'type' : "share",
                'image': [shareImg, shareImg, shareImg, shareImg, shareImg],
                'title': [shareTitle, shareTitle, shareTitle, shareTitle, shareTitle],
                'summary': [shareDesc, shareDesc, shareDesc, shareDesc, shareDesc],
                'shareURL': [shareUrl, shareUrl, shareUrl, shareUrl, shareUrl]
            });
        } else {
            loadScript("http://qzs.qq.com/qzone/phone/m/v4/widget/mobile/jsbridge.js", function(){
                QZAppExternal.setShare(function(data){

                }, {
                    'type' : "share",
                    'image': [shareImg, shareImg, shareImg, shareImg, shareImg],
                    'title': [shareTitle, shareTitle, shareTitle, shareTitle, shareTitle],
                    'summary': [shareDesc, shareDesc, shareDesc, shareDesc, shareDesc],
                    'shareURL': [shareUrl, shareUrl, shareUrl, shareUrl, shareUrl]
                });
            });
        }
    }
}

function retryButtonPressed() {
    window.location.reload();
}

function indexPageReady() {
    var cosid = pageGetParam("id");

    document.getElementById("loadingSection").style.display = "none";
    if (!window.supportTouch && !window.isWebkit) {
        var pageUrl = window.baseUrl + "index.html?id=" + cosid;
        var qrcodeUrl = "http://test.tu.qq.com/websites/qrcode.php?url=" + encodeURIComponent(pageUrl);
        document.getElementById("qrcodeImg").src = qrcodeUrl;
        document.getElementById("qrcodeSection").style.display = "";
        return;
    }

    window.p_uin = pageGetCookie("uin").replace(/o/, "");
    window.p_skey = pageGetCookie("p_skey");

    var shouldSetDefaultShareParams = true;

    var wxState = pageGetParam("state");
    var wxHeadImgUrl = pageGetParam("wxheadimgurl") || pageGetCookie("ttpt-wxheadimgurl");
    if (window.isInWechat && wxState && wxHeadImgUrl.length > 0) {
        loadingStart("");
        $.get("api/getHeadIcon.php?url="+encodeURIComponent(wxHeadImgUrl), function(data, status, xhr){
            if (status == "success" && data.length > 0) {
                var photoImg = new Image();
                photoImg.onload = function(){
                    loadingStop();
                    cropLoaded(this);
                    $("#welcomeSection").css("display", "");
                }
                photoImg.src = "data:image/jpeg;base64,"+data;
            } else {
                loadingStop();
                $("#welcomeSection").css("display", "");
            }
        });
    } else {
        if (cosid.length > 0) {
            shouldSetDefaultShareParams = false;

            loadingStart("");
            var cgiUrl = "../../cgi/queryCosInfo.php?id=" + cosid;
            $.getJSON(cgiUrl, function(data, status, xhr){
                if (status == "success") {
                    var photoImg = new Image();
                    photoImg.onload = function(){
                        loadingStop();
                        $("#resultImg").attr("src", this.src);
                        $("#resultSection").css("display", "");
                    };
                    photoImg.src = data.rawPhotoUrl;

                    // set share params
                    var shareUrl = window.baseUrl + "index.html?id=" + cosid;
                    setShareParams(data.rawPhotoUrl, shareUrl);
                } else {
                    loadingStop();
                    $("#welcomeSection").css("display", "");

                    // set share params
                    var shareImg = $("#defaultImg").attr("src");
                    var shareUrl = window.baseUrl + "index.html?id=" + cosid;
                    setShareParams(shareImg, shareUrl);
                }
            });
        } else {
            if (window.isInMqzone && window.p_uin.length > 0 && window.p_skey.length > 0) {
                loadingStart("");
                $.get("api/getHeadIcon.php", function(data, status, xhr){
                    if (status == "success" && data.length > 0) {
                        var photoImg = new Image();
                        photoImg.onload = function(){
                            loadingStop();
                            cropLoaded(this);
                            $("#welcomeSection").css("display", "");
                        }
                        photoImg.src = "data:image/jpeg;base64,"+data;
                    } else {
                        loadingStop();
                        $("#welcomeSection").css("display", "");
                    }
                });
            } else {
                $("#welcomeSection").css("display", "");
            }
        }
    }

    window.setTimeout(function(){
        // init welcome section event
        $("#welcomeSection .choose-btn").on("click", cropChoose);

        // init result section event
        $("#resultSection .choose-btn").on("click", cropChoose);

        // init crop section event
        cropGesture = new EZGesture($("#cropLayer")[0], $("#cropImg")[0], {targetMinWidth:420, targetMinHeight:420});

        var $canvas = $("#cropCanvas");
        canvasDom = $canvas[0];
        canvasCtx = canvasDom.getContext("2d");

        cropGesture.targetMinWidth = canvasDom.width;
        cropGesture.targetMinHeight = canvasDom.height;

        $("#cropSection").css("visibility", "hidden");
        $("#cropSection").css("display", "");
        var cropLayerHeight = ($("#cropSection").width() * canvasDom.height * 100 / (canvasDom.width * $("#cropSection").height())).toFixed(2);
        $("#cropLayer").css("height", [cropLayerHeight, "%"].join(""));
        $("#cropSection").css("display", "none");
        $("#cropSection").css("visibility", "visible");

        // init hat section event
        var $hatSection = $("#hatSection");
        var $hatLayer = $("#hatLayer");
        $hatSection.css("visibility", "hidden");
        $hatSection.css("display", "");
        var hatLayerHeight = ($hatSection.width() * canvasDom.height * 100 / (canvasDom.width * $hatSection.height())).toFixed(2);
        $hatLayer.css("height", [hatLayerHeight, "%"].join(""));
        $hatSection.css("display", "none");
        $hatSection.css("visibility", "visible");

        if ((window.isInMqzone || !window.supportTouch) && window.p_uin.length > 0 && window.p_skey.length > 0) {
            $("#hatSection .confirm-btn").text("设为空间头像");
        }
        $("#hatSection .confirm-btn").on("click", hatConfirm);

        if (window.supportTouch) {
            $hatLayer.on("touchstart", hatTouchStart);
            $hatLayer.on("touchmove", hatTouchMove);
            $hatLayer.on("touchend", hatTouchEnd);
        } else {
            $hatLayer.on("mousedown", hatMouseDown);
            $hatLayer.on("mousemove", hatMouseMove);
            $hatLayer.on("mouseup", hatMouseUp);
        }

        // init save section event
        $("#saveSection .share-btn").on("click", sharePageByPlatform);
        $("#saveSection .retry-btn").on("click", retryButtonPressed);
        $("#saveSection .download-btn").on("click", function(){
            window.location = "http://tu.qq.com/downloading.php?by=124";
        });

        // init share section event
        $("#shareSection").on("click", function(){
            $("#shareSection").css("display", "none");
        });

        if (shouldSetDefaultShareParams) {
            // set share params
            var shareImg = $("#defaultImg").attr("src");
            var shareUrl = window.baseUrl + "index.html";
            setShareParams(shareImg, shareUrl);
        }

        // pv
        var pf_flag = "other";
        if (window.isInWechat) {
            pf_flag = "wechat";
        } else if (window.isInMqzone) {
            pf_flag = "mqzone";
        } else if (window.isInMqq) {
            pf_flag = "mqq";
        }
        pageRecordPV(location.pathname + "-" + pf_flag);
    }, 0);
}
function indexPageResize() {

}
