var map;
//地图初始化
function init(){	
	//定义地图中心及缩放级别
	map = L.map('map').setView([39.900497, 116.370491], 10);

	// 各种底图
	// var openstreetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; <a href="OpenStreetMaphttps://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);

	var mapboxs = L.tileLayer('https://api.mapbox.com/styles/v1/jockcharles/clq7kolal001501poeo3ifj10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoiam9ja2NoYXJsZXMiLCJhIjoiY2pxMXRxMGhkMGh3bDQ5cDd6NmY0ajNxayJ9.nBMQKu4EBCPDPwL4j6gWzQ', {
		maxZoom: 19,
		attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>"
	}).addTo(map);

	//谷歌
	var GoogleMap = L.tileLayer.chinaProvider('Google.Normal.Map', {//谷歌地图
			maxZoom: 18,minZoom: 4
		}),
		Googlesatellite = L.tileLayer.chinaProvider('Google.Satellite.Map', {//谷歌影像
			maxZoom: 18,minZoom: 4
		}); 
		//高德地图
	var Gaode = L.tileLayer.chinaProvider('GaoDe.Normal.Map', {//高德地图
		maxZoom: 18,minZoom: 4
	});
	var Gaodeimgem = L.tileLayer.chinaProvider('GaoDe.Satellite.Map', {//高德影像
		maxZoom: 18,minZoom: 4
	});
	var Gaodeimga = L.tileLayer.chinaProvider('GaoDe.Satellite.Annotion', {//高德影像标注
		maxZoom: 18,minZoom: 4
	});
	var Gaodeimage = L.layerGroup([Gaodeimgem, Gaodeimga]);

	// 专题数据

	var urljson = "http://localhost:8080/geoserver/LightWebGIS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=LightWebGIS%3Acompany_polygon_relation&maxFeatures=500&outputFormat=application%2Fjson"
	// var Search_FacGeoJSON = L.geoJson(null, {
	// 	onEachFeature: function(feature, marker) {
	// 			marker.bindPopup('<h4>'+'工厂：'+ feature.properties.name+'<br/>id：'+feature.properties.id);
	// 	}
	// }).addTo(map);
	// //ajax调用
	// $.ajax({
	// 	url: urljson, //GeoJSON服务的完整路径
	// 	dataType: 'json',
	// 	outputFormat: 'text/javascript',
	// 	success: function(data) {
	// 		Search_FacGeoJSON.addData(data);
	// 	},
	// });

	// 点击地图响应函数
	function onEachFeature(feature, marker) {
		var pid = feature.properties.polygon_id;
		var content = '<div style="width:600px;height:320px;" id="popupwindow"</div>';
		marker.bindPopup(content, {maxWidth:800});
		marker.on('popupopen', function(e) {
			var myChart = echarts.init(document.getElementById('popupwindow'));
			getDatabyid(pid, myChart)
		});
	}

	function getDatabyid(pid, myChart) {
		var xValue = [];
		var yValue = [];
		$.ajax({
			url: '/popquery?pid='+pid,
			type: 'get',
			dataType: 'json',
			outputFormat: 'text/javascript',
			success: function(result) {
				if (result) {
					for (var i=0; i<result.length; i++) {
						xValue.push(result[i].date);
						yValue.push(result[i].last_cur_daytime_count)
					}
					var facname = result[0].name;
					getChart(xValue, yValue, myChart, facname)
				}
			},
			error: function (data) {
				alert('error::'+data[0]+'--图表请求数据失败')
			}
		})
	}

	function getChart(xValue, yValue, myChart, facname){
		console.log("xValue:"+xValue);
		console.log("yValue:"+yValue);
		var option = {
			title: {
				text: facname+'日工作人口',
			},
			color: ['#3398D8'],
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow'
				}
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				containLabel: true
			},
			xAxis:[
				{
					data: xValue
				}
			],
			yAxis: [{}],
			series: [{
				type: 'line',
				showSymbol: false,
				data: yValue,
				itemStyle: {
					nromal: {
						label: {
							show: true
						}
					}
				}
			}]
		};

		myChart.clear();
		myChart.setOption(option);
	}



	var Pop_FacGeoJSON = L.geoJson(null, {
		onEachFeature: onEachFeature
	}).addTo(map);
	$.ajax({
		url: urljson,
		dataType: 'json',
		outputFormat: 'text/javascript',
		success: function(data) {
			Pop_FacGeoJSON.addData(data)
		}
	})

	var url = 'http://localhost:8080/geoserver/LightWebGIS/wms'
	const tifLayer = L.tileLayer.wms(url, {
		layers: 'LightWebGIS:北京汽车（北京）0315',
		format: "image/png",
		crs: L.CRS.EPSG4326,
		transparent: true
	})

	//定义底图
	var baseMaps = {
		// "OSM": openstreetmap,
	    "Mapbox": mapboxs,
        "谷歌地图": GoogleMap,
        "谷歌影像": Googlesatellite,
        "高德地图": Gaode,
        "高德影像": Gaodeimage
	};
	//定义专题图层
	var overlayMaps = {
		"北京汽车": tifLayer,
		"全部新能源": Pop_FacGeoJSON
	};
	//加载底图与专题图层控件
	L.control.layers(baseMaps, overlayMaps).addTo(map);

	// 搜索控件
	map.addControl( new L.Control.Search({
		url: 'http://nominatim.openstreetmap.org/search?format=json&q={s}',
		jsonpParam: 'json_callback',
		propertyName: 'display_name',
		//搜索提示Tips
		textPlaceholder:'地名查询...',
		propertyLoc: ['lat','lon'],
		marker: L.circleMarker([0,0], {radius:10}),
		autoCollapse: true,
		autoType: false,
		minLength: 2
	}) );

	// 定义搜索控件
	var searchControl = new L.Control.Search({
		layer: Pop_FacGeoJSON,
		propertyName:'name',
		textPlaceholder:'地图要素搜索...',
		marker:false,
		moveToLocation: function(latlng, title, map) {
			// var zoom = map.getBoundsZoom(latlng.layer.getBounds)
			// map.setView(latlng, zoom);
			map.fitBounds(latlng.layer.getBounds(), {maxZoom:17})
		}
	});

	// 搜索响应函数
	searchControl.on('search:locationfound', function(e) {
		e.layer.setStyle({fillColor: '#3f0', color: '#0f0'});
	}).on('search:collapsed', function (e) {
		Search_FacGeoJSON.eachLayer(function(layer) {
			Search_FacGeoJSON.resetStyle(layer);
		});
	});
	map.addControl(searchControl)

}
