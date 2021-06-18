window.onload = function () {
	var diyUtil={};
	diyUtil.isPC = function(){
		var screenWidth = this.getScreenSize().screenWidth;
		if(screenWidth>=992){
			return true;
		}
		return false;
	};
	diyUtil.showPopupBox = function(text){
		var $popupbox = $("#popup-box");
		$popupbox.text(text);
		$popupbox.show();
		setTimeout(function(){
			$popupbox.hide();
		},1000);
	};
	diyUtil.getWebRootPath = function(){
		var protocol = window.location.protocol;
		var host = window.location.host;
		if(host.indexOf(".com")==-1){
			return protocol+"//"+host+"/wenku_tool";
		}
		return protocol+"//"+host;
	};
	diyUtil.getScreenSize = function(){
		var screenWidth = window.screen.width;
		var screenHeight = window.screen.height;
		return {"screenWidth":screenWidth, "screenHeight":screenHeight};
	};
	diyUtil.isLogin = function(){
		var uid = $("#current_user_id").val();
		if(!!uid){
			return true;
		}
		return false;
	};
	diyUtil.checkLoginBox = function(){
		$.confirm({
			title: false, // hides the title.
			closeIcon:true,
			animation: 'rotateXR',
			content:"脑洞空间某些功能登录后才能开启，点我登录，马上开启！",
			buttons: {
				点我登录: function(){
		           window.location.href=ROOT+"/login";
		        },
			}
		});
	};
	diyUtil.createQrcode = function(text){
		$('#qrcode-box').empty();
		var qrcode= $('#qrcode-box').qrcode(text).hide(); 
		var canvas=qrcode.find('canvas').get(0);
		return canvas.toDataURL('image/jpg');
	};
	diyUtil.sendNaoDongImage = function(imgData, copyright, title, description, allCategoryId){
		return new Promise(function(resolve, reject) {
			var ROOT = diyUtil.getWebRootPath();
			var params = {"imageData":imgData,
					"allCategoryId":allCategoryId, 
					"copywrite":copyright,
					"title":title,
					"description":description,
					"categoryId":-1
			};
			
			$.ajax({
	            type : "POST",
	            url : ROOT+"/expression/upload",
	            data : params,
	            success : function(result) {
	            	if(result.status == "success"){
	            		resolve({"status":"success", "identification":result.identification});
	            	}else{
	            		if(result.status == "require_login"){
		            		diyUtil.checkLoginBox();
		            	}
	            		reject({"status":"error"});
	            	}
	            },
	            error : function(e){
	            	reject({"status":"error"});
	            }
	        });
			
		});
	};
	
	var isPC = diyUtil.isPC();
	var ROOT = diyUtil.getWebRootPath();
	console.log(ROOT);
	
	//////////////////////////////////////////////////////////
	/// fabric canvas 初始化
	/////////////////////////////////////////////////////////
	var selectOption={ 
        transparentCorners: false,
        cornerColor: '#34A7FC',
        cornerStrokeColor: '#34A7FC',
        borderColor: '#34A7FC',
        cornerSize: 10,
        borderDashArray: [3, 3]
	}
	if(!isPC){ //移动端放大操作
		selectOption.cornerSize=20;
		selectOption.cornerStyle='circle';
	}
	fabric.Object.prototype.set(selectOption);  //改变选框样式
	function init_start(){
		var windowWidth = $(window).width();
		var windowHeight = $(window).height();
		var $mycanvas = $("#sosogif-canvas-container");
		$mycanvas.attr("width", windowWidth);
		$mycanvas.attr("height", windowHeight);
		
		//根据屏幕尺寸，适应大小
		var screenSizeObj = diyUtil.getScreenSize();
		var drawingWidth = parseInt((screenSizeObj.screenWidth-380)/2);
		drawingWidth = drawingWidth>400 ? 400 : drawingWidth;
		var drawingHeight = parseInt((screenSizeObj.screenHeight / 2 - 50));
		
		var showCompleteAreaData={origin_x:parseInt(windowWidth/2), origin_y:20, 
			width: drawingWidth, 
			height:drawingHeight, 
			poly_width:30, 
			min_width:100, 
			min_height:100
		};
		if(!isPC){ //移动端使用其它值
			showCompleteAreaData.origin_y=60;
			showCompleteAreaData.width = screenSizeObj.screenWidth - 30;
		}
		return showCompleteAreaData;
	}
	//初始化一些数据
	var showCompleteAreaData = init_start();
	//fabric操作对象
	var fabricCanvas = new fabric.Canvas('sosogif-canvas-container');
	fabricCanvas.preserveObjectStacking = true;  //激活的图层是否展示在最顶层
	fabricCanvas.isDrawingMode = false;
	fabricCanvas.freeDrawingBrush.color = "#CCC"; //设置画笔初始颜色
	fabricCanvas.freeDrawingBrush.width = 10;     //设置画笔宽度
	var showCompleteAreaRect = new fabric.Rect({  //画布展示矩形
		left: showCompleteAreaData.origin_x - parseInt(showCompleteAreaData.width/2),
		top: showCompleteAreaData.origin_y,
		width: showCompleteAreaData.width,
		height: showCompleteAreaData.height,
		lockMovementX:true,
		lockMovementY:true,
		hoverCursor:"default",
		fill: '#FFFFFF',
		selectable:false,
	});
	//画布展示红三角形
	var rect_left = showCompleteAreaRect.get("left");
	var rect_top = showCompleteAreaRect.get("top");
	var rect_width = showCompleteAreaRect.get("width");
	var rect_height = showCompleteAreaRect.get("height");
	var showCompleteAreaPoly = new fabric.Polyline([
		{ x: rect_left + rect_width, y: rect_top + rect_height },
	    { x: rect_left + rect_width - showCompleteAreaData.poly_width, y: rect_top + rect_height },
	    { x: rect_left + rect_width, y: rect_top + rect_height - showCompleteAreaData.poly_width }
	  ], {
	  	"type":"show_complete_polyline",
		fill: 'red',
		left: rect_left+rect_width - showCompleteAreaData.poly_width,
		top: rect_top+rect_height - showCompleteAreaData.poly_width,
		lockScalingFlip: true, //控制缩放翻转
    	lockUniScaling: false, //控制四个正方向缩放
    	hasRotatingPoint: false, //旋转点
    	lockRotation:true,
    	lockSkewingX:true,
    	lockSkewingY:true,
    	lockScalingX:true,
    	lockScalingY:true,
    	selectable:false,
    	hoverCursor:"se-resize",
		moveCursor:"se-resize",
    	borderColor: 'transparent', //描边颜色
    	cornerSize: 0, //边角大小
	});
	fabricCanvas.add(showCompleteAreaRect); //此对象处于最底层
	fabricCanvas.add(showCompleteAreaPoly); //此对象处于最顶层
	showCompleteAreaPoly.on('moving', function(options) {  //三角移动操作监听
		//获得三角形原点坐标
		var offset_top = options.target.top;
		var offset_left = options.target.left;
		
		//计算最小坐标系
		var min_offset_left = showCompleteAreaData.origin_x + parseInt(showCompleteAreaData.min_width/2) - showCompleteAreaData.poly_width;
		var min_offset_top = showCompleteAreaData.origin_y + showCompleteAreaData.min_height - showCompleteAreaData.poly_width;
		
		//重置为最小坐标系
		if(offset_top < min_offset_top) offset_top = min_offset_top;
		if(offset_left < min_offset_left) offset_left = min_offset_left;
		
		//矩形的右下角点
		var rect_offset_top = offset_top + showCompleteAreaData.poly_width;
		var rect_offset_left = offset_left + showCompleteAreaData.poly_width;
		
		//矩形的宽高
		var change_rect_width = (rect_offset_left - showCompleteAreaData.origin_x) * 2;
		var change_rect_height = rect_offset_top - showCompleteAreaData.origin_y;
		
		//获得矩形左上角
		var rect_top = showCompleteAreaRect.get("top");
		var change_rect_left = rect_offset_left - change_rect_width;
		var change_rect_top = rect_top;

		//重置矩形数据
		showCompleteAreaRect.set({
			"width":change_rect_width,
			"height":change_rect_height,
			"top":change_rect_top,
			"left":change_rect_left
		});
		
		//重置三角数据
		showCompleteAreaPoly.set({"left":offset_left});
		showCompleteAreaPoly.set({"top":offset_top});
	});
	//////////////////////////////////////////////////////////
	/// fabric canvas 初始化
	/////////////////////////////////////////////////////////
	
	
	//////////////////////////////////////////////////////////
	/// fabric canvas 常用操作方法
	/////////////////////////////////////////////////////////
	var updateShowCompleteLayer = function(){
		fabricCanvas.sendToBack(showCompleteAreaRect);       //把矩形移动到最底部
	    fabricCanvas.bringToFront(showCompleteAreaPoly);     //把三角形移动到最顶部
	};
    var getSelected = function () {
        return fabricCanvas.getActiveObject();
    };
    var removeSelected = function () {
        var activeObjects = fabricCanvas.getActiveObjects();
        fabricCanvas.discardActiveObject()
        var length = activeObjects.length;
        if (length != 0) {
        	var copyActiveObjects = new Array();
        	for(var i=0; i<length ;i++){
        		//画布预览区，不可删除
        		if(activeObjects[i].get("type")!="show_complete_polyline"){
        			copyActiveObjects.push(activeObjects[i]);
        		}
        	}
            fabricCanvas.remove.apply(fabricCanvas, copyActiveObjects);
        };
        
        //一处元素，图片编辑菜单必须隐藏
        imageEditorTool.hideUI();
    };
    var sendBackwards = function () {
        var activeObject = fabricCanvas.getActiveObject();
        if (activeObject) {
            fabricCanvas.sendBackwards(activeObject,false);
        }
		updateShowCompleteLayer();
        refreshCanvas();
    };
    var sendToBack = function () {
        var activeObject = fabricCanvas.getActiveObject();
        if (activeObject) {
            fabricCanvas.sendToBack(activeObject);
        }
		updateShowCompleteLayer();
        refreshCanvas();
    };
    var bringForward = function () {
        var activeObject = fabricCanvas.getActiveObject();
        if (activeObject) {
            fabricCanvas.bringForward(activeObject,false);
        }
		updateShowCompleteLayer();
        refreshCanvas();
    };
    var bringToFront = function () {
        var activeObject = fabricCanvas.getActiveObject();
        if (activeObject) {
            fabricCanvas.bringToFront(activeObject);
        }
		updateShowCompleteLayer();
        refreshCanvas();
    };
    var lock = function () {
        var activeObject = fabricCanvas.getActiveObject();
        if (!activeObject) return;
        if (activeObject) {
            activeObject.lockMovementX = true;
            activeObject.lockMovementY = true;
            activeObject.lockScalingX = true;
            activeObject.lockScalingY = true;
            activeObject.lockRotation = true;
        }
    };
    var unlock = function () {
        var activeObject = fabricCanvas.getActiveObject();
        activeObject.lockMovementX = false;
        activeObject.lockMovementY = false;
        activeObject.lockScalingX = false;
        activeObject.lockScalingY = false;
        activeObject.lockRotation = false;
    };
	var updateCurrentSelectedCanvasObj = function(color){ //更新当前选中对象的背景色
    	var selectedObject = getSelected();
    	if(!selectedObject) return;
    	var type = selectedObject.get("type");
    	if("path"===type){
    		selectedObject.set({"stroke":color});
    	}else{
    		selectedObject.set({"fill":color});
    	}
   	};
    var updateBrushColor = function(color){ //更新刷子的颜色
    	fabricCanvas.freeDrawingBrush.color=color;
    };
    var refreshCanvas = function(){ //刷新画板
    	fabricCanvas.renderAll();
    };
    var requestRenderAll = function(){
    	fabricCanvas.requestRenderAll();
    }
    var addFabricObject = function(object){
    	fabricCanvas.add(object);
    };
    
    var addFabricCanvasTool={};
    addFabricCanvasTool.showNewObjectPosition = function(w, h){
    	var screenObj = diyUtil.getScreenSize();
		var screenWidth = screenObj.screenWidth;
		var screenHeight = screenObj.screenHeight;
		var left = (screenWidth - parseInt(w))/2
		var top = screenHeight - parseInt(h)-300;
		return {"left":left, "top":top};
    };
	addFabricCanvasTool.addIText=function(w, h, isFixed){
		var position = this.showNewObjectPosition(0, 0);
		if(isFixed){
			position.left = w;
			position.top = h;
		}
		var text = new fabric.IText("请输入文字", { 
			"left": position.left, 
			"top": position.top,
			"fill":'#000',
			"fontSize":20,
			"textAlign": 'left',
			"fontStyle": 'normal',
			"fontWeight": 'normal',
			"underline": false,
  			"fontFamily": 'SimSun'
		});
		addFabricObject(text);
	};
	addFabricCanvasTool.addImage=function(str){
		fabric.Image.fromURL(str, function(imgObj) {
			var width = imgObj.width;
			var height = imgObj.height;
			var scaleValue = (200/width).toFixed(2);
			
			var position = addFabricCanvasTool.showNewObjectPosition(scaleValue*width, scaleValue*height);
			var left = position.left;
			var top = position.top;
			imgObj.scale(scaleValue).set({'flipX':true, "left":left, "top":top, "opacity":1});
			fabricCanvas.add(imgObj);
		});	
	};
    //////////////////////////////////////////////////////////
	/// fabric canvas 常用操作方法
	/////////////////////////////////////////////////////////
    
    
	//////////////////////////////////////////////////////////
	/// 画笔宽度 range控制
	/////////////////////////////////////////////////////////
	var $inputRangeBrushWidth = $('#input-range-brush-width').bootstrapSlider();  //画笔宽度range
	var inputRangeTool={};
	inputRangeTool.showBrushWidthArea=function(){
		inputRangeTool.hideAllToolUI();  //隐藏所有range操作ui
		fabricCanvas.isDrawingMode=true;  //激活画笔模式
		$inputRangeBrushWidth.bootstrapSlider('setValue', fabricCanvas.freeDrawingBrush.width);   //初始化画笔宽度
		$("#brush-width-area").show();
	};
	inputRangeTool.hideBrushWidthArea=function(){
		fabricCanvas.isDrawingMode=false;  //取消画笔模式
		$("#brush-width-area").hide();
	};
	$inputRangeBrushWidth.on("change" ,function(e){
		var newValue = e.value.newValue;
		$("#input-range-brush-text").text(newValue);
		fabricCanvas.freeDrawingBrush.width=newValue;
	});
	inputRangeTool.hideAllToolUI=function(){  //开启画笔，需要关闭所有弹窗类工具
		imageEditorTool.hideUI();
	};
	//////////////////////////////////////////////////////////
	/// 画笔宽度 range控制
	/////////////////////////////////////////////////////////
	
	
	//////////////////////////////////////////////////////////
	/// 左侧菜单控制
	/////////////////////////////////////////////////////////
	var colorPickerTool={};
	colorPickerTool.updateColor=function(color) { //更新颜色,需要重绘画板
　　　　var hexColor = "transparent";
　　　　if(color) {
　　　　　　hexColor = color.toHexString();
　　　　}
　　　　$(".item-color-pickup").css("background-color", hexColor);
		updateCurrentSelectedCanvasObj(hexColor); //更新当前选操作图形的背景颜色
		updateBrushColor(hexColor);
		refreshCanvas();
　　}
    colorPickerTool.beforePickupColorShow=function(){ //打开颜色选择器时,初始化选择器颜色
    	var backgroundColor = $(".item-color-pickup").css("background-color");
    	$(".item-color-pickup").spectrum("set", backgroundColor);
    }
    colorPickerTool.setItemBrushBtnBackgroundColor=function(color){  //设置颜色操作按钮的颜色
    	if(!color){
    		color = "#FFF";
    	}
    	$(".item-color-pickup").css("background-color", color);
    }
    //颜色选择器
    $(".item-color-pickup").spectrum({
    	showButtons: false,//隐藏选择取消按钮
    	showInput: true,
    	clickoutFiresChange: true,//单击选择器外部,如果颜色有改变则应用
    	showPalette: true,//显示选择器面板
		showPaletteOnly: true,//只显示选择器面板
		hideAfterPaletteSelect: true,//选择颜色后自动隐藏面板
		togglePaletteOnly: true,//切换面板
		showSelectionPalette: true,//记住选择过的颜色
		togglePaletteMoreText: "更多",//展开面板,按钮文字
		togglePaletteLessText: "收起",//收缩面板,按钮文字
    	preferredFormat: "hex", //输入框颜色格式
		containerClassName: "full-spectrum",
		maxPaletteSize: 5,
		color: "#FFF",
		palette: [
			["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)", "rgb(153, 153, 153)","rgb(183, 183, 183)","rgb(204, 204, 204)", 
			"rgb(217, 217, 217)", "rgb(239, 239, 239)", "rgb(243, 243, 243)", "rgb(255, 255, 255)", "rgb(152, 0, 0)", "rgb(255, 0, 0)", 
			"rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)","rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", 
			"rgb(255, 0, 255)","rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)",
	　　　　"rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)",
	　　　　"rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)",
	　　　　"rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)",
	　　　　"rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)",
	　　　　"rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)",
	　　　　"rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)",
	　　　　"rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)",
	　　　　"rgb(133, 32, 12)", "rgb(153, 0, 0)", "rgb(180, 95, 6)", "rgb(191, 144, 0)", "rgb(56, 118, 29)",
	　　　　"rgb(19, 79, 92)"]
　　　　],
	　　move: function (color) {
		　　colorPickerTool.updateColor(color);　　
		},
		show: function () {},
	　　beforeShow: function () {
			colorPickerTool.beforePickupColorShow();
	　　},
	　　hide: function (color) {
	　　　　colorPickerTool.updateColor(color);
	　　},
    });
    //移出图层
    $(".item-delete").on("click", function(){
    	removeSelected();
    });
    //图层置顶部
    $(".item-layer-to-top").on("click", function(){
    	bringToFront();
    })
    //图层上移
    $(".item-layer-up").on("click", function(){
    	bringForward();
    });
    //图层下移
    $(".item-layer-down").on("click", function(){
    	sendBackwards();
    });
    //图层置底
    $(".item-layer-to-bottom").on("click", function(){
    	sendToBack();
    })
    //激活画笔
    $(".item-brush").on("click", function(){
    	var $this = $(this);
    	var backgroundColor="#FFF";
    	if($this.hasClass("active")){ //关闭画笔
			var selectedObject = getSelected();
			if(!!selectedObject){
				var target = selectedObject.target;
    			backgroundColor = target.fill;
			}
			$this.removeClass("active");
			inputRangeTool.hideBrushWidthArea();
			diyUtil.showPopupBox("关闭画笔");
		}else{ //激活画笔
			$this.addClass("active");
			backgroundColor = fabricCanvas.freeDrawingBrush.color;
			inputRangeTool.showBrushWidthArea();
			diyUtil.showPopupBox("激活画笔");
		}
		colorPickerTool.setItemBrushBtnBackgroundColor(backgroundColor);
    });
    
    var iTextMenuTool={};
    iTextMenuTool.hideTextTool=function(){
    	$("#second-text-tools").hide();
    };
    iTextMenuTool.showTextTool=function(){
    	$("#second-text-tools").show();
    };
    iTextMenuTool.initTextTool=function(selectedObject){
    	var fontStyle = selectedObject.fontStyle;
    	var fontWeight = selectedObject.fontWeight;
    	var underline = selectedObject.underline;
    	var textAlign = selectedObject.textAlign;
    	var fontFamily = selectedObject.fontFamily;
    	$("#second-text-tools").find(".item").each(function(){
    		var itemValue = $(this).data("item");
    		if(!!itemValue){
    			if(itemValue.indexOf("fontStyle")!=-1){
	    			if("italic"===fontStyle){
	    				$(this).addClass("active");
	    			}else{
	    				$(this).removeClass("active");
	    			}
	    		}else if(itemValue.indexOf("fontWeight")!=-1){
	    			if("bold"===fontWeight){
	    				$(this).addClass("active");
	    			}else{
	    				$(this).removeClass("active");
	    			}
	    		}else if(itemValue.indexOf("underline")!=-1){
	    			if(underline){
	    				$(this).addClass("active");
	    			}else{
	    				$(this).removeClass("active");
	    			}
	    		}else if(itemValue.indexOf("textAlign")!=-1){
	    			if(itemValue.indexOf(textAlign)!=-1){
	    				$(this).addClass("active");
	    			}else{
	    				$(this).removeClass("active");
	    			}
	    		}else if(itemValue.indexOf("fontFamily")!=-1){
	    			$(this).find("select").find("option").each(function(){
	    				if($(this).css("font-family") == fontFamily){
	    					$(this).attr('selected','selected');
	    				}else{
	    					$(this).removeAttr('selected');
	    				}
	    			});
	    		}
    		}
    	});
    	refreshCanvas();
    };
    iTextMenuTool.registerEvent=function(){
		$('#second-text-tools div.item').on("click", function(){
			var itemValue = $(this).data("item");
			if(!itemValue) return;
			
			var currentActiveObject = getSelected();
			if(!currentActiveObject) return;
			
			if(currentActiveObject.get("type")!="i-text") return;
			
			if(itemValue==="fontWeight"){
				if($(this).hasClass("active")){
					currentActiveObject.set({"fontWeight":"normal"});
				}else{
					currentActiveObject.set({"fontWeight":"bold"});
				}
			}else if(itemValue==="fontStyle"){
				if($(this).hasClass("active")){
					currentActiveObject.set({"fontStyle":"normal"});
				}else{
					currentActiveObject.set({"fontStyle":"italic"});
				}
			}else if(itemValue==="underline"){
				if($(this).hasClass("active")){
					currentActiveObject.set({"underline":false});
				}else{
					currentActiveObject.set({"underline":true});
				}
			}else if(itemValue==="textAlign_center"){
				if($(this).hasClass("active")){
					currentActiveObject.set({"textAlign":"left"});
				}else{
					currentActiveObject.set({"textAlign":"center"});
				}
			}else if(itemValue==="textAlign_left"){
				if($(this).hasClass("active")){
					currentActiveObject.set({"textAlign":"left"});
				}else{
					currentActiveObject.set({"textAlign":"left"});
				}
			}else if(itemValue==="textAlign_right"){
				if($(this).hasClass("active")){
					currentActiveObject.set({"textAlign":"left"});
				}else{
					currentActiveObject.set({"textAlign":"right"});
				}
			}
			iTextMenuTool.initTextTool(currentActiveObject);
		});
		$('#second-text-tools div.select-font-family>select').on("change", function(){
			
			var currentActiveObject = getSelected();
			if(!currentActiveObject) return;
			
			var $option = $(this).children("option:selected");
			var css = $option.css("font-family");
			if(!!css){
				currentActiveObject.set({"fontFamily":css});
			}
			iTextMenuTool.initTextTool(currentActiveObject);
		});
    };
    
    iTextMenuTool.registerEvent();
	//////////////////////////////////////////////////////////
	/// 左侧菜单控制
	/////////////////////////////////////////////////////////
    
    
	//////////////////////////////////////////////////////////
	/// 图片编辑
	/////////////////////////////////////////////////////////
    var imageEditorTool = {};
    imageEditorTool.imagefilters=fabric.Image.filters;
    imageEditorTool.imageFilterInputRanges={
    	"$range_opacity":$("#range_opacity").bootstrapSlider(),
    	"$range_brightness":$("#range_brightness").bootstrapSlider(),
    	"$range_contrast":$("#range_contrast").bootstrapSlider(),
    	"$range_saturation":$("#range_saturation").bootstrapSlider(),
    	"$range_noise":$("#range_noise").bootstrapSlider(),
    	"$range_pixelate":$("#range_pixelate").bootstrapSlider(),
    	"$range_blur":$("#range_blur").bootstrapSlider(),
    	"$range_hue":$("#range_hue").bootstrapSlider()
    };
    imageEditorTool.imageFilterIDs=[
    	"color_black_white", "color_sepia", "color_emboss", "color_sharpen", "color_invert", 
    	"color_technicolor", "color_polaroid", "color_vintage", "color_kodachrome",
    	"range_brightness", "range_gamma", "range_contrast", "range_saturation", "range_noise",
    	"range_pixelate", "range_blur", "range_hue"
    ];
    imageEditorTool.reset = function(){
    	var selectedObject = getSelected();
    	//其它效果
    	selectedObject.filters=[];
    	selectedObject.applyFilters();
    	//透明度
    	selectedObject.set({"opacity":1});
		
    	refreshCanvas();
    	this.resetUI();
    }
    imageEditorTool.resetUI = function(){
    	this.imageFilterInputRanges.$range_opacity.bootstrapSlider('setValue', 1);
    	this.imageFilterInputRanges.$range_brightness.bootstrapSlider('setValue', 0.1);
		this.imageFilterInputRanges.$range_contrast.bootstrapSlider('setValue', 0);
		this.imageFilterInputRanges.$range_saturation.bootstrapSlider('setValue', 0);
		this.imageFilterInputRanges.$range_noise.bootstrapSlider('setValue', 0);
		this.imageFilterInputRanges.$range_pixelate.bootstrapSlider('setValue', 0);
		this.imageFilterInputRanges.$range_blur.bootstrapSlider('setValue', 0);
		this.imageFilterInputRanges.$range_hue.bootstrapSlider('setValue', 0);
		$("input[type='checkbox']").prop({checked:false});
    };
    imageEditorTool.showUI = function(){
    	$(".image-editor-tool-box").show();
    	$(".image-editor-tool-box").find(".piece-2").hide();
    };
    imageEditorTool.hideUI = function(){
    	$(".image-editor-tool-box").hide();
    };
    imageEditorTool.init = function(selectedObject){
    	var filters = selectedObject.filters;
    	var imageFilterIDs = this.imageFilterIDs;
    	
    	//全部恢复原状
    	this.resetUI();
    	
    	for(var i=0; i<filters.length; i++){
    		if(!filters[i]){
    			continue;
    		}
    		if(imageFilterIDs[i].indexOf("color_") != -1){  //初始化颜色调整
    			var $obj = $('#'+imageFilterIDs[i]+'');
    			$obj.prop("checked",true);
    			imageEditorTool.applyFilter($obj, imageEditorTool.createFilter(imageFilterIDs[i]));
    		}
    		if(imageFilterIDs[i].indexOf("range_") != -1){ //初始化效果调整
    			var filterName = imageFilterIDs[i];
    			if(filterName == "range_brightness"){
    				var value = filters[i].brightness;
    				this.imageFilterInputRanges.$range_brightness.bootstrapSlider('setValue', value);
    			}
    			if(filterName == "range_contrast"){
    				var value = filters[i].contrast;
    				this.imageFilterInputRanges.$range_contrast.bootstrapSlider('setValue', value);
    			}
    			if(filterName == "range_saturation"){
    				var value = filters[i].saturation;
    				this.imageFilterInputRanges.$range_saturation.bootstrapSlider('setValue', value);
    			}
    			if(filterName == "range_noise"){
    				var value = filters[i].noise;
    				this.imageFilterInputRanges.$range_noise.bootstrapSlider('setValue', value);
    			}
    			if(filterName == "range_pixelate"){
    				var value = filters[i].blocksize;
    				this.imageFilterInputRanges.$range_pixelate.bootstrapSlider('setValue', value);
    			}
    			if(filterName == "range_blur"){
    				var value = filters[i].blur;
    				this.imageFilterInputRanges.$range_blur.bootstrapSlider('setValue', value);
    			}
    			if(filterName == "range_hue"){
    				var value = filters[i].rotation;
    				this.imageFilterInputRanges.$range_hue.bootstrapSlider('setValue', value);
    			}
    		}
    	}
    	if(!!selectedObject.opacity){
    		selectedObject.set({"opacity":selectedObject.opacity});
    		this.imageFilterInputRanges.$range_opacity.bootstrapSlider('setValue', selectedObject.opacity);
    	}
    	if(isPC) this.showUI();
    	
    };
    imageEditorTool.createFilter = function(filterID){
    	var filterObj = null;
    	if(filterID == "color_black_white"){
    		filterObj = new imageEditorTool.imagefilters.BlackWhite();
    	}
    	if(filterID == "color_sepia"){
    		filterObj = new imageEditorTool.imagefilters.Sepia();
    	}
    	if(filterID == "color_emboss"){
    		filterObj = new imageEditorTool.imagefilters.Convolute({
    			matrix: [ 1,   1,  1,
    				1, 0.7, -1,
    				-1,  -1, -1 ]
    		});
    	}
    	if(filterID == "color_sharpen"){
    		filterObj = new imageEditorTool.imagefilters.Convolute({
    			matrix: [0, -1,  0,
    				-1,  5, -1,
    				0, -1,  0 ]
    		});
    	}
    	if(filterID == "color_invert"){
    		filterObj = new imageEditorTool.imagefilters.Invert();
    	}
    	if(filterID == "color_technicolor"){
    		filterObj = new imageEditorTool.imagefilters.Technicolor();
    	}
    	if(filterID == "color_polaroid"){
    		filterObj = new imageEditorTool.imagefilters.Polaroid();
    	}
    	if(filterID == "color_vintage"){
    		filterObj = new imageEditorTool.imagefilters.Vintage();
    	}
    	if(filterID == "color_kodachrome"){
    		filterObj = new imageEditorTool.imagefilters.Kodachrome();
    	}
    	return filterObj;
    };
    
    imageEditorTool.applyFilter = function($ele, filter) {
    	var index = 0;
    	var idStr = $($ele).attr("id");
    	for(var i=0; i<this.imageFilterIDs.length; i++){
    		if(idStr.indexOf(this.imageFilterIDs[i])!=-1){
    			index = i;
    			break;
    		}
    	}
		var selectedObject = getSelected();
		if(!!selectedObject && selectedObject.get("type")=="image"){
			selectedObject.filters[index] = filter;
			selectedObject.applyFilters();
			refreshCanvas();
		}
    };
    imageEditorTool.applyFilterValue = function(idStr, prop, value){
    	var index = 0;
    	for(var i=0; i<this.imageFilterIDs.length; i++){
    		if(idStr.indexOf(this.imageFilterIDs[i])!=-1){
    			index = i;
    			break;
    		}
    	}
    	var selectedObject = getSelected();
    	if(!!selectedObject && selectedObject.get("type")=="image"){
    		if(!selectedObject.filters[index]){ //如果是空，则注册    			
    			if(prop=="brightness"){
    				selectedObject.filters[index] = new imageEditorTool.imagefilters.Brightness({
    					brightness: parseFloat(value)
    				})
    			}else if(prop=="contrast"){
    				selectedObject.filters[index] = new imageEditorTool.imagefilters.Contrast({
    					contrast: parseFloat(value)
    				})
    			}else if(prop=="saturation"){
    				selectedObject.filters[index] = new imageEditorTool.imagefilters.Saturation({
    					saturation: parseFloat(value)
    				})
    			}else if(prop=="noise"){
    				selectedObject.filters[index] = new imageEditorTool.imagefilters.Noise({
    					noise: parseFloat(value)
    				})
    			}else if(prop=="blocksize"){
    				selectedObject.filters[index] = new imageEditorTool.imagefilters.Pixelate({
    					blocksize: parseFloat(value)
    				})
    			}else if(prop=="blur"){
    				selectedObject.filters[index] = new imageEditorTool.imagefilters.Blur({
    					value: parseFloat(value)
    				})
    			}else if(prop=="rotation"){
    				selectedObject.filters[index] = new imageEditorTool.imagefilters.HueRotation({
    					rotation: value
    				})
    			}
    		}
    		if(prop=="alpha"){ //调节透明度需要特殊处理
    			selectedObject.set({"opacity":value});
    		}else{
    			selectedObject.filters[index][prop] = value;
        		selectedObject.applyFilters();
    		}
    		refreshCanvas();
    	}
    };
    imageEditorTool.eventRegister = function(){
    	$("#color_black_white").on("click", function(){
    		imageEditorTool.applyFilter($(this), $(this).is(':checked') && imageEditorTool.createFilter($(this).attr("id")));
    	});
    	$("#color_sepia").on("click", function(){
    		imageEditorTool.applyFilter($(this), $(this).is(':checked') && imageEditorTool.createFilter($(this).attr("id")));
    	});
    	$("#color_emboss").on("click", function(){
    		imageEditorTool.applyFilter($(this), $(this).is(':checked') && imageEditorTool.createFilter($(this).attr("id")));
    	});
    	$("#color_sharpen").on("click", function(){
    		imageEditorTool.applyFilter($(this), $(this).is(':checked') && imageEditorTool.createFilter($(this).attr("id")));
    	});
    	$("#color_invert").on("click", function(){
    		imageEditorTool.applyFilter($(this), $(this).is(':checked') && imageEditorTool.createFilter($(this).attr("id")));
    	});
    	$("#color_technicolor").on("click", function(){
    		imageEditorTool.applyFilter($(this), $(this).is(':checked') && imageEditorTool.createFilter($(this).attr("id")));
    	});
    	$("#color_polaroid").on("click", function(){
    		imageEditorTool.applyFilter($(this), $(this).is(':checked') && imageEditorTool.createFilter($(this).attr("id")));
    	});
    	$("#color_vintage").on("click", function(){
    		imageEditorTool.applyFilter($(this), $(this).is(':checked') && imageEditorTool.createFilter($(this).attr("id")));
    	});
    	$("#color_kodachrome").on("click", function(){
    		imageEditorTool.applyFilter($(this), $(this).is(':checked') && imageEditorTool.createFilter($(this).attr("id")));
    	});
    	var $range_opacity = imageEditorTool.imageFilterInputRanges.$range_opacity;
    	var $range_brightness = imageEditorTool.imageFilterInputRanges.$range_brightness;
    	var $range_contrast = imageEditorTool.imageFilterInputRanges.$range_contrast;
    	var $range_saturation = imageEditorTool.imageFilterInputRanges.$range_saturation;
    	var $range_noise = imageEditorTool.imageFilterInputRanges.$range_noise;
    	var $range_pixelate = imageEditorTool.imageFilterInputRanges.$range_pixelate;
    	var $range_blur = imageEditorTool.imageFilterInputRanges.$range_blur;
    	var $range_hue = imageEditorTool.imageFilterInputRanges.$range_hue;
    	
    	$range_opacity.on("change", function(e){
    		var newValue = e.value.newValue;
			var selectedObject = getSelected();
			if(!selectedObject) return;
			var type = selectedObject.get("type"); //path:线条  , image:图片, rect:长方形
			if("image"===type){
				imageEditorTool.applyFilterValue("range_opacity", 'alpha', newValue);
				$range_opacity.bootstrapSlider('setValue', newValue);
			}
    	});
    	
    	$range_brightness.on("change", function(e){
    		var newValue = e.value.newValue;
			var selectedObject = getSelected();
			if(!selectedObject) return;
			var type = selectedObject.get("type"); //path:线条  , image:图片, rect:长方形
			if("image"===type){
				imageEditorTool.applyFilterValue("range_brightness", 'brightness', parseFloat(newValue));
				$range_brightness.bootstrapSlider('setValue', newValue);
			}
    	});
    	
    	$range_contrast.on("change", function(e){
    		var newValue = e.value.newValue;
			var selectedObject = getSelected();
			if(!selectedObject) return;
			var type = selectedObject.get("type"); //path:线条  , image:图片, rect:长方形
			if("image"===type){
				imageEditorTool.applyFilterValue("range_contrast", 'contrast', parseFloat(newValue));
				$range_contrast.bootstrapSlider('setValue', newValue);
			}
    	});
    	
    	$range_saturation.on("change", function(e){
    		var newValue = e.value.newValue;
			var selectedObject = getSelected();
			if(!selectedObject) return;
			var type = selectedObject.get("type"); //path:线条  , image:图片, rect:长方形
			if("image"===type){
				imageEditorTool.applyFilterValue("range_saturation", 'saturation', parseFloat(newValue));
				$range_saturation.bootstrapSlider('setValue', newValue);
			}
    	});
    	
    	$range_noise.on("change", function(e){
    		var newValue = e.value.newValue;
			var selectedObject = getSelected();
			if(!selectedObject) return;
			var type = selectedObject.get("type"); //path:线条  , image:图片, rect:长方形
			if("image"===type){
				imageEditorTool.applyFilterValue("range_noise", 'noise', parseFloat(newValue));
				$range_noise.bootstrapSlider('setValue', newValue);
			}
    	});
    	
    	$range_pixelate.on("change", function(e){
    		var newValue = e.value.newValue;
			var selectedObject = getSelected();
			if(!selectedObject) return;
			var type = selectedObject.get("type"); //path:线条  , image:图片, rect:长方形
			if("image"===type){
				imageEditorTool.applyFilterValue("range_pixelate", 'blocksize', parseFloat(newValue));
				$range_pixelate.bootstrapSlider('setValue', newValue);
			}
    	});
    	
    	
    	$range_blur.on("change", function(e){
    		var newValue = e.value.newValue;
			var selectedObject = getSelected();
			if(!selectedObject) return;
			var type = selectedObject.get("type"); //path:线条  , image:图片, rect:长方形
			if("image"===type){
				imageEditorTool.applyFilterValue("range_blur", 'blur', parseFloat(newValue));
				$range_blur.bootstrapSlider('setValue', newValue);
			}
    	});
    	
    	$range_hue.on("change", function(e){
    		var newValue = e.value.newValue;
			var selectedObject = getSelected();
			if(!selectedObject) return;
			var type = selectedObject.get("type"); //path:线条  , image:图片, rect:长方形
			if("image"===type){
				imageEditorTool.applyFilterValue("range_hue", 'rotation', parseFloat(newValue));
				$range_hue.bootstrapSlider('setValue', newValue);
			}
    	});
    	
    	$("#image-editor-tool-reset").on("click", function(){
    		imageEditorTool.reset();
    	});
    	$("#image-editor-tool-open-close").on("click", function(){
    		var text = $(this).text();
    		if(text.indexOf("更多效果")!=-1){
    			text = '<i class="fa fa-angle-double-up" aria-hidden="true"></i>收起';
    		}else{
    			text = '<i class="fa fa-angle-double-down" aria-hidden="true"></i>更多效果';
    		}
    		$(this).html(text);
    		$(this).parents(".image-editor-tool-box").find(".piece-2").toggle();
    	})
    };
    imageEditorTool.eventRegister();
	//////////////////////////////////////////////////////////
	/// 图片编辑
	/////////////////////////////////////////////////////////
    
   	//////////////////////////////////////////////////////////
	/// 预览区域操作, 主要是放缩功能
	/////////////////////////////////////////////////////////
    function isInnerShowCompletePolyline(cursor_x, cursor_y){   //判断鼠标当前是否在显示操作三角之内
    	var drawWidth = showCompleteAreaPoly.width;
    	var drawHeight = showCompleteAreaPoly.height;
    	var x = showCompleteAreaPoly.left;
    	var y = showCompleteAreaPoly.top;
    	var isInner = x <= cursor_x && x + drawWidth >= cursor_x && y <= cursor_y && y + drawHeight >= cursor_y;
    	if(isInner){
    		showCompleteAreaPoly.set("selectable",true);
    	}else{
    		showCompleteAreaPoly.set("selectable",false);
    	}
    }
    //鼠标左键按下前执行
    fabricCanvas.on("mouse:down:before", function(options){
    	isInnerShowCompletePolyline(options.pointer.x, options.pointer.y);
    });
    //鼠标左键抬起前执行
    fabricCanvas.on('mouse:up:before', function(options) {
		showCompleteAreaPoly.set("selectable",false);
	});
	//////////////////////////////////////////////////////////
	/// 预览区域操作
	/////////////////////////////////////////////////////////
	
	
	//////////////////////////////////////////////////////////
	/// fabric canvas 画板事件监听
	/////////////////////////////////////////////////////////
	fabricCanvas.on("mouse:down", function(options){  //鼠标按下时执行
		
		var selectedObject = getSelected();  //获取当前选中的对象
		var currentObjectColor = null;       //当前选择元素的颜色,线条颜色,背景颜色等
		
		iTextMenuTool.hideTextTool();             //隐藏itext操作菜单
		updateShowCompleteLayer();   //更新完成展示局域层级
		imageEditorTool.hideUI();      //图片编辑菜单必须隐藏
		
		if(!!selectedObject){ //如果选中的对象存在,则:
			var type = selectedObject.get("type"); //path:线条  , image:图片, rect:长方形
			
			//1 不是画笔模式,需要更新颜色
			if(!fabricCanvas.isDrawingMode){ 
				if("path"===type){
					currentObjectColor = selectedObject.stroke;
				}else{
					currentObjectColor = selectedObject.fill;
				}
			}
			//2 如果是选择的文编,则初始化文本菜单栏
			if("i-text"===type){
				iTextMenuTool.initTextTool(selectedObject);
				iTextMenuTool.showTextTool();
			}
			//3 如果选择的图片对象,则初始化操作菜单
			if("image"===type){
				imageEditorTool.init(selectedObject);
				
				//动态检测选中状态
				var imageFilterIDs = imageEditorTool.imageFilterIDs;
	    		for (var i = 0; i < imageFilterIDs.length; i++) {
	    			if(imageFilterIDs[i].indexOf("color_")!=-1){  //颜色调整需要初始化
	    				var $ele = document.getElementById(imageFilterIDs[i]);
		    			$ele.checked = !!selectedObject.filters[i];
	    			}
	    		}
	    		
			}
		}
		//实时更新颜色选择区当前颜色
		currentObjectColor = (!!currentObjectColor) ? currentObjectColor : "#FFF";
		colorPickerTool.setItemBrushBtnBackgroundColor(currentObjectColor);
		
		//如果是画笔模式,则显示画笔菜单
		if(fabricCanvas.isDrawingMode){
			inputRangeTool.showBrushWidthArea();
		}
	});
	//////////////////////////////////////////////////////////
	/// fabric canvas 画板事件监听
	/////////////////////////////////////////////////////////
	
		
	//////////////////////////////////////////////////////////
	/// fabric canvas 元素添加
	/////////////////////////////////////////////////////////
	$(".item-text").on("click", function(){
		addFabricCanvasTool.addIText(100, 100, true);
	});
	
	fabricCanvas.on('mouse:dblclick', function(options) {
		var selectedObject = getSelected();
		var isCreateIText = true;
		if(!!selectedObject){
			var type = selectedObject.get("type"); //path:线条  , image:图片, rect:长方形
			if("i-text" === type){
				isCreateIText=false;
			}
		}
		if(isCreateIText){
			addFabricCanvasTool.addIText(options.pointer.x, options.pointer.y, true);
		}
	});
		
	$(".material-lists").on("click", ".piece", function(){
		var src = $(this).find("img").attr("src");
		if(!src) return;
		//url 只能使用同源的图片
		//跨域请求将导致读取失败(如图片请求跨域则可行)
		addFabricCanvasTool.addImage(src);
	});
	
	$(".header-piece-self-material").on("click", function(){ //自定义图片
		$("#self-image-input").click();
	});
	
	$("#self-image-input").change(function(){  
        var file = this.files[0];
        //自定义图片选择完成后，需要清空，以便选择同一张图片
        $(this).val(null);
        if(file.size >= 3*1024*1024){
        	diyUtil.showPopupBox("所选择的图片太大");
        	return;
        }
        if(!window.FileReader){
        	diyUtil.showPopupBox("浏览器不支持的功能");
        }
        var reader = new FileReader();  
        reader.readAsDataURL(file);
        reader.onloadend = function (e) { 
			addFabricCanvasTool.addImage(e.target.result);
        }; 
    });  
    //////////////////////////////////////////////////////////
	/// fabric canvas 元素添加
	/////////////////////////////////////////////////////////
    
    //////////////////////////////////////////////////////////
	/// 键盘按键操作
	/////////////////////////////////////////////////////////
    $(document).keydown(function (event) {　　
        var e = event || window.event;　　
        var k = e.keyCode || e.which;　　
        switch (k) {　　　　
            case 46:
                removeSelected();　　　　
                break;　　
        }
    });
    //////////////////////////////////////////////////////////
	/// 键盘按键操作
	/////////////////////////////////////////////////////////
	
	
	//////////////////////////////////////////////////////////
	/// 素材展示,操作
	/////////////////////////////////////////////////////////
	var materialBoxOperation={};
	materialBoxOperation.pcShowMaterial=function($this){
		var offsetRightCss = "0px";
		if($this.hasClass("active")){
			offsetRightCss = "-400px";
			$this.removeClass("active");
		}else{
			$this.addClass("active");
		}
		$(".diy-container").css({"right":offsetRightCss});
	};
	materialBoxOperation.mobileShowMaterial=function($this){
		var offsetBottomCss = "0px";
		if($this.hasClass("active")){
			offsetBottomCss = "-400px";
			$this.removeClass("active");
		}else{
			$this.addClass("active");
		}
		$(".diy-container").css({"bottom":offsetBottomCss});
	};
	materialBoxOperation.ShowMaterial=function($this){
		if(isPC){
			materialBoxOperation.pcShowMaterial($this);
		}else{
			materialBoxOperation.mobileShowMaterial($this);
		}
	};
	materialBoxOperation.registerEvent=function(){
		$(".item-material").on("click", function(){
			materialBoxOperation.ShowMaterial($(this));
		});
		//左侧菜单隐藏显示
		$(".item-open-close-menu").on("click", function(){
			var status = $(this).attr("data-status");
			if(status==="open"){
				$(".tools-item").each(function(){
					if(!$(this).hasClass("item-open-close-menu")){
						$(this).hide();
					}
				});
				$(this).addClass("rotate-open-close-menu");
				$(this).attr("data-status","close");
			}else{
				$(".tools-item").show();
				$(this).removeClass("rotate-open-close-menu");
				$(this).attr("data-status","open");
			}
		});
		fabricCanvas.on("mouse:down", function(options){
			if(!isPC){
				var $itemMaterial = $(".item-material");
				if($itemMaterial.hasClass("active")){
					materialBoxOperation.ShowMaterial($itemMaterial)
				}
			}
		});
	};
	materialBoxOperation.registerEvent();
	//////////////////////////////////////////////////////////
	/// 素材展示,操作
	/////////////////////////////////////////////////////////
	
	//////////////////////////////////////////////////////////
	/// 导出图片
	/////////////////////////////////////////////////////////
	var completeCreatedImage={};
	completeCreatedImage.myBrowser=function(){
		var userAgent = navigator.userAgent;
		if (userAgent.indexOf("OPR") > -1) {
			return "Opera";
		}
		if (userAgent.indexOf("Firefox") > -1) {
			return "FF";
		}
		if (userAgent.indexOf("Trident") > -1) {
			return "IE";
		}
		if (userAgent.indexOf("Edge") > -1) {
			return "Edge";
		}
		if (userAgent.indexOf("Chrome") > -1) {
			return "Chrome";
		}
		if (userAgent.indexOf("Safari") > -1) {
			return "Safari";
		}
	};
	//将 base64 转换位 blob 对象
	completeCreatedImage.convertBase64UrlToBlob = function(base64) {
		var parts = base64.dataURL.split(';base64,');
		var contentType = parts[0].split(':')[1];
		var raw = window.atob(parts[1]);
		var rawLength = raw.length;
		var uInt8Array = new Uint8Array(rawLength);
		for (var i = 0; i < rawLength; i++) {
			uInt8Array[i] = raw.charCodeAt(i);
		}
		return new Blob([uInt8Array], { type: contentType });
	};
	completeCreatedImage._fixType = function(type){
		type = type.toLowerCase().replace(/jpg/i, 'jpeg');
        var r = type.match(/png|jpeg|bmp|gif/)[0];
        return 'image/' + r;
	};
	completeCreatedImage.saveBase64=function(){
		var optional={
			"left":showCompleteAreaRect.get("left"), 
			"top":showCompleteAreaRect.get("top"), 
			"width":showCompleteAreaRect.get("width"), 
			"height":showCompleteAreaRect.get("height")
		}
		//将画板保存为图片格式的函数
		var dataURL = fabricCanvas.toDataURL(optional);
        return dataURL;
	};
	completeCreatedImage.download = function(imgData){
		var imageExt = 'jpg';
	    var base64 = {
			dataURL: imgData,
			type: 'image/jpg',
			ext: imageExt
	    };
	    var filename = 'tool77.com_diy_' + (new Date()).getTime() + '.' + imageExt;
	    var blob = completeCreatedImage.convertBase64UrlToBlob(base64);
	    if (completeCreatedImage.myBrowser() == 'IE') {
			window.navigator.msSaveBlob(blob, filename);
	    } else {
			var _a = document.createElement('a');
			_a.download = filename;
			_a.href = URL.createObjectURL(blob);
			_a.click();
	    }
	};
	completeCreatedImage.registerEvent = function(){
		$(".item-image-save").on("click", function(){
			fabricCanvas.sendToBack(showCompleteAreaPoly); //把三角形移动到最底部
			var imgData = completeCreatedImage.saveBase64();
	    	fabricCanvas.bringToFront(showCompleteAreaPoly); //把三角形移动到最顶部
	    	
	    	var getAllObjects = fabricCanvas.getObjects();
	    	var title = "";
	    	var description = "";
	    	var allCategoryId = "";
	    	for(var i=0;i<getAllObjects.length;i++){
	    		var type = getAllObjects[i].type;
	    		if(type == "i-text"){
	    			var text = getAllObjects[i].text;
	    			if(!!text){
	    				if(!title) title = text;
		    			description = description + text + "#";
	    			}
	    		}else if(type == "image"){ //提取出所使用的素材
	    			try {
	    				var imageUrl = getAllObjects[i]._originalElement.currentSrc;
	    				var imageUrlReg = /\/material\/\d+\/(\d+)\//g;
	    				var categoryId = imageUrl.match(imageUrlReg)[0].match(/\d+/g)[1];
	    				if(!!categoryId){
	    					allCategoryId = allCategoryId + categoryId + "#";
	    				}
	    			}catch(err){}
	    		}
	    	}
	    	if(isPC){
	    		var html = "<div style='padding:10px;max-height:calc(100% - 50px);overflow: hidden;'>"
	    			+"<div style='max-height:300px;overflow-y:auto;border:1px solid #ccc;'>"
		    			+"<img src='"+imgData+"' style='display:block; width: 100%; max-height: 100%; margin:0px auto;' draggable='false'>"
	    			+"</div>"
					+"<div style='font-size:14px;text-align:left;'><input id='naodong-image-copyright' type='checkbox' checked>支持开源，允许免费使用这张脑洞图片。<span id='expression_open_copyright_btn' style='color:red;cursor:pointer;'>详情</span></div>"
					+"<div id='expression_open_copyright_box' style='display:none;margin-top:10px;'>"
						+"<div class='form-group'>"
						+"<label class='control-label'>标题</label>"
						+"<input autofocus='' type='text' id='expression_title' placeholder='请输入标题' class='form-control' value='"+title+"'>"
						+"</div>"
						+"<div class='form-group'>"
						+"<label class='control-label'>描述</label>"
						+"<textarea class='form-control' rows='2' id='expression_description' placeholder='请输入对脑洞图片的描述' style='resize:none;'>"+description+"</textarea>"
						+"</div>"
						+"<div style='font-size:12px;'>注：二维码传图和下载图片会触发图片保存，如果不允许他人使用，可取消开源选框</div>"
					+"</div>"
					
					+"</div>";
                $.confirm({
                    title: false,
                    content: html,
                    buttons: {
                        someButton: {
                            text: '<i class="fa fa-qrcode" aria-hidden="true"></i>二维码传图',
                            btnClass: 'btn-sm btn-info',
                            action: function () {
                            	var that = this
                            	var $copyrightObj = that.$content.find('#naodong-image-copyright');
                            	var copyright = $copyrightObj.is(':checked') ? 1 : 0;
                            	//收集开源的描述信息
                            	var copyrightTitle = that.$content.find('#expression_title').val();
                            	var copyrightDescription = that.$content.find('#expression_description').val();
                            	//提交开源
                            	diyUtil.sendNaoDongImage(imgData, copyright, copyrightTitle, copyrightDescription, allCategoryId).then((data)=>{
                            		var qrcodeImageData = diyUtil.createQrcode(ROOT+"/expression/qrcode_show?identification="+data.identification);
                            		console.log(ROOT+"/expression/qrcode_show?identification="+data.identification);
                            		var qrcodeHtml = "<div style='padding:10px;max-height:calc(100% - 50px);overflow: hidden;text-align:center;'>"
                            			+"<div style='font-size:14px;margin-bottom:8px;'><b>扫码二维码可保存或分享该图片，让我们一起愉快的脑洞吧！(二维码图片链接2小时内有效)</b></div>"
                            			+"<img src='"+qrcodeImageData+"' style='display:block; width: 200px; margin:0px auto; border:1px solid #ccc;' draggable='false'></div>";
                            		$.dialog({
                            			title: false,
                            			content: qrcodeHtml,
                            			animation: 'scale',
                            			onOpen: function () {
                            				
                            			},
                            			onClose: function(){
                            				
                            			}
                            		});
                            	}).catch((error)=>{
                            		console.log("error",error);
                            	});
                            }
                        },
                        someOtherButton: {
                            text: "<i class='fa fa-download' aria-hidden='true'></i>下载图片",
                            btnClass: 'btn-sm btn-success',
                            action: function () {
                            	completeCreatedImage.download(imgData);
                            	var that = this
                            	var $copyrightObj = that.$content.find('#naodong-image-copyright')
                            	var copyright = $copyrightObj.is(':checked') ? 1 : 0;
                            	
                            	//收集开源的描述信息
                            	var copyrightTitle = that.$content.find('#expression_title').val();
                            	var copyrightDescription = that.$content.find('#expression_description').val();
                            	diyUtil.sendNaoDongImage(imgData, copyright, copyrightTitle, copyrightDescription, allCategoryId);  //提交开源
                            	
                            }
                        },
                        close: {
                        	text: "关闭",
                            btnClass: 'btn-sm btn-default',
                            action: function () {}
                        }
                    },
                    onOpen: function () {
                    	var that = this
                    	var $copyrightBtn = that.$content.find("#expression_open_copyright_btn");
                    	var $copyrightBox = that.$content.find("#expression_open_copyright_box");
                    	$copyrightBtn.click(function(){
                    		$copyrightBox.toggle();
                    	});
                    },
                });
	    	}else{
	    		var html = "<div style='padding:10px;max-height:calc(100% - 50px);overflow: hidden;'>"
					+"<img src='"+imgData+"' style='display:block; width: 100%; max-height: 100%; margin:0px auto; border:1px solid #ccc;' draggable='false'>"
					+"<div style='text-align:center;font-size:14px;'>长按保存图片</div>"
	    			//+"<div style='font-size:14px;text-align:left;'><input id='naodong-image-copyright' type='checkbox' checked>支持开源，允许大家免费使用这张脑洞图片</div>"
					+"</div>";
	    		$.dialog({
                    title: false,
                    content: html,
                    animation: 'scale',
                    onOpen: function () {}
                });
	    	}
		});
	};
	completeCreatedImage.registerEvent();
	//////////////////////////////////////////////////////////
	/// 导出图片
	/////////////////////////////////////////////////////////
	
	//////////////////////////////////////////////////////////
	/// 其它操作
	/////////////////////////////////////////////////////////
	var additionalFunctionUtil = {};
	additionalFunctionUtil.registerEvent = function(){
		//canvas禁用右键
		$(".upper-canvas").contextmenu(function(event){
			event.preventDefault();
		});
		//定时保存
		setInterval(function(){
			var fabricCanvasCurrentStatusJson = JSON.stringify(fabricCanvas);
			localStorage.setItem("fabricCanvasCurrentStatusJson",fabricCanvasCurrentStatusJson);
		},2000);
		//弹出说明相关说明
		$("#introduce-popup").on("click", function(){
			var html = "<div style='padding:10px;max-height:calc(100% - 50px);overflow: hidden;'>"
    			+"<div style='font-size:14px;text-align:left;'>"
    				+"<div><b>操作说明:</b></div>"
    				+"<div style='line-height: 18px;margin-bottom:5px;'>1、左侧的图片可以自由点击添加,当鼠标点击画板中的图片时，将会在图片周围出现9个基本操作点，这些操作点可自由实现图片的等比放缩、拉伸、旋转、翻转等功能。</div>"
    				+"<div style='line-height: 18px;margin-bottom:5px;'>2、善用左边提供的素材，素材包括身体、面部、道具等，通过这些素材，画板将可以自由组件各种脑洞图片。</div>"
    				+"<div style='line-height: 18px;margin-bottom:5px;'>3、善用左侧的工具栏，鼠标移入有相应说明。</div>"
    				+"<div style='line-height: 18px;margin-bottom:5px;'>4、当素材不满足需求时，可点击自定义素材，使用自己本地图片。</div>"
    				+"<div><b>关于素材:</b></div>"
    				+"<div style='line-height: 18px;margin-bottom:5px;'>1、本站所使用的图片素材全部来自于网络，如有侵权，请邮件告知。</div>"
    				+"<div style='line-height: 18px;margin-bottom:5px;'>2、因为人力有限，DIY素材总不能尽善尽美，所以希望大家能积极投稿，让我们共同为脑洞DIY出一份力。</div>"
    				+"<div style='line-height: 18px;margin-bottom:5px;'>注：投稿时请说明来意，素材请以附件的形式发送到我们的官方邮箱。</div>"
    				+"<div><b>联系我们:</b></div>"
    				+"<div>官方邮箱:<span style='color:red; font-style:italic;'>1956166592@qq.com</span></div>"
    			+"</div>"
    			+"</div>";
			$.dialog({
	            title: false,
	            content: html,
	            animation: 'scale'
	        });
		});
		//完成加载,移出模态
		$("#is-loadding-complete").hide();
		
		//if(!diyUtil.isLogin()) diyUtil.checkLoginBox();
	};
	additionalFunctionUtil.registerEvent();
	//////////////////////////////////////////////////////////
	/// 其它操作
	/////////////////////////////////////////////////////////
	
	///////动态加载素材
	var loaddingMaterialUtil={};
	loaddingMaterialUtil.registerEvent=function(){
		$(".header-piece").on("click", function(){
			$(".header-piece").removeClass("active");
			$(this).addClass("active");
			
			var pid = $(this).data("pid");
			$("div[id^='chile-tags-']").hide();
			var $currentChildTags = $("#chile-tags-"+pid);
			
			var cid = $currentChildTags.find(".active").data("cid");
			$("#chile-tags-"+pid).show();
			loaddingMaterialUtil.loaddingImageByCID(cid);
		});
		$("body").on("click", ".tags-piece", function(){
			$(this).parents("div[id^='chile-tags-']").find(".tags-piece").removeClass("active");
			$(this).addClass("active");
			var cid = $(this).data("cid");
			loaddingMaterialUtil.loaddingImageByCID(cid);
		});
		$(".search-material-btn").on("click", function(){
			var keyword = $("input[name='input-search-keyword']").val();
			loaddingMaterialUtil.searchResult(keyword);
		});
	};
	loaddingMaterialUtil.loaddingImageByCID=function(cid){
        $.ajax({
            type : "GET",
            url : ROOT+"/tool/diy/get_material_path",
            data : {"cid":cid},
            success : function(result) {
            	$(".material-lists").empty();
            	var html = "";
            	for(var i=0; i<result.length; i++){
            		html += '<div class="piece" data-cid="'+result[i].classifyId+'"><img src="'+result[i].path+'"/></div>'
            	}
            	$(".material-lists").append(html);
            },
            error : function(e){}
        });
	}
	loaddingMaterialUtil.searchResult=function(keyword){
		
	};
	loaddingMaterialUtil.registerEvent();
}
