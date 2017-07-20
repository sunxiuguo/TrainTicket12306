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
var OL_TickectInfo_Cache = null;

var OL_StationData = null;
var OL_StationData_Pinyin = new Array();
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

	var code = null;
	if(OL_StationData[py].code) {
		code = OL_StationData[py].code;
	}
	return code;

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
var _Md_Table = '<table class="table table-hover table-sm table-bordered"><thead><tr class="bg-primary text-center"><th>车次</th><th>起止站</th><th>发车</th><th>到达</th><th>商务</th><th>一等</th><th>二等</th><th>动卧</th><th>软卧</th><th>硬卧</th><th>软座</th><th>硬座</th><th>无座</th></tr></thead><tbody>##BODY##</tbody></table>';
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


function _Render_Query_Result(data) {
	if(!data) {
		alert("返回数据错误！")
		return;
	}
	
	var list = "";
	for(var i=0; i<data.length; i++) {
		list += "<tr class='text-center' style='cursor:pointer;' onclick=\"OL_TrainTickets.findStations('"+data[i].train_no+"')\">"
					+ "<td><strong>"+data[i].tId+"</strong></td>"
					+ "<td>"+data[i].fSation+" - "+data[i].tSation+"</td>"
					+ "<td>"+data[i].sTime+"</td>"
					+ "<td>"+data[i].eTime+"</td>"

					+ "<td>"+_Color_Tickect_Number(data[i].bcSeat)+"</td>"
					+ "<td>"+_Color_Tickect_Number(data[i].fcSeat)+"</td>"
					+ "<td>"+_Color_Tickect_Number(data[i].scSeat)+"</td>"
					+ "<td>"+_Color_Tickect_Number(data[i].dongwo)+"</td>"
					+ "<td>"+_Color_Tickect_Number(data[i].ruanwo)+"</td>"
					+ "<td>"+_Color_Tickect_Number(data[i].yingwo)+"</td>"
					+ "<td>"+_Color_Tickect_Number(data[i].ruanzuo)+"</td>"
					+ "<td>"+_Color_Tickect_Number(data[i].yingzuo)+"</td>"
					+ "<td>"+_Color_Tickect_Number(data[i].wuzuo)+"</td>"
				+"</tr>";
	}

	if(0 >= data.length) {
		list = "<p class='text-muted'>没有符合条件的车次</p>";
	}
	else {
		list = _Md_Table.replace("##BODY##", list)
	}
	$("#ol_tt_result").html(list);
}


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
	$("body").after("<div class='mask'></div>");
	$("#ol_tt_result").after("<div class='modalbox' id='ol_tt_result2'>"+list+"</div>");
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
	$("body").after("<div class='mask'></div>");
	$("#ol_tt_result").after("<div class='modalbox' id='ol_tt_result2'>"+list+"</div>");
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



