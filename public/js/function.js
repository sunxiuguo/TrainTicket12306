/**
 * @Type	: Functional File
 * @Brief	: 提供功能支持
 * @Author	: 林晓州
 * @Date	: 2017.07.20
 */

/* -------------------------------------------------- 启动 ------------------------------------------------ */
jQuery(document).ready(function($) {
	_Build_Database();
	_Prepare_PageInfo();
});



/* -------------------------------------------------- 数据处理 ------------------------------------------------ */
/*  
 * 全局变量
 */
// 车票查询到的结果集（缓存，每次查询会清空原缓存）
var OL_TickectInfo_Cache = null;

// 查询的起止站缓存
var OL_Tickect_FromStation_Cache = null;
var OL_Tickect_ToStation_Cache = null;

// 全国火车站数据
var OL_StationData = null;

// 全国火车站拼音（数组）
var OL_StationData_Pinyin = new Array();

// 全国火车站中文名称（数组）
var OL_StationData_Zhongwen = new Array();

/*  
 * 数据构造
 */
function _Build_Database() {
	OL_StationData = StationData.data;
	OL_StationData_Pinyin = StationData.name;

	OL_StationData_Zhongwen.length = 0;
	for(var i=0; i<OL_StationData_Pinyin.length; i++) {
		var py = OL_StationData_Pinyin[i];
		var zw = OL_StationData[py].name;
		OL_StationData_Zhongwen.push(zw)
	}
}

/*  
 * 根据中文名称获取火车站代码
 */
function _Get_tCode(zw) {
	if(!zw) {
		return null;
	}

	for(var i=0; i<OL_StationData_Zhongwen.length; i++) {
		if(OL_StationData_Zhongwen[i] == zw) {
			var py = OL_StationData_Pinyin[i];
			return OL_StationData[py].code;
		}
	}

	return null;
}
/*  
 * 根据拼音获取火车站代码
 */
function _Get_tCode_PY(py) {
	if(!py) {
		return null;
	}

	py = py.toLowerCase();
	var code = null;
	var _tmp = OL_StationData[py];
	if(!_tmp) {
		return null;
	}
	if(_tmp.code) {
		code = OL_StationData[py].code;
	}
	return code;
}



/*  
 * 获取中文站名
 */
function _GetName_CN(str) {
	if(!str) {
		return
	}

	for(var i=0; i<OL_StationData_Zhongwen.length; i++) {
		if(OL_StationData_Zhongwen[i] == str) {
			return str
		}
	}

	var py = str.toLowerCase();
	var _tmp = OL_StationData[py];
	if(_tmp) {
		return OL_StationData[py].name;
	}

	return null;
}


/*  
 * 查找字符串（中文站名）
 */
function _Search_Key_CN(zw) {
	if(!zw) {
		return [];
	}
	var arr = new Array();
	for(var i=0; i<OL_StationData_Zhongwen.length; i++) {
		if(-1 != OL_StationData_Zhongwen[i].indexOf(zw)) {
			var py = OL_StationData_Pinyin[i];
			if(OL_StationData[py]) {
				arr.push(OL_StationData[py])
			}
		}
	}
	return arr;
}
/*  
 * 查找字符串（英文站名）
 */
function _Search_Key_PY(_py) {
	if(!_py) {
		return [];
	}

	_py = _py.toLowerCase();
	var arr = new Array();
	for(var i=0; i<OL_StationData_Pinyin.length; i++) {
		if(-1 != OL_StationData_Pinyin[i].indexOf(_py)) {
			var py = OL_StationData_Pinyin[i];
			if(OL_StationData[py]) {
				arr.push(OL_StationData[py])
			}
		}
	}
	return arr;
}

/*  
 * 根据火车编号查询列车信息
 */
function _Get_Data_tNo(tNo) {
	if(!tNo) {
		return null;
	}
	for(var i=0; i<OL_TickectInfo_Cache.length; i++) {
		if(OL_TickectInfo_Cache[i].train_no == tNo) {
			return OL_TickectInfo_Cache[i];
		}
	}
	return null;

}




/* -------------------------------------------------- 页面 ------------------------------------------------ */
var _Md_Table = '<table class="table table-hover table-sm table-bordered"><thead><tr class="bg-primary text-center"><th>车次</th><th>起止站</th><th>发车</th><th>到达</th><th>商务</th><th>一等</th><th>二等</th><th>动卧</th><th>软卧</th><th>硬卧</th><th>软座</th><th>硬座</th><th>无座</th><th>其他</th></tr></thead><tbody>##BODY##</tbody></table>';
var _Md_Table2 = '<table class="table table-hover table-sm table-bordered"><thead><tr class="bg-primary text-center"><th>车序</th><th>站名</th><th>到站</th><th>出发</th><th>停靠</th></tr></thead><tbody>##BODY##</tbody></table>';
	
function _Prepare_PageInfo() {
	$("#ol_tt_date").val(_get_standard_date_string());
}

function _Color_Tickect_Number(num) {
	if(!num) {
		return "<span class='text-muted'>-</span>"
	}
	if("无"==num) {
		return "<span class='text-muted'>无</span>"
	}

	if("有" == num) {
		return "<span style='font-weight:bold; color:#5cb85c;'>"+num+"</span>"
	}
	else {
		return "<span style='font-weight:bold;'>"+num+"</span>"
	}
}

function _Color_Tickect_Price(price) {
	if(undefined == price) {
		return ""
	}
	else {
		return "<span style='font-size:80%; color:#fc8302;'>"+price+"</span>";
	}
}


// 余票列表过滤器
function _Filter_Train_Type(data) {
	var flag = true;

	var filter_type_gc = $('#ol_tt_type_gc').is(':checked')
	var filter_type_d = $('#ol_tt_type_d').is(':checked')
	var filter_type_z = $('#ol_tt_type_z').is(':checked')
	var filter_type_t = $('#ol_tt_type_t').is(':checked')
	var filter_type_k = $('#ol_tt_type_k').is(':checked')
	var filter_type_others = $('#ol_tt_type_others').is(':checked')

	var tId = data.tId;
	if(!filter_type_gc) {
		if(tId[0] == "G" || tId[0]=="C") {
			flag = false;
		}
	}
	if(!filter_type_d) {
		if(tId[0] == "D") {
			flag = false;
		}
	}
	if(!filter_type_z) {
		if(tId[0] == "Z") {
			flag = false;
		}
	}
	if(!filter_type_t) {
		if(tId[0] == "T") {
			flag = false;
		}
	}
	if(!filter_type_k) {
		if(tId[0] == "K") {
			flag = false;
		}
	}
	if(!filter_type_others) {
		if(tId[0]!="G" && tId[0]!="C" && tId[0]!="D" && tId[0]!="Z" && tId[0]!="T" && tId[0]!="K") {
			flag = false;
		}
	}

	return flag;
}

// 渲染余票查询结果
function _Render_Query_Result(data) {
	if(!data) {
		alert("返回数据错误！")
		return;
	}

	var filter_station_strict = $('#ol_tt_strict_station').is(':checked')
	
	var list = "";
	var list_invalid = "";
	for(var i=0; i<data.length; i++) {

		var fSation_cn = data[i].fSation
		var tSation_cn = data[i].tSation

		if(filter_station_strict) {
			// 过滤车站名称
			if(OL_Tickect_FromStation_Cache != fSation_cn) {
				continue;
			}
			if(OL_Tickect_ToStation_Cache != tSation_cn) {
				continue;
			}
		}

		if(!_Filter_Train_Type(data[i])) {
			continue;
		}

		// 是否+1天
		var starttime = data[i].sTime;
		var totaltime = data[i].tTime;
		var arrivetime = data[i].eTime;
		var plus_day = _is_day_plus_1(starttime, totaltime);
		if(0 < plus_day) {
			arrivetime = arrivetime + "<sup><small style='color:#EF0000; font-weight:bold;'>+"+plus_day+"天</small></sup>";
		}

		var action = "无";
		if("预订"!=data[i].status) {
			starttime = "-";
			arrivetime = "-";
			action = "<span style='font-size:.4em; color:#aaa;'>"+data[i].status+"</span>"
		}

		var queryprice = " onclick=\"OL_TrainTickets.queryprice('"+data[i].train_no+"')\" ";
		var arrow = "<span class='hover-blue' style='font-size:.6em;' onclick=\"OL_TrainTickets.findStations('"+data[i].train_no+"')\"><i class='fa fa-map'></i> </span>";

		var temp = "<td>"+fSation_cn+" - "+tSation_cn+"</td>"
					+ "<td>"+starttime+"</td>"
					+ "<td>"+arrivetime+"</td>"

					+ "<td>"+_Color_Tickect_Number(data[i].bcSeat)+"</td>"
					+ "<td>"+_Color_Tickect_Number(data[i].fcSeat)+"</td>"
					+ "<td>"+_Color_Tickect_Number(data[i].scSeat)+"</td>"
					+ "<td>"+_Color_Tickect_Number(data[i].dongwo)+"</td>"
					+ "<td>"+_Color_Tickect_Number(data[i].ruanwo)+"</td>"
					+ "<td>"+_Color_Tickect_Number(data[i].yingwo)+"</td>"
					+ "<td>"+_Color_Tickect_Number(data[i].ruanzuo)+"</td>"
					+ "<td>"+_Color_Tickect_Number(data[i].yingzuo)+"</td>"
					+ "<td>"+_Color_Tickect_Number(data[i].wuzuo)+"</td>"
					+ "<td>"+action+"</td>"
				;

		if("预订"==data[i].status) {
			list += "<tr id='ol_"+data[i].tId+"' class='text-center' style='cursor:pointer;' "+queryprice+">" 
					+ "<td><strong>"+data[i].tId+" "+arrow+"</strong></td>"
					+ temp 
					+"</tr>";
		}
		else {
			list_invalid += "<tr id='ol_"+data[i].tId+"' class='text-center' style='cursor:pointer;'>" 
					+ "<td><strong>"+data[i].tId+"</strong></td>"
					+ temp 
					+"</tr>";
		}
	}

	if(0 >= data.length) {
		list = "<p class='text-muted'>没有符合条件的车次</p>";
	}
	else {
		list = _Md_Table.replace("##BODY##", list+list_invalid)
	}
	$("#ol_tt_result").html(list);
}

// 渲染途经站点
function _Render_StationsList_Result(data) {
	if(!data) {
		alert("返回数据错误！")
		return;
	}
	
	var tId = data[0].station_train_code;
	var list = "";
	for(var i=0; i<data.length; i++) {
		list += "<tr class='text-center'>"
					+ "<td><strong>"+data[i].station_no+"</strong></td>"
					+ "<td>"+data[i].station_name+"</td>"
					+ "<td>"+data[i].arrive_time+"</td>"
					+ "<td>"+data[i].start_time+"</td>"
					+ "<td>"+data[i].stopover_time+"</td>"
				+"</tr>";
	}

	if(0 >= data.length) {
		list = "<p class='text-muted'>查询失败！</p>";
	}
	else {
		list = _Md_Table2.replace("##BODY##", list)
		list = "<h2>"+tId+"次 列车站点信息</h2><hr>" 
				+ list 
				+ "<hr><p class='text-center'><button class='btn btn-outline-primary btn-sm' onclick='_Close_Panel2()'>关闭</button></p>";
	}

	$(".mask").remove()
	$("#ol_tt_result2").remove()
	$("body").after("<div onclick='_Close_Panel2()' class='mask'></div>");
	$("#ol_tt_result").after("<div class='modalbox' id='ol_tt_result2'>"+list+"</div>");
}

// 渲染票价
function _Render_Price_Result(data) {
	if(!data) {
		alert("返回数据错误！")
		return;
	}
	
	var train_no = data.train_no;
	var tickect = _Get_Data_tNo(train_no);
	if(!tickect) {
		alert("获取票价失败！")
		return
	}

	var tId = tickect.tId;
	var table_tr_id = "ol_"+tId;

	var business = data.A9;
	var first = data.M;
	var second = data.O;

	var dongwo = "";

	var wuzuo = data.WZ;

	var yingzuo = data.A1;
	var ruanzuo = data.A2;
	var yingwo = data.A3;
	var ruanwo = data.A4;

	var newline = "<tr id='ol_"+tickect.tId+"_price' class='text-center' style='background:#eef1f8;'>"
					+ "<td colspan='4'></td>"
					+ "<td>"+_Color_Tickect_Price(business)+"</td>"
					+ "<td>"+_Color_Tickect_Price(first)+"</td>"
					+ "<td>"+_Color_Tickect_Price(second)+"</td>"
					+ "<td>"+_Color_Tickect_Price(dongwo)+"</td>"
					+ "<td>"+_Color_Tickect_Price(ruanwo)+"</td>"
					+ "<td>"+_Color_Tickect_Price(yingwo)+"</td>"
					+ "<td>"+_Color_Tickect_Price(ruanzuo)+"</td>"
					+ "<td>"+_Color_Tickect_Price(yingzuo)+"</td>"
					+ "<td>"+_Color_Tickect_Price(wuzuo)+"</td>"
					+ "<td></td>"
				+"</tr>";
	$("#"+table_tr_id+"_price").remove();
	$("#"+table_tr_id).after(newline)
}
function _Waiting_Price_Result(tId) {
	var table_tr_id = "ol_"+tId;
	var newline = "<tr id='ol_"+tId+"_price' class='text-center' style='background:#eef1f8;'>"
					+ "<td colspan='14' style='color:#888;' class='loading1'>正在查询票价，请稍候...</td>"
				+"</tr>";
	$("#"+table_tr_id+"_price").remove();
	$("#"+table_tr_id).after(newline)
}


function _Close_Panel2() {
	$(".mask").remove()
	$("#ol_tt_result2").remove();
}


function _Show_Is_Query(data) {
	list = "<p class='text-muted loading1'>正在查询...</p>";
	$("#ol_tt_result").html(list);
}

function _Show_Is_Query2(data) {
	$(".mask").remove()
	$("#ol_tt_result2").remove()

	list = "<h4 class='text-center loading1'>正在查询...</h4>"
				+ "<hr><p class='text-center'><button class='btn btn-outline-primary btn-sm' onclick='_Close_Panel2()'>关闭</button></p>";
	$("body").after("<div onclick='_Close_Panel2()' class='mask'></div>");
	$("#ol_tt_result").after("<div class='modalbox' id='ol_tt_result2'>"+list+"</div>");
}



// 监控输入站名
function Monitor_Station_Input(obj) {
	var id = obj.id;
	var name = obj.value;

	if("" == name) {
		$("#"+id+"_opts").html('<h6 class="dropdown-header">输入中文或拼音</h6>');
		return
	}

	var cn = _Search_Key_CN(name);
	var py = _Search_Key_PY(name);
	var arr = [];
	if(0 < cn.length) {
		arr = cn
	}
	else if(0 < py.length) {
		arr = py
	}

	_FromStation_AutoPadding_Options(arr, id)

	return;
}

// 自动补齐输入的站名（提供选项）
function _FromStation_AutoPadding_Options(arr, inputid) {
	var options = "";
	if(0 == arr.length) {
		options = '<h6 class="dropdown-header">没有符合条件的车站</h6>';
	}
	else {
		for(var i=0; i<arr.length; i++) {
			var station = arr[i];
			options += '<a onclick="_FromStation_AutoInput(\''+station.name+'\', \''+inputid+'\')" class="dropdown-item" href="#">'
						+station.name+' <small>'+station.pinyin+'</small></a>';
		}
	}
	$("#"+inputid+"_opts").html(options);
	if("none" == $("#"+inputid+"_opts").css("display")) {
		$("#"+inputid+"_opts").dropdown('toggle')
	}
}

// 直接填充站名输入框
function _FromStation_AutoInput(name, inputid) {
	$("#"+inputid).val(name);
}

// 交换起止站
function ExchangeStation() {
	var fstation = $("#ol_tt_fromStation").val();
	var tstation = $("#ol_tt_toStation").val();

	$("#ol_tt_fromStation").val(tstation);
	$("#ol_tt_toStation").val(fstation);
}


// 刷新车票结果列表
function _Refresh_Query_Result_List() {
	if(!OL_TickectInfo_Cache) {
		return
	}

	var fstation = $("#ol_tt_fromStation").val();
	var tstation = $("#ol_tt_toStation").val();
	if(""==fstation || ""==tstation) {
		return
	}

	_Render_Query_Result(OL_TickectInfo_Cache);
}

// 监控精准车站
function Monitor_Station_Strict(obj) {
	_Refresh_Query_Result_List();
}


// 监控车次类型
function Monitor_Station_Type(type) {
	_Refresh_Query_Result_List();
}


/* -------------------------------------------------- OL_TrainTickets ------------------------------------------------ */
var OL_TrainTickets = function() {};

OL_TrainTickets.rebase = function() { 

	var data = {};
	$.ajax({  
	　　type 	 : 'post',
	　　url  	 : '/rebase',  
	　　data 	 : data,  
	　　dataType : 'Json',
	　　success  : function(msg){
			if(msg.error) {
				alert(msg.error)
			}
			else {
				alert("重置完成")
			}
		},
	　　error:function(){
	　		alert("无法获取数据！请检查网络！");
	　　}
	})
};


OL_TrainTickets.query = function() { 

	var date = $("#ol_tt_date").val();
	var _fromStation = $("#ol_tt_fromStation").val().replace(/ /g, "");
	var _toStation = $("#ol_tt_toStation").val().replace(/ /g, "");

	if(!date || _check_date_validity(date)) {
		alert("日期不能为空！")
		return
	}
	if(!_fromStation) {
		alert("出发站不能为空！")
		return
	}
	if(!_toStation) {
		alert("终点站不能为空！")
		return
	}

	var fromStation = _Get_tCode(_fromStation)
	if(!fromStation) {
		fromStation = _Get_tCode_PY(_fromStation)
		if(!fromStation) {
			alert("出发站无效！")
			return
		}
	}
	var toStation = _Get_tCode(_toStation)
	if(!toStation) {
		toStation = _Get_tCode_PY(_toStation)
		if(!toStation) {
			alert("终点站无效！")
			return
		}
	}

	OL_Tickect_FromStation_Cache = _GetName_CN(_fromStation);
	OL_Tickect_ToStation_Cache = _GetName_CN(_toStation);

	_Show_Is_Query();
	var data = {
		date : date,
		from_station : fromStation,
		end_station : toStation,
	};
	$.ajax({  
	　　type 	 : 'post',
	　　url  	 : '/tickect',  
	　　data 	 : data,  
	　　dataType : 'Json',
	　　success  : function(msg){
			if(msg.error) {
				alert(msg.error)
			}
			else {
				OL_TickectInfo_Cache = msg.data;
				_Render_Query_Result(msg.data)
			}
		},
	　　error:function(){
	　		alert("无法获取数据！请检查网络！");
	　　}
	})
};



OL_TrainTickets.findStations = function(train_no) { 

	var tickect = _Get_Data_tNo(train_no);
	if(!tickect) {
		alert("无法查询！")
		return
	}
	
	_Show_Is_Query2();
	var data = {
		train_no : train_no,
		from_station : _Get_tCode(tickect.fSation),
		end_station : _Get_tCode(tickect.tSation),
		date : _conv_date(tickect.date),
	};
	$.ajax({  
	　　type 	 : 'post',
	　　url  	 : '/stations',  
	　　data 	 : data,  
	　　dataType : 'Json',
	　　success  : function(msg){
			if(msg.error) {
				alert(msg.error)
			}
			else {
				_Render_StationsList_Result(msg.data);
			}
		},
	　　error:function(){
	　		alert("无法获取数据！请检查网络！");
	　　}
	})
};



OL_TrainTickets.queryprice = function(train_no) { 

	var tickect = _Get_Data_tNo(train_no);
	if(!tickect) {
		alert("无法查询！")
		return
	}
	if("" == tickect.seat_types) {
		alert("无法查询！")
		return
	}
	
	_Waiting_Price_Result(tickect.tId);
	var data = {
		train_no        : train_no,	// 列车编号
		from_station_no : tickect.from_station_no,	// 出发地车序
		to_station_no   : tickect.to_station_no,	// 目的地车序
		seat_types      : tickect.seat_types,		// 如"113"
		train_date      : _conv_date(tickect.date),	// 日期, 格式"yyyy-mm-dd"
	};
	$.ajax({  
	　　type 	 : 'post',
	　　url  	 : '/price',  
	　　data 	 : data,  
	　　dataType : 'Json',
	　　success  : function(msg){
			if(msg.error) {
				alert(msg.error)
			}
			else {
				_Render_Price_Result(msg.data)
			}
		},
	　　error:function(){
	　		alert("无法获取数据！请检查网络！");
	　　}
	})
};



