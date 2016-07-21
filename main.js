var year_from = 1500;
var year_to = 1900;
var type = '';
color = '#eee'; // Цвет событий после обновления слайдера будет общим для всех категорий. Надо пофиксить

function get_events_url(year_from, year_to, type) {
	var base_url = 'http://172.20.10.5:4567/?';  //year_from=' // 1&year_to=2000'
	return (base_url + 'year_from=' + year_from + '&year_to=' + year_to + '&type=' + type);
}

function isEmpty(obj) {
    if (obj == null) return true;
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
};

$jq(function() {
  $( "#slider-range" ).slider({
	stop: function(event, ui) {
		year_from = $("#slider-range").slider("values", 0);
		year_to = $("#slider-range").slider("values", 1);
		myMap.geoObjects.removeAll();
		create_request(get_events_url(year_from, year_to, type), color)
    },
    range: true,
    min: 1,
    max: 2016, //Data().getFullYear(),
	animate: true,
    values: [ year_from, year_to ],
    slide: function( event, ui ) {
      $( "#amount" ).val(ui.values[ 0 ] + " - " + ui.values[ 1 ] );
    }
  });
  $( "#amount" ).val($( "#slider-range" ).slider( "values", 0 ) +
    " - " + $( "#slider-range" ).slider( "values", 1 ) );
});
  

function init () {
    myMap = new ymaps.Map("map", {
        center: [48.856929, 15.341198],
        zoom: 2,
        controls: []
    },{suppressMapOpenBlock: true, minZoom: 2});
	
	// копипаста отсюда: https://yandex.ru/blog/mapsapi/36558/56a9547cb15b79e31e0d08a6
	myMap.action.setCorrection(function (tick) { // проверка передвижения экрана, не пускает выше и ниже карты (там где уже нет тайлов)
            var projection = myMap.options.get('projection');
            var mapSize = myMap.container.getSize();
            var tickCenter = projection.fromGlobalPixels(tick.globalPixelCenter, tick.zoom);
            var top = [tick.globalPixelCenter[0], tick.globalPixelCenter[1] - mapSize[1] / 2];
            var bot = [tick.globalPixelCenter[0], tick.globalPixelCenter[1] + mapSize[1] / 2];
            var tickTop = projection.fromGlobalPixels(top, tick.zoom);
            var tickBot = projection.fromGlobalPixels(bot, tick.zoom);
            if (tickTop[0] > 85) {
                tick.globalPixelCenter = projection.toGlobalPixels(
                    [85, tickCenter[1]],
                    tick.zoom
                );
                tick.globalPixelCenter = [tick.globalPixelCenter[0], tick.globalPixelCenter[1] + mapSize[1] / 2];
                tick.duration = 0;
            }
            if (tickBot[0] < -85) {
                tick.globalPixelCenter = projection.toGlobalPixels(
                    [-85, tickCenter[1]],
                    tick.zoom
                );
                tick.globalPixelCenter = [tick.globalPixelCenter[0], tick.globalPixelCenter[1] - mapSize[1] / 2];
                tick.duration = 0;
            } 
            return tick;
        });
		
	
	var ListBox = new ymaps.control.ListBox({
		data: {
			content: 'Категории'
		},
		items: [
			new ymaps.control.ListBoxItem(
				{data:{
					content: 'Тест 0',
					type: 'data\\test_0.json',
					color: 'islands#darkOrange',
					select: false
			}}),
			new ymaps.control.ListBoxItem(
				{data:{
					content: 'Тест 1',
					type: 'data\\test_1.json',
					color: 'islands#violet',
					select: false,
			}}),
			new ymaps.control.ListBoxItem(
				{data:{
					content: 'Тест 2',
					type: 'data\\test_2.json',
					color:'islands#yellow',
					select: false,
			}}),
			new ymaps.control.ListBoxItem(
				{data:{
					type: 'military_conflict',
					content: 'military_conflict',
					color:'islands#green',
					select: false,
			}}),
		]
	});
	myMap.controls.add(ListBox);


    $jq('#log').toggle();
	
	var open_by_id;

	create_request = function(url, color, type) {
		$jq.ajax({
			url: url,
			dataType: 'json',
		}).done(function(data) {
			myGeoObjects = [];
			console.log('data_loaded');
			for (var i in data){
				myGeoObjects[i] = new ymaps.Placemark([data[i]["coord"]["lat"], data[i]["coord"]["lng"]], {
			hintContent: data[i]["coord"]["comment"] + "\n" + data[i]["title"]},{
					preset: color + 'DotIcon'
				});
				
				fn = function(j){
					myGeoObjects[j].events.add(['click'
					], function (e) {
						if (open_by_id != j + url) { // url добавляем для работы с метками с одним i (индексом), но из разных категорий.
							$jq('#log').show();
							var link_html = '<a href="' + data[j]['url'] + '" target="_blank">см. Википедию</a>';
							information = "<b>" + data[j]["title"] + "</b><br><br>" + "<i>Information:</i> " + 
								data[j]["comment"] + "<br>" +
								"<i>Sides:</i>" + data[j]["data"]["sides"] +
								"<br>" + "<i>Date:</i>"  + " from " + data[j]["period"]["from_date"]["day"] + "." + data[j]["period"]["from_date"]["month"] + "." + data[j]["period"]["from_date"]["year"] + " to " + data[j]["period"]["to_date"]["day"] + "." + data[j]["period"]["to_date"]["month"] + "." + data[j]["period"]["to_date"]["year"] + "<br>" + "<i>Ref:</i> " + link_html;	
							$jq('#log').html(information);
							open_by_id = j + url
						}
						else {
							$jq('#log').hide();
							open_by_id = -1;
						}
					});				
				};
				fn(i);
				//myMap.geoObjects.add(myPlacemark)
			};
			clusterer = new ymaps.Clusterer({
				preset: color + 'ClusterIcons',
				clusterDisableClickZoom: false,
				gridSize: 50,
				hasBalloon: false,
				id: type,
				});
			clusterer.add(myGeoObjects);
			myMap.geoObjects.add(clusterer);
		});
	}

	
	ListBox.events.add('click', function (e) {
            var item = e.get('target');
			if (item.data.get('type') != undefined)
			{	
				if (item.data.select == true) {
					var iter = myMap.geoObjects.getIterator();
					var obj = iter.getNext();
					while (isEmpty(obj) == false) {
						if (obj.options.get('id') == item.data.get('type'))
						{
							myMap.geoObjects.remove(obj);
						}
						obj = iter.getNext();
					}
					item.data.select = false;
				} else {
					item.data.select = true;
					type = item.data.get('type')
					color = item.data.get('color')
					create_request(get_events_url(year_from, year_to, type), color, type);
				}
			}
		});
}

ymaps.ready(init);
