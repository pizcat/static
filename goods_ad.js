$(function(){
	if(window.location.href.indexOf("tampermonkey/doc")!=-1 || window.location.href.indexOf("www.tool77.com/wenku")!=-1){
		return;
	}
	
	$.ajax({
		type:"GET", 
		url:"https://eb.xcj.pub/ebusiness/api/goods_ad/show", 
		dataType:"json", 
		timeout:1500,
		success: function(result){
			var data = result.data;
			var status = result.status;
			if(!!data && !!status && status.code==="ok"){
				$("body").append(data);
				$("body").on("click", "#helper_goods_ad_close_87741ii", function(){
					$("#helper_goods_ad_87741ii").remove();
				})
			}
		}
	});
});
