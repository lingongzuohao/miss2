/**
 * @file
 */
var basePath = window.basePath;
var sendEntEmail = false;   //发送企业邮箱验证码
var interFetchEntEmailCaptchaFN = null;
var fetchEntEmailCaptchaInterval = 60;  //60秒内

var needToAuthEntEmail = false; //是否需要验证企业邮箱
var needToApplyCourse = false;  //是否需要申请课程

var wh = null;
var count = 1;
//轮询用的定时器
var interTimer = null;

$(document).ready(function () {
    $('.show-text').live('click', function () {
        $(this).prev('input[class*="pp-input"]').focus();
        $(this).addClass('show-text-focus');
    });
    $("input[class*='pp-input']").live('focusout', function () {
        $(this).next('.show-text').removeClass('show-text-focus');
    });
    $("input[class*='pp-input']").live('keydown', function () {
        $(this).next('.show-text').hide();
    });
    $("input[class*='pp-input']").live('keyup', function () {
        var v = $(this).val();
        if (v == "") {
            $(this).next('.show-text').show();
        }
    });

    //切换tab选项
    initTab();
    //图标的tips
    initHover();
    //滚动隐藏导航
    scrollHiddenNavigation();
    //绑定按钮点击事件
    initOperateBtn();
    //跳转企业
    //$('#nav').onePageNav();

    // 增加企业特惠判断
    initEnt();
    wh = $(window).height();
});
function initOperateBtn() {
    $("#authEntMailBtn").live("click", authEntEmail);    //验证企业邮箱 by landi
    $("#sendEntEmailVerCodeBtn").live("click", sendEntEmailVerCode); //发送企业邮箱验证码 by landi
    $("#submitEntEmailVerCodeBtn").live("click", submitEntEmailVerCode); //提交企业邮箱信息 by landi
    $(".applyCourseBtn").live("click", applyCourse); //申请课程
    $("#applyCourseDirectBtn").live("click", applyCourseDirect); //直接申请课程

    //关闭
    $(".closePreferentialDivBtn").live("click", closePreferentialDiv);
    $(".closeEntEmailDivBtn").live("click", closeEntEmailDiv);
    $(".closeMsgWinBtn").live("click", closeMsgWin);


    //验证
    $("#entEmail").live("blur", validateEntEmail);   //验证企业邮箱
    $("#entCaptcha").live("blur", validateEntCaptcha);   //验证邮箱验证码
}

/**
 * 验证企业邮箱 Edit by Landi
 */
function authEntEmail(){
    $.ajax({
        async:true,
        type:"POST",
        url: basePath + '/api/verifyapplycourse',
        data:{"courseId":courseId},
        dataType:"json",
        success:function(data){
            if(parseInt(data.status, 10) === 0){
                //弹出验证邮箱层
                initEntEmailWin();
                $('.msg-box-email').show();
                $('.msg-box').show().css("height",wh);
                return;
            } else {
                checkErrorCode(data, courseId);
            }
        },
        error:function(data){
            alert("验证失败服务器正忙，请稍后重试");
        }
    });
        
}

//验证企业邮箱 Edit by Landi
function sendEntEmailVerCode(){
    //检查邮箱格式
    var checkResult = validateEntEmail();
    if(!checkResult){
        return;
    }
    
    if(sendEntEmail){
        //已经发送了
        return;
    }
    sendEntEmail = true;
    //1分钟后可再次获取
    fetchEntEmailCaptcha();
    interFetchEntEmailCaptchaFN = setInterval(fetchEntEmailCaptcha,1000);
    
    var postData = {
        'email':$('#entEmail').val()
    };
    //发送请求
    $.ajax({
        async:true,
        type:"POST",
        url: basePath + '/api/getmailvercode',
        data: postData,
        dataType:"json",
        success:function(data){
            if (parseInt(data.errorCode, 10) === 10){
                //需要登录
                closeEntEmailDiv();
                baiduPassortInstance.show();//显示浮层
                return;
            } else if (parseInt(data.errorCode, 10) === 304){
                //企业邮箱不在合作列表中
                $('#sendEntEmailSuccessInfoDiv').html('邮箱地址有误').show();
                $('#entCaptcha').css('border','1px solid #f55');
                $("#sendEntEmailVerCodeBtn").removeClass("fs-yz-gray").addClass("fs-yz-blue").text("发送验证码到邮箱");
                fetchEntEmailCaptchaInterval = 60;
                window.clearInterval(interFetchEntEmailCaptchaFN);
                sendEntEmail = false;
                return;
            } else if (parseInt(data.errorCode, 10) === 305){
                //企业邮箱不在合作列表中
                $('#sendEntEmailSuccessInfoDiv').html('非合作企业邮箱').show();
                $('#entCaptcha').css('border','1px solid #f55');
                $("#sendEntEmailVerCodeBtn").removeClass("fs-yz-gray").addClass("fs-yz-blue").text("发送验证码到邮箱");
                fetchEntEmailCaptchaInterval = 60;
                window.clearInterval(interFetchEntEmailCaptchaFN);
                sendEntEmail = false;
                return;
            }
            $("#sendEntEmailSuccessInfoDiv").html("若长时间收不到验证邮件，请检查一下垃圾邮件").show();
        }
    });
}

//发送企业邮箱定时检测器
function fetchEntEmailCaptcha(){
    if(fetchEntEmailCaptchaInterval == 1){
        $("#sendEntEmailVerCodeBtn").removeClass("fs-yz-gray").addClass("fs-yz-blue").text("发送验证码到邮箱");
        fetchEntEmailCaptchaInterval = 60;
        window.clearInterval(interFetchEntEmailCaptchaFN);
        sendEntEmail = false;
        $("#sendEntEmailSuccessInfoDiv").hide();
        return;
    }
    fetchEntEmailCaptchaInterval--;
    $("#sendEntEmailVerCodeBtn").removeClass("fs-yz-blue").addClass("fs-yz-gray").text("("+fetchEntEmailCaptchaInterval+"秒后)重新获取");
}

/**
 * 提交企业邮箱信息 Edit by Landi
 */
function submitEntEmailVerCode() {
    //前端验证
    var checkResult = validateEntEmail() && validateEntCaptcha();
    if (!checkResult) {
        return;
    }

    var postData = {
        "email": $("#entEmail").val(),
        "verifycode": $("#entCaptcha").val()
    };
    $.ajax({
        async: true,
        type: "POST",
        url: basePath + '/api/verifyemail',
        data: postData,
        dataType: "json",
        success: function (data) {
            if (parseInt(data.status, 10) === 0) {
                if (needToApplyCourse) {
                    //继续
                    $(".applyCourseBtn:eq(0)").trigger("click");
                } else {
                    window.location.reload();
                }
                return;
            } else if (parseInt(data.status, 10) === 30) {
                    //status=30，邮箱错误或验证码错误
                    //status=30，非企业邮箱
                    $("#sendEntEmailSuccessInfoDiv").html(data.msg).show();
                    return;
            } else if (parseInt(data.status, 10) === 40) {
                    //status=40，内部错误
                    $("#sendEntEmailSuccessInfoDiv").html(data.msg).show();
                    return;
            } else if (parseInt(data.status, 10) === 60) {
                    //status=60，验证失败
                    $("#sendEntEmailSuccessInfoDiv").html(data.msg).show();
                    return;
            }

            /*if (typeof data.errorCode != 'undefined') {
                //重置验证
                $("#entEmail,#entCaptcha").css("border", "1px solid #d9d9d9");
                //$("#entEmailTip").hide();

                if (data.errorCode == "10") {
                    //需要登录
                    closeEntEmailDiv();
                    baiduPassortInstance.show();//显示浮层
                    return;
                } else if (data.errorCode == "210") {
                    //验证码不正确
                    $("#sendEntEmailSuccessInfoDiv").html("验证码输入错误").show();
                    $("#entCaptcha").css("border", "1px solid #ff5555");
                    return;
                } else if (data.errorCode == "220") {
                    //企业邮箱输入不正确
                    $("#entEmail").css("border", "1px solid #ff5555");
                    $("#entEmailTip").removeClass("ts-img-green").addClass("ts-img-red").show();
                    return;
                } else if (data.errorCode == "230") {
                    //企业邮箱不在合作列表中
                    $("#sendEntEmailSuccessInfoDiv").html("很抱歉，您的邮箱不在我们合作企业列表中<br/>您可拨打电话咨询4006999700，我们愿意为您企业提供服务").show();
                    $("#entCaptcha").css("border", "1px solid #ff5555");
                    return;
                }
            }

            alert(data.message);*/
        },
        error: function () {
            //发生错误
            alert("提交失败，请稍后重试");
        }
    });
}



/**
 * 企业特惠标识判断
 */
function initEnt() {
    $('.ent-box').each(function () {
        if ($(this).attr('enterprisetype') === '0') {
            $(this).append('<span class="img-icon" title="合作企业的员工可享受企业员工价">企业特惠</span>');
        } else if ($(this).attr('enterprisetype') === '1') {
//          $('.tip-box').html('申请即可享受百度有钱提供的<span class="tip-red">0首付/0息/0服务费</span>分期服务，先上课后付款');
            $('.tips-index-box').remove();
        }
    });
    $('.kc-detail-box').each(function () {
        if ($(this).attr('enterprisetype') === '0') {
            $(this).append('<span class="img-icon" title="合作企业的员工可享受企业员工价">企业特惠</span>');
        }
    });
}
/**
 * 直接申请课程
 */
function applyCourseDirect() {
    // 验证校区选项合法性
    if (!validate()) {
        return;
    }
    var courseId = $('#courseId').val();
//    var cityName = '上海';
//    var schoolId = '59';
//    var schoolName = '上海校区';
    var selectedClass = 'selected';
    var citiesTd = $('.js-cities');
    var selectedCity = citiesTd.find('.' + selectedClass);
    var cityName = selectedCity.html();
    var schoolId = $('.js-schoolId').val();
    var schoolName = $('.js-schoolName').val();
    
    $.ajax({
        async: true,
        type: 'POST',
        //url:basePath + "/member/applyCourse/doApplyCourseByDirect.htm?m=" + Math.random(),
        url: basePath + '/api/apply',
        data: {
            courseId: courseId,
            cityName: cityName,
            schoolId: schoolId,
            schoolName: schoolName
        },
        dataType: "json",
        success: function (data) {
            if(parseInt(data.status, 10) === 0){
                // 验证通过
                //轮询次数重置为1
                count = 1;
                // 轮询
                rollGet(data.reqid);
            } else if (parseInt(data.status, 10) === 1) {
                $(".loading-box").hide();
                checkErrorCode(data, courseId);
            } else {
                $(".loading-box").hide();
                // 关闭层
                closePreferentialDiv();
                // 信息有误
                if(data && data.errorMsg) {
                    errorMsg = data.errorMsg;
                } else {
                    errorMsg = '您填写的信息不正确，请填写正确信息后重新提交~~';
                }
                // 显示错误信息
                $('.fail-tips').remove();
                $('.tkp-main-content').find('.closeMsgWinBtn').html('我知道了');
                showMsg(errorMsg);
            }
        },
        error: function (data) {
            //alert("验证失败服务器正忙，请稍后重试");
        }
    });
}

/**
 * 申请课程
 */
function applyCourse() {
    // 验证校区选项合法性
    if (!validate()) {
        return;
    }
    var courseId = $('#courseId').val();
    //var cityName = '上海';
//    var schoolName = '上海校区';
//    var schoolId = 59;
    var selectedClass = 'selected';
    var citiesTd = $('.js-cities');
    var selectedCity = citiesTd.find('.' + selectedClass);
    var cityName = selectedCity.html();
    var schoolId = $('.js-schoolId').val();
    var schoolName = $('.js-schoolName').val();

    $.ajax({
        async: true,
        type: "POST",
        url: basePath + '/api/verifyapplycourse?courseId=' + courseId,
        data: {courseId: courseId},
        dataType: 'json',
        success: function (data) {
            if (parseInt(data.status, 10) === 0) {
                // 已经通过验证，显示直接申请课程弹窗
                $(".loading-box").hide();
                $('.msg-box-preferential').show();
                $('.msg-box').show().css('height', wh);
                return;
            } else {
                checkErrorCode(data, courseId, cityName, schoolName, schoolId);
            }
        },
        error: function (data) {
            //alert("验证失败服务器正忙，请稍后重试");
        }
    });
}

function checkErrorCode(data, courseId, cityName, schoolName, schoolId) {
    //判断错误代码
    var errorMsg = '';
    switch(parseInt(data.errorCode, 10))
    {
    case 10:
        // 未登录
        needToAuthEntEmail = true;
        // 显示浮层
        baiduPassortInstance.show();
        return;
        break;
    case 20:
        // 激活邮箱
        // 弹出验证邮箱层
        initEntEmailWin();
        $('.msg-box-email').show();
        $('.msg-box').show().css("height",wh);
        return;
        break;
    case 40:
        // 已购买该课程
        errorMsg = '您已申请过该课程，不要太贪心哦~';
        // 显示错误信息
        $('.fail-tips').remove();
        $('.tkp-main-content').find('.closeMsgWinBtn').html('我知道了');
        showMsg(errorMsg);
        break;
    case 300:
        // 课程ID为空
        errorMsg = data.errorMsg;
        // 显示错误信息
        showMsg(errorMsg);
        break;
    case 60:
        // 申请名额已满
        // errorMsg = "来晚啦！本期的申请名额已满，敬请等待下次开放申请～";
//        errorMsg = data.errorMsg;
//        // 显示错误信息
//        showMsg(errorMsg);
        window.location.href = basePath + '/applyfull';
        break;
    case 50:
        // 24小时内连续申请失败
        // errorMsg = "您已多次提交信息有误，请在<span class='a-link'>24小时</span>后再尝试申请";
//        errorMsg = data.errorMsg;
//        // 显示错误信息
//        showMsg(errorMsg);
        window.location.href = basePath + '/applyretry';
        break;
    case 80:
        // 已经通过验证
        errorMsg = data.errorMsg;
        // 显示错误信息
        $('.fail-tips').remove();
        $('.tkp-main-content').find('.closeMsgWinBtn').html('我知道了');
        showMsg(errorMsg);
//        window.location.href = basePath + '/applysuccess';
        break;
    case 301:
        // 用户信息不存在
        // 直接跳转到申请表单页面
        if(courseId && cityName && schoolName && schoolId) {
            window.location.href = basePath + '/applycourse?courseId=' + courseId + '&cityName=' + encodeURI(cityName) + '&schoolName=' + encodeURI(schoolName) + '&schoolId=' + schoolId;
        }
        break;
    case 270:
        errorMsg = '网络不给力，请稍后再试~~';
        // 显示错误信息
        $('.fail-tips').remove();
        $('.tkp-main-content').find('.closeMsgWinBtn').html('我知道了');
        showMsg(errorMsg);
        break;
    case 280:
        errorMsg = '网络不给力，请稍后再试~~';
        // 显示错误信息
        $('.fail-tips').remove();
        $('.tkp-main-content').find('.closeMsgWinBtn').html('我知道了');
        showMsg(errorMsg);
        break;
    case 290:
        errorMsg = '网络不给力，请稍后再试~~';
        // 显示错误信息
        $('.fail-tips').remove();
        $('.tkp-main-content').find('.closeMsgWinBtn').html('我知道了');
        showMsg(errorMsg);
        break;
    case 1000:
        // 系统升级中
        errorMsg = '系统升级中，请稍后再尝试~~';
        // 显示错误信息
        $('.fail-tips').remove();
        $('.tkp-main-content').find('.closeMsgWinBtn').html('我知道了');
        showMsg(errorMsg);
        break;
    }
}

//显示错误信息
function showMsg(errorMsg) {
    // 有错误产生
    if(errorMsg && errorMsg.length > 0){
        $("#errorMsgContent").html(errorMsg);
        $("#applyCourseFailDiv").show();
        $('.msg-box').show().css("height", wh);
    }
}

function initHover() {
    //标签的tips
    $(".tip-type-box").live("hover", function (event) {
        if (event.type == 'mouseenter') {
            var tl = $(this).children(".type-ap-tips");
            $(tl).show().stop().animate({opacity: "1", bottom: "33px"}, 500);
        } else {
            var tl = $(this).children(".type-ap-tips");
            $(tl).stop().animate({opacity: "0", bottom: "25px"}, 500).hide();
        }
    });

    $(".type-cb").hover(function () {
            var tl = $(this).siblings(".detail-ap-tips");
            $(tl).show().stop().animate({opacity: "1", bottom: "33px"}, 500);
        },
        function () {
            var tl = $(this).siblings(".detail-ap-tips");
            $(tl).stop().animate({opacity: "0", bottom: "25px"}, 500).hide();
        });
}

function initTab() {
    //切换tab选项
    $(".mbb-tab-ul li").each(function (i) {
        $(this).click(function () {
            $(".mbb-tab-ul li").removeClass('cur');
            $(this).addClass('cur');
        });
    });
}
function scrollHiddenNavigation() {
    //滚动隐藏导航
    $(window).scroll(function () {
        var h = $(window).scrollTop();
        if (h > 680) {
            $(".mbb-tab-ul").css("background-color", "#f8f8f8", "width:921px");
            $(".mbb-tab-ul").css("width", "921px");
            $(".dt-ul-box").addClass("hide-bar-tab");
            $("#section-1").css("padding-top", "65px");
            $(".hide-bar-tab").show();
            $(".sqkc-btn").show();
            $(".hh-box").show();
        } else {
            $(".mbb-tab-ul").css("background-color", "#fff");
            $(".mbb-tab-ul").css("width", "auto");
            $(".dt-ul-box").removeClass("hide-bar-tab");
            $("#section-1").css("padding-top", "0px");
            $(".hide-bar-tab").hide();
            $(".sqkc-btn").hide();
            $(".hh-box").hide();
        }
    });
}


/**
 * 企业邮箱验证
 */
function validateEntEmail() {
    var $this = $("#entEmail");
    var email = $this.val();

    if (!email || email.length == 0) {
        $this.css("border", "1px solid #d9d9d9");
        $("#entEmailTip").hide();
        $('#sendEntEmailSuccessInfoDiv').html('邮箱地址不能为空').show();
        $this.css("border","1px solid #ff5555");
        $("#entEmailTip").removeClass("ts-img-green").addClass("ts-img-red").show();
        return false;
    }

    if (!/^([a-zA-Z0-9]+[\-|_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[\-|\_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}?$/.test(email)) {
        $('#sendEntEmailSuccessInfoDiv').html('邮箱地址有误').show();
        $this.css("border", "1px solid #ff5555");
        $("#entEmailTip").removeClass("ts-img-green").addClass("ts-img-red").show();
        return false;
    }

    var ms = email.indexOf("@");
    var mailSuffix = email.substring(ms + 1);
    //验证企业邮箱是否在列表中
    if (coopEntNameList && coopEntNameList.length > 0 && coopEntNameList.indexOf(mailSuffix) == -1) {
        //不在
        $this.css("border", "1px solid #ff5555");
        $("#entEmailTip").removeClass("ts-img-green").addClass("ts-img-red").show();
        $("#sendEntEmailSuccessInfoDiv").html("很抱歉，您的邮箱不在我们合作企业列表中<br/>您可拨打电话咨询4006999700，我们愿意为您企业提供服务").show();
        return false;
    }

    //成功
    $this.css("border", "1px solid #d9d9d9");
    $("#entEmailTip").removeClass("ts-img-red").addClass("ts-img-green").show();
    $("#sendEntEmailSuccessInfoDiv").html("").hide();
    return true;
}

/**
 * 验证邮箱验证码
 */
function validateEntCaptcha() {
    var $this = $("#entCaptcha");
    var captcha = $this.val();

    if (!captcha || captcha.length == 0) {
        $this.css("border","1px solid #ff5555");
        $("#sendEntEmailSuccessInfoDiv").html("验证码输入错误").show();
        return false;
    }

    return true;
}

/**
 * 关闭层
 */
function closePreferentialDiv() {
    $(".msg-box-preferential,.msg-box").hide();
}

function closeEntEmailDiv() {
    $(".msg-box-email,.msg-box").hide();
}

/**
 * 关闭消息提示层
 */
function closeMsgWin() {
    $("#applyCourseFailDiv,.msg-box,.msg-box-preferential").hide();
}

/**
 * 初始化企业验证弹出层
 */
function initEntEmailWin() {
    $("#entEmail,#entCaptcha").val("");
    $("#entEmail,#entCaptcha").css("border", "1px solid #d9d9d9");
    $("#sendEntEmailSuccessInfoDiv,#entEmailTip").hide();
}

/**
 * 对后台进行轮询发请求
 */
function rollGet(reqid) {
    // 关闭层
    closePreferentialDiv();
    $('.loading-box').css('height', wh).show();
    $.ajax({
        type: 'post',
        url: basePath + '/api/getapplystatus',
        data: {
            reqid: reqid
        },
        dataType: 'json',
        success: function (data) {
            if (parseInt(data.status, 10) === 0) {
                if (parseInt(data.successCode, 10) === 1) {
                    // 轮询请求
                    clearInterval(interTimer);
                    // 关闭等待弹窗
                    $(".loading-box").hide();
                    // 关闭层
                    closePreferentialDiv();
                    // 跳转到申请课程成功页
                    window.location.href = reqid ? basePath + '/applysuccess?reqid='+reqid : basePath + '/applysuccess';
                } else if (parseInt(data.successCode, 10) === 0) {
                    // 轮询请求
                    clearInterval(interTimer);
                    interTimer = setInterval(function () {
                        if (count <= 3) {
                            // 关闭层
                            closePreferentialDiv();
                            $('.loading-box').css('height', wh).show();
                            /*轮询请求*/
                            ajaxRoll(reqid);
                        } else {
                            clearInterval(interTimer);
                            // 关闭等待弹窗
                            $(".loading-box").hide();
                            // 关闭层
                            closePreferentialDiv();
                            // 跳转到申请课程等待页
                            window.location.href = reqid ? basePath + '/applywaiting?reqid='+reqid : basePath + '/applywaiting';
                        }
                    }, 4000);
                } else if (parseInt(data.successCode, 10) === 2) {
                    clearInterval(interTimer);
                    // 关闭等待弹窗
                    $(".loading-box").hide();
                    // 关闭层
                    closePreferentialDiv();
                    // 信息有误
                    errorMsg = '您填写的信息不正确，请填写正确信息后重新提交~';
                    // 显示错误信息
                    showMsg(errorMsg);
                } else if (parseInt(data.successCode, 10) === 3) {
                    // 跳转黑名单
                    clearInterval(interTimer);
                    // 关闭等待弹窗
                    $(".loading-box").hide();
                    // 关闭层
                    closePreferentialDiv();
                    // 跳转到申请课程失败页
                    window.location.href = basePath + '/applyfailure';
                } else {
                    // 轮询请求
                    clearInterval(interTimer);
                    // 关闭等待弹窗
                    $(".loading-box").hide();
                    // 关闭层
                    closePreferentialDiv();
                 // 跳转到申请课程等待页
                    window.location.href = reqid ? basePath + '/applywaiting?reqid='+reqid : basePath + '/applywaiting';
                }
            }
        },
        error: function () {
        }
    });
}

/**
 * 购买最后一步轮询请求的ajax，用于3次轮询中
 */
function ajaxRoll(reqid) {
    $.ajax({
        type: 'post',
        url: basePath + '/api/getapplystatus',
        data: {
            reqid: reqid
        },
        dataType: 'json',
        success: function (data) {
            if (parseInt(data.status, 10) === 0) {
                if (parseInt(data.successCode, 10) === 1) {
                    // 关闭等待弹窗
                    $(".loading-box").hide();
                    // 关闭层
                    closePreferentialDiv();
                    clearInterval(interTimer);
                    // 跳转到申请课程成功页
                    window.location.href = reqid ? basePath + '/applysuccess?reqid='+reqid : basePath + '/applysuccess';
                } else if (parseInt(data.successCode, 10) === 0) {
                    count++;
                } else if (parseInt(data.successCode, 10) === 2) {
                    clearInterval(interTimer);
                    // 关闭等待弹窗
                    $(".loading-box").hide();
                    // 关闭层
                    closePreferentialDiv();
                    // 信息有误
                    errorMsg = '您填写的信息不正确，请填写正确信息后重新提交~';
                    // 显示错误信息
                    showMsg(errorMsg);
                } else if (parseInt(data.successCode, 10) === 3) {
                    // 跳转黑名单
                    clearInterval(interTimer);
                    // 关闭等待弹窗
                    $(".loading-box").hide();
                    // 关闭层
                    closePreferentialDiv();
                    // 跳转到申请课程失败页
                    window.location.href = basePath + '/applyfailure';
                } else {
                    clearInterval(interTimer);
                    // 关闭等待弹窗
                    $(".loading-box").hide();
                    // 关闭层
                    closePreferentialDiv();
                    // 跳转到申请课程等待页
                    window.location.href = reqid ? basePath + '/applywaiting?reqid='+reqid : basePath + '/applywaiting';
                }
            }
        },
        error: function () {
        }
    });
}



// 验证选项合法性 Add at 08-05
function validate() {
    var ret = true;

    // 校区
    (function () {
        var schoolId = $('#schoolId');
        var schoolName = $('#schoolName');
        var schoolError = $('.js-school-error');
        if (!schoolId.val() || !schoolName.val()) {
            schoolError.show();
            ret = false;
        }
    })();

    return ret;
}

/**
 * 选择城市校区 Add at 08-05
 */
$(function () {
    var selectedClass = 'selected';
    var citiesTd = $('.js-cities');
    var selectedCity = citiesTd.find('.' + selectedClass);
    var cityId = $('.js-cityId');
    var courseId = window.courseId;
    var cityName = $('.js-cityName');
    var schoolId = $('.js-schoolId');
    var schoolName = $('.js-schoolName');
    var schoolSelectInput = $('.js-school-select-input');
    var schoolSelectList = $('.js-school-select-list');
    var schoolError = $('.js-school-error');

    var main = {
        init: function () {
            this.bindEvents();
            this.select(selectedCity, true);
            this.choose();
        },

        bindEvents: function () {
            var self = this;
            citiesTd.on('click', 'a', function () {
                self.select($(this));
            });
            schoolSelectList.on('click', 'a', function (e) {
                self.selectSchool($(this));
                e.stopPropagation();
            });
            schoolSelectInput.on('click', function (e) {
                schoolSelectList[schoolSelectList.is(':hidden') ? 'show' : 'hide']();
                e.stopPropagation();
            });
            $('body').on('click.hideSchoolSelectList', function () {
                schoolSelectList.hide();
            });
        },

        selectSchool: function (a) {
            schoolId.val(a.data('schoolid'));
            schoolName.val(a.html());
            schoolSelectInput.html(a.html());
            schoolError.hide();
            schoolSelectList.hide();
        },

        select: function (a, anyway) {
            if (a[0] === selectedCity[0] && !anyway) {
                return;
            }
            var schoolId = $('#schoolId');
            var schoolName = $('#schoolName');
            schoolId.val('');
            schoolName.val('');
            selectedCity.removeClass(selectedClass);
            a.addClass(selectedClass);
            selectedCity = a;
            cityId.val(selectedCity.data('cityid'));
            cityName.val(selectedCity.data('cityname'));
            this.getSchool();
        },

        getSchool: function () {
            var self = this;
            var cityIdName = cityName.val();
            self.schoolRender(window.cityData[cityIdName] || []);
        },

        schoolRender: function (list) {
            var self = this;
            var option = '';
            $.each(list, function (index, item) {
                option += '<li><a href="javascript:;" data-schoolid="'
                    + item.id + '">'
                    + item.schoolName
                    + '</a></li>';
            });
            schoolSelectInput.html('请选择校区');
            schoolSelectList.html(option);
            if (list.length === 1) {
                self.selectSchool(schoolSelectList.find('a'));
            }
        },

        choose: function () {
            var city=$('.course-option-td-content')[0];
            var school=$('.school-select-list')[0];
            var inputA=$('.school-select-input')[0];
            var str = '';
            var cur = '';
            var flag = true;

            for( var k in window.cityData){
                str=str+'<a href="javascript:;" data-cityid="1" data-cityname="'+k+'">'+k+'</a>';
                $(city).html(str);
                $('.course-option-td-content a:first-child').addClass('selected');
                $('.course-option-td-content a').each(function () {
                    $(this).click(function () {
                        if ($(this).attr('class') != 'selected') {
                            $(this).addClass('selected').siblings().removeClass('selected');
                        }
                    });
                });
                var arr=window.cityData[k];
                var selectedClass = 'selected';
                var citiesTd = $('.js-cities');
                var selectedCity = citiesTd.find('.' + selectedClass);
                var cityName = selectedCity.html();

                for(var i in arr){
                    if (i == 0 && flag) {
                        if(arr.length == 1) {
                            schoolSelectInput.html(arr[i].schoolName);
                            schoolId.val(arr[i].id);
                            schoolName.val(arr[i].schoolName);
                        } else {
                            schoolSelectInput.html('请选择校区');
                            schoolId.val('');
                            schoolName.val('');
                        }
                        flag = false;
                    }
                    if(cityName == arr[i].cityName){
                        cur = cur + '<li><a href="javascript:;"data-schoolid="'+arr[i].id+'" data-cityName="'+arr[i].cityName+'">'+arr[i].schoolName+'</a></li>';
                        $(school).html(cur);
                        
                    }
                }
            }
        }
    };

    main.init();
});
