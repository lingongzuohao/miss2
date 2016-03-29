$(document).ready(function(){
	//切换tab选项
	initTab();
	//显示课程页面
	initOperateBtn();
	//左边菜单栏随鼠标下移而下移 
	scrollLeftMenu();
	$("#menuUl").find("li.cur").trigger("click");
	$("img").lazyload({ 
		placeholder : basePath + "/static/front/base/images/def-img.png",
		effect: "fadeIn"
    });  
});

function initTab(){
	//切换tab选项
	$(".csb-ul li").each(function(i){
		$(this).click(function(){
			$(".csb-ul li").removeClass('cur');
			$(this).addClass('cur');
			$('.course-list-box').eq(i).show().siblings(".course-list-box").hide();
		});
	});
}

function initOperateBtn(){
	$("#menuUl").find("li").live("click",showCoursePage);
	$(".pageReslt").live("click",showCoursePage);
	//$(".showCourseDetailBtn").live("click",showCourseDetail);	//显示课程详细
}
//异步加载
//显示课程页面
function showCoursePage(){
	//清空内容
	//拿到类别ID
	var cid = $(this).attr("cid");
	//获取当前页码
	var currentPage = $(this).attr("currentpage");
	//开始loading
	$("#loadingDiv").show();
	//清空当前HTML内容
	$("#coursePageContentDiv").html("");
	$.ajax({
		async:true,
		type:"POST",
		url:'/istudy/categorycoursepage',
		data:{"categoryId":cid,"page":currentPage},
		dataType:"json",
		success:function(sourse){
			//拼接课程部分HTML
			var str = '';
			for (var i = 0; i < sourse.courseList.result.length; i++ ) {
				var obj = sourse.courseList.result[i];
				str += '<div class="fl trb-kc-box mb20"><a class="showCourseDetailBtn" href="' + basePath + '/detail?courseId=' + obj.id + '">';
				str += '<img height="155" width="233" src="' + obj.listImgUrl + '">';
				str += '<div class="trb-pd-box"><h3 class="es w"><span class="a-link color-555">' + obj.name + '</span></h3>';
				str += '<h4 class="es w">' + obj.institutionName + '</h4>';
				str += '<p>' + obj.shortIntroduce + '</p><div class="clb mt10 h36">';
				if (obj.favorableType == 1) {
					str += '<span class="f12 mt17">￥</span><span class="f24 fb mt5">' + obj.enterprisePrice + '</span><i class="f14 mt15 ml10 tai-line">￥' + parseInt(parseInt(obj.enterprisePrice)+parseInt(obj.favorableVal)) + '</i>';
				} else if (obj.favorableType == 2) {
					str += '<span class="f12 mt17">立减￥</span><span class="f24 fb mt5">' + obj.favorableVal + '</span><i class="f14 mt15 ml10"></i>'
				} else if (obj.favorableType == 3) {
					str += '<span class="f24 fb mt5">' + parseFloat(1-parseFloat(obj.discountVal))*10 + '</span><span class="f14 mr10 mt15">折</span>'
					if(obj.favorableType > 0) {
						str += '<span class="f12 mt17">省' + obj.favorableVal + '</span>';
					}
				};
				str += '</div></div><div class="type-ico-box clb">';
				for (var j = 0; j < obj.tagList.length; j++) {
					if (j <=2) {
						str += '<div class="tip-type-box"><span title="' + obj.tagList[j].desc + '" style="border:1px solid #' + obj.tagList[j].styleBackgroundColor + ';color:#' + obj.tagList[j].styleBackgroundColor + ';" class="type-cb mr5">' + obj.tagList[j].name + '</span></div>';
					};
				};
				str += '</div></a></div>';
			};
			str = '<div class="clb">' + str + '</div>';
			$("#loadingDiv").hide();
			$("#coursePageContentDiv").append(str);
			//回到顶部
			//分页
			var page = sourse.courseList;
			var pageStr = '';
			var prePage = page.currentPage-1;
			var nextPage = page.currentPage+1;
			if (page.allPage > 1) {
				pageStr += '<div class="mt30 clb"><ul class="fr page-ul clb">';
				if (page.currentPage > 1) {
					pageStr += '<li><a title="首页" currentpage="' + page.firstPage + '" cid="' + cid + '" class="pageReslt two-left-page"></a></li>';
					pageStr += '<li><a title="上一页" currentpage="' + prePage + '" cid="' + cid + '" class="pageReslt one-left-page"></a></li>';
				};
				for (var i = 0; i < page.pageBar.length; i++) {
					if (page.currentPage == page.pageBar[i]) {
						pageStr += '<li class="cur"><a currentpage="' + page.pageBar[i] + '" cid="' + cid + '" class="pageReslt">' + page.pageBar[i] + '</a></li>';
					} else{
						pageStr += '<li><a currentpage="' + page.pageBar[i] + '" cid="' + cid + '" class="pageReslt">' + page.pageBar[i] + '</a></li>';
					};
				};
				if (page.currentPage < page.allPage) {
					pageStr += '<li><a title="下一页" currentpage="' + nextPage + '" cid="' + cid + '" class="pageReslt one-right-page"></a></li>';
					pageStr += '<li><a title="尾页" currentpage="' + page.lastPage + '" cid="' + cid + '" class="pageReslt two-right-page"></a></li>';
				};
				pageStr += '</ul></div>';
				$("#coursePageContentDiv").append(pageStr);
			};

			$(window).scrollTop("0");
		},
		error:function(){
			//发生错误
			$("#loadingDiv").hide();
			//alert("服务器正忙，请稍后重试");
		}
	});
	
	return false;
}

//左边菜单栏随鼠标下移而下移 
function scrollLeftMenu(){
	$(window).scroll(initLeftMenuHeight);
}

/**
 * 计算左侧高度
 */
function initLeftMenuHeight(){
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

	//在新窗口打开
	window.open(url);
	
	return false;
}
 */
