var map;
function init(){
	map = L.map('map').setView([39.900497, 116.370491], 10);
	// service
	var url = 'http://localhost:8080/geoserver/LightWebGIS/wms'
	var mapbox = L.tileLayer('https://api.mapbox.com/styles/v1/jockcharles/clq7kolal001501poeo3ifj10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoiam9ja2NoYXJsZXMiLCJhIjoiY2pxMXRxMGhkMGh3bDQ5cDd6NmY0ajNxayJ9.nBMQKu4EBCPDPwL4j6gWzQ', {
							maxZoom: 19,
							attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>"
							}).addTo(map);
	var baseMaps = {
		"Mapbox":mapbox
	}
	const facLayer = L.tileLayer.wms(url, {
		layers:'LightWebGIS:company_polygon_relation',
		format:"image/png",
		crs:L.CRS.EPSG4326,
		opacity:0.5,
		transparent:true
	});
	const tifLayer = L.tileLayer.wms(url, {
		layers:'LightWebGIS:北京汽车（北京）0315',
		format:"image/png",
		crs:L.CRS.EPSG4326,
		transparent:true
	})
	var overlayMaps = {
		"beijing 1":tifLayer,
		"Factory":facLayer
	}
	L.control.layers(baseMaps, overlayMaps).addTo(map);
	
}