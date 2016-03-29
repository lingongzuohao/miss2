/**
 * @file
 * Created by baidu on 15/9/29.
 */
$(document).ready(function () {
    initLazyLoadImg(); // 图片延迟加载
    initOperateBtn(); // 初始化操作按钮
    // initPV(); // 初始化PV
    initCategoryHover();
    initHotCourse(); // 首页热门课程hover效果
    initTypeCourse(); // 首页分类课程hover效果
    initEnt(); // 企业特惠标识判断

    // 判断是否需要弹出登录框
    if (needLogin && 'true' == needLogin) {
        baiduPassortInstance.show(); // 显示浮层
    }

});

var basePath = window.basePath;

// 图片延迟加载
function initLazyLoadImg() {
    $('img.lazyload').lazyload({
        placeholder: basePath + '/static/images/def-img.png',
        effect: 'fadeIn'
    });
}

// 初始化操作按钮
function initOperateBtn() {
    for (var i = 1; i <= 5; i++) {
        $('.tlb-color0' + i).find('.moreCourseBtn').live('click',
            showMoreCourse); // 显示更多课程
    }
    // $('.showCourseDetailBtn').live('click', showCourseDetail); // 显示课程详细
    $('.DB_bgSet').find('li').live('click', showBannerLinkUrl); // 先死后轮播图的linkUrl
    // $('.tlb-color05').find('.moreCourseBtn').live('click', entShowMoreCourse); // 企业特惠显示更多课程
}

/**
 * 显示更多课程
 */
function showMoreCourse() {
    var cgid = $(this).attr('cgid');
    var url = basePath + '/kecheng/' + cgid;
    // 在新窗口打开
    window.open(url);
}

/**
 * 显示课程详细
 function showCourseDetail(){
	var cid = $(this).attr("cid");
	var url = basePath + '/detail?courseId=' + cid;

	// 在新窗口打开
	window.open(url);
}
 */

function showBannerLinkUrl() {
    var linkUrl = $(this).attr('linkurl');
    if (linkUrl && linkUrl.length > 0 && linkUrl !== '-') {
        window.open(linkUrl);
    }
}
/**
 * 统计PV
 */
/*function initPV() {
 $.post(basePath + '/pv.htm?m=' + Math.random(), {}, function(data) {
 });
 }*/


function initCategoryHover() {
    $('.hline-box').hover(function () {
        var sline = $(this).siblings('b');
        $(sline).stop().animate({width: '95px'});
    }, function () {
        var sline = $(this).siblings('b');
        $(sline).stop().animate({width: '50px'});
    });
}

// 首页热门课程hover效果
function initHotCourse() {
    $('.cdb-box').each(function () {
        $(this).on('mouseover', 'p', function () {
            $(this).addClass('active');
        });
        $(this).on('mouseout', 'p', function () {
            $(this).removeClass('active');
        });
    });
    // $('.home-wrap').each(
    //        function() {
    //            var cid = $(this).parent().siblings('a').attr('cid');
    //            $(this).wrap(
    //                    '<a class="f1 showCourseDetailBtn" cid=' + cid
    //                            + ' href="javascript:void(0);"></a>');
    //        });
}

// 首页分类课程hover效果
function initTypeCourse() {
    $('.trb-kc-box').each(function () {
        $(this).on('mouseover', 'p', function () {
            $(this).addClass('active');
        });
        $(this).on('mouseout', 'p', function () {
            $(this).removeClass('active');
        });
    });
    $('.trb-pd-box').each(
        function () {
            // var cid = $(this).siblings('a').attr('cid');
            // $(this).wrap(
            //        '<a class="showCourseDetailBtn" cid=' + cid
            //                + ' href="javascript:void(0);"></a>');
            $(this).find('.tips-index-box').remove();
        });
    $('.cdb-box').each(
        function () {
            // var cid = $(this).siblings('a').attr('cid');
            // $(this).wrap(
            //        '<a class="showCourseDetailBtn" cid=' + cid
            //                + ' href="javascript:void(0);"></a>');
            $(this).find('.tips-index-box').remove();
        });
}


/**
 * 企业特惠标识判断
 */
function initEnt() {
    // 首页热门课程
    $('.cb-dtil-box')
        .each(
        function () {
            if ($(this).attr('enterprisetype') === '0') {
                $(this)
                    .append(
                    '<span class="img-icon" title="合作企业的员工可享受企业员工价">企业特惠</span>');
            }
        });
    // 首页分类课程
    $('.trb-kc-box')
        .each(
        function () {
            if ($(this).attr('enterprisetype') === '0') {
                $(this)
                    .append(
                    '<span class="img-icon" title="合作企业的员工可享受企业员工价">企业特惠</span>');
            }
        });
}

/**
 * 企业特惠显示更多课程
 */
//function entShowMoreCourse() {
////  var url = basePath + '/coopdiscount.htm?m=' + Math.random();
//  var url = basePath + '/coopdiscount';
//  // 在新窗口打开
//  window.open(url);
//}
