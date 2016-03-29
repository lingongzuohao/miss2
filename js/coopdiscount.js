$(document).ready(function () {
	entTagShow();
    // 切换顶部排序tab选项
    initOrderTab();
    // 显示课程页面
    initOperateBtn();
    // 左边菜单栏随鼠标下移而下移
    scrollLeftMenu();
    $('#order-tab-wrap').find('a.active').trigger('click');
    $('img').lazyload({
        placeholder: basePath + '/static/front/base/images/def-img.png',
        effect: 'fadeIn'
    });
});

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
//  $('#order-tab-wrap').find('a').live('click', showCoursePageByOrder);
//  $('.pageReslt').live('click', showCoursePageByOrder);
//    $('.showCourseDetailBtn').live('click', showCourseDetail); // 显示课程详细
}

// 异步加载
// 显示点击排序后的课程页面
/*function showCoursePageByOrder() {
    //清空当前HTML内容
	$("#coursePageContentDiv").html("");
    // 拿到类别ID
    var cid = '';
    // 拿到排序ID
    var oid = $('#order-tab-wrap').find('.active').attr('oid');
    oid = oid ? oid : '';
    // 获取当前页码
    var currentPage = $(this).attr('currentpage');
    // 开始loading
    $('#loadingDiv').show();
    $.ajax({
        async: true,
        type: 'POST',
        url: '/istudy/api/coopdiscountcoursepage',
        data: {
            'categoryId': cid,
            'sortby': oid,
            'isEnterprise': 0,
            'page': currentPage
        },
        dataType: 'json',
        success: function (sourse) {
            // 获取html代码段
			$('#loadingDiv').hide();
			$("#coursePageContentDiv").show().append(courseRender({data: sourse.result}));
		//分页
			var page = sourse.pageResult;
			var prePage = page.currentPage-1;
			var nextPage = page.currentPage+1;
			if (page.allPage > 1) {
				$("#coursePageContentDiv").append(pageRender({
					page: page,
					cid: cid,
					prePage: prePage,
					nextPage: nextPage
				}));
			};
           
            // 回到顶部
            $(window).scrollTop('0');

        },
        error: function () {
            // 发生错误
            $('#loadingDiv').hide();
               alert("服务器正忙，请稍后重试");
        }
    });

    return false;
}*/

// 左边菜单栏随鼠标下移而下移
function scrollLeftMenu() {
    $(window).scroll(initLeftMenuHeight);
}

 // 添加企业特惠标签
function entTagShow(){
$('.trb-kc-box').each(function () {
    if($(this).attr('enterprisetype') === '0') {
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
$(window).scrollTop("0");
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
function showCourseDetail() {
    var cid = $(this).attr('cid');
    var url = basePath + '/detail?courseId=' + cid;

    // 在新窗口打开
    window.open(url);

    return false;
}
 */
