// ToDo: Кластеризатор склеивает метки с одинаковыми координатами, а их надо раздвинуть.

var BaseURL = 'http://localhost:4567';
var year_from = 1500;
var year_to = 1900;
var type = 'military_conflict';
color = '#eee'; // Цвет событий после обновления слайдера будет общим для всех категорий. Надо пофиксить

var countries = '';
var country;


function get_events_url(year_from, year_to, type, countries) {
	return (BaseURL + '/?' + 'year_from=' + year_from + '&year_to=' + year_to + '&type=' + type + '&country=' + countries);
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

$jq(function () {
	$('#country-selector').change(function(event) {
		countries = ($(event.target).val());
		if (countries == null || countries.join == null) { countries=[]; }
		myMap.geoObjects.removeAll();
		create_request(get_events_url(year_from, year_to, type, countries.join(',').toLowerCase()), color);
	});
	
	
  $( "#slider-range" ).slider({
	stop: function(event, ui) {
		year_from = $("#slider-range").slider("values", 0);
		year_to = $("#slider-range").slider("values", 1);
		myMap.geoObjects.removeAll();
		create_countries();
		create_request(get_events_url(year_from, year_to, type, countries), color)
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
					type: 'military_conflict',
					content: 'military_conflict',
					color:'islands#green',
					select: false,
			}}),
		]
	});
	
	
	myMap.controls.add(ListBox);
	'<p><input type="text" maxlength="25" size="20"></p>'
    $jq('#log').toggle();
	
	var open_by_id;
	create_countries = function() {
		var url = BaseURL + '/countries' + '?year_from=' + year_from + '&year_to=' + year_to + '&counter=true';
		$jq.ajax({
			url: url, 
			dataType: 'json',
		}).done(function(data){
			var country_list = [];
			for (var country in data){
				country_list.push({id: data[country][1], text:data[country][0] +' '+ data[country][1]})
			}
			$("select.countries").select2('destroy').empty().select2({
				data: country_list
			});
		})
	}
	$("select.countries").select2();
	create_countries();
	
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
				maxZoom: 13,
				clusterHideIconOnBalloonOpen: false,
				geoObjectHideIconOnBalloonOpen: false,
				clusterDisableClickZoom: true,
				gridSize: 50,
				//hasBalloon: false,
				id: type,
				});
			clusterer.add(myGeoObjects);
			myMap.geoObjects.add(clusterer);
		});
		
		getPointData = function (index) {
            return {
                balloonContentBody: 'балун <strong>метки ' + index + '</strong>',
                clusterCaption: 'метка <strong>' + index + '</strong>'
            };
        };
		
		
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
					create_request(get_events_url(year_from, year_to, type, countries), color, type);
				}
			}
		});
	
	create_request(get_events_url(year_from, year_to, type, ''), color);
}

ymaps.ready(init);

