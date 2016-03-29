/**
 * @file
 * Created by baidu on 15/9/29.
 */
$(document).ready(function () {
    // 切换顶部排序tab选项
    initOrderTab();
    // 切换tab选项
    initTab();
    // 显示课程页面
    initOperateBtn();
    // 左边菜单栏随鼠标下移而下移
    scrollLeftMenu();
    // showCoursePage();
    // $("#menuUl").find("li.cur").trigger("click");
    entTagShow();
    var basePath = window.basePath;
    var baseHost = window.baseHost;
    $('img').lazyload({
        placeholder: basePath + '/static/images/def-img.png',
        effect: 'fadeIn'
    });
    // 二级分类数据加载
    // sleveldata();
    removeVerticalBar();
});
function initTab() {
    // 切换tab选项
    $('.csb-ul li').each(function (i) {
        $(this).click(function () {
            $('.csb-ul li').removeClass('cur');
            $(this).addClass('cur');
            $('.course-list-box').eq(i).show().siblings('.course-list-box').hide();
        });
    });
}
/*function addH1() {
    $('.csb-ul li').each(function (i) {
        var innerHtml = $(this).html();
        if ($(this).hasClass('cur')) {
            $(this).html('<h1>' + innerHtml + '</h1>');
        } else {
            $(this).html(innerHtml);
        }
    });
}*/
function initOrderTab() {
    // 切换顶部排序tab选项
    $('.order-tab-a').each(function (i) {
        $(this).click(function () {
            $('.order-tab-a').removeClass('active');
            $(this).addClass('active');
        });
    });
}

function initOperateBtn() {
    //$('#menuUl').find('li').live('click', showCoursePage);
    //$('#order-tab-wrap').find('a').live('click', showCoursePage);
    //$('.pageReslt').live('click', showCoursePage);
    //$('.showCourseDetailBtn').live('click', showCourseDetail); // 显示课程详细
}

// 得到字符串的真实长度（双字节换算为两个单字节）  
function getStrActualLen(sChars) {
    return sChars.replace(/[^x00-xff]/g, 'xx').length;
}

// 异步加载

// 显示课程页面
/*function showCoursePage(){

 // 清空当前HTML内容
 $("#coursePageContentDiv").html("");
 // 拿到类别ID
 var cid = window.cid;
 // 拿到排序ID
 var oid = $('#order-tab-wrap').find('.active').attr('oid');
 oid = oid ? oid : '';
 // 获取当前页码
 var currentPage = $(this).attr('currentpage');
 // 开始loading
 $('#loadingDiv').show();
 $.ajax({
 async:true,
 type:"GET",
 url:'/istudy/categorycoursepage',
 data:{"categoryId":cid,'sortby': oid,"page":currentPage},
 dataType:"json",
 success:function(sourse){
 $("#loadingDiv").hide();
 $("#coursePageContentDiv").show().append(courseRender({data: sourse.result}));
 // 分页
 var page = sourse.pageResult;
 var prePage = page.currentPage-1;
 var nextPage = page.currentPage+1;
 if (page.allPage > 1) {
 $("#coursePageContentDiv").append(pageRender({
 page: page,
 cid: cid,
 oid: oid,
 prePage: prePage,
 nextPage: nextPage
 }));
 };
 },
 error:function(){
 // 发生错误
 $("#loadingDiv").hide();
 alert("服务器正忙，请稍后重试");
 }
 });
 return false;
 }*/


// 添加企业特惠标签
function entTagShow() {
    $('.trb-kc-box').each(function () {
        if ($(this).attr('enterprisetype') === '0') {
            $(this).append('<span class="img-icon">企业特惠</span>');
        }
        $(this).on('mouseover', 'p', function () {
            $(this).addClass('active');
        });
        $(this).on('mouseout', 'p', function () {
            $(this).removeClass('active');
        });
    });
    $('.trb-pd-box').each(
        function () {
            //var cid = $(this).siblings('a').attr('cid');
            //$(this).wrap(
            //        '<a class="showCourseDetailBtn" cid=' + cid
            //                + ' href="javascript:void(0);"></a>');
            $(this).find('.tips-index-box').remove();
        });
//回到顶部
    $(window).scrollTop('0');
}

//左边菜单栏随鼠标下移而下移 
function scrollLeftMenu() {
    $(window).scroll(initLeftMenuHeight);
}

/**
 * 计算左侧高度
 */
function initLeftMenuHeight() {
    var h = $(window).scrollTop();
    if (h > 161) {
        $('.cate-sclbox').css('position', 'fixed');
        $('.cate-sclbox').css('top', '0');
    } else {
        $('.cate-sclbox').css('position', '');
        $('.cate-sclbox').css('top', '');
    }
}
/**
 * 显示课程详细
 function showCourseDetail(){
	var cid = $(this).attr("cid");
	var url = basePath + '/detail?courseId=' + cid;

	// 在新窗口打开
	window.open(url);
	
	return false;
}
 */
// 加载二级分类
function sleveldata() {
    var baseHost = window.baseHost;
    var basePath = window.basePath;
    var categoryData = window.categoryData;
    var levelEname = window.levelEname;
    var DataKey = $.trim($('#menuUl .cur').text());
    if (categoryData[DataKey]) {
        var DataVal = categoryData[DataKey]['slevelDate'];
        var str = '';
        for (var i = 0; i < DataVal.length; i++) {
            var sLevName = DataVal[i]['name'];
            var sLevEname = DataVal[i]['ename'];
            str += '<li><a class="'
            + (sLevEname === levelEname ? 'sel-cru' : '')
            + '" href="' + baseHost + '' + basePath + '/kecheng/'
            + sLevEname + '">'
            + sLevName + '</a><i class="verticalbar">|</i></li>';
        }
        // $('.order-sel-list').append(str);
    }
}
// 移除竖杠
function removeVerticalBar() {
    var orderListLi = $('.order-sel-list li');
    if (orderListLi.length === 1) {
        orderListLi.eq(0).find('i').remove();
    }
    /*var iNum = 1;
    var lineNum = 1;
    for (var i = 0; i < orderListLi.length; i++) {
        if (iNum === 8 * lineNum) {
            orderListLi.eq(8 * lineNum - 1).find('i').remove();
            lineNum++;
        }
        iNum++;
    }*/
}