var BaseURL = 'http://95.85.18.95:4567';
var year_from = 1500;
var year_to = 1900;
var type = 'military_conflict';
color = '#eee';

var countries = '';
var country;


function get_events_url(year_from, year_to, type, countries) {
	return (BaseURL + '/?' + 'year_from=' + year_from + '&year_to=' + year_to + '&type=' + type + '&country=' + countries);
}

//Перебор объектов не до бесконечности
function isEmpty(obj) {
    if (obj == null) return true;
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
};

var chosen = [];
$jq(function () {

	$('#country-selector select').on('change', function(event) {
		//Ввод и считывание страны
		//.val([chosen]).trigger("change");
		countries = $(event.target).val();
		chosen = countries;
		if (countries == null || countries.join == null) { countries=[]; }
		myMap.geoObjects.removeAll();
		//countries.concat(chosen);
		console.log('cntry');
		create_request(get_events_url(year_from, year_to, type, countries.join(',').toLowerCase()), color);
	});


	//Ползунок
  $( "#slider-range" ).slider({
	stop: function(event, ui) {
		year_from = $("#slider-range").slider("values", 0);
		year_to = $("#slider-range").slider("values", 1);
		myMap.geoObjects.removeAll();
		create_countries(function(){
			create_request(get_events_url(year_from, year_to, type, chosen), color)
		});
		//console.log(chosen);
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
	//Инициализация карты
    myMap = new ymaps.Map("map", {
        center: [48.856929, 15.341198],
        zoom: 2,
        controls: []
    },{suppressMapOpenBlock: true, minZoom: 2});

	//Ограничение просмотра карты по вертикали
	// Копипаста отсюда: https://yandex.ru/blog/mapsapi/36558/56a9547cb15b79e31e0d08a6
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

	//Список с категориями. На карте.
	var category_list = new ymaps.control.ListBox({
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


	myMap.controls.add(category_list);
	'<p><input type="text" maxlength="25" size="20"></p>'
    $jq('#log').toggle();

	var open_by_id;
	create_countries = function(finish_callback) {
		var url = BaseURL + '/countries' + '?year_from=' + year_from + '&year_to=' + year_to + '&counter=true';
		console.log(url);
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
			$('#country-selector select').val(chosen).trigger("change");
			if (finish_callback) {
				finish_callback();
			}
		})
	}
	$("select.countries").select2();
	create_countries();

	//Начинка. Формирование запроса.
	create_request = function(url, color, type) {
		console.log (url);
		$jq.ajax({
			url: BaseURL + '/?year_from=' + year_from + '&year_to=' + year_to + '&only_coord',
			dataType: 'json',
		}).done(function(data) {
			myGeoObjects = [];
			console.log('data_loaded');
			console.log (url);
			for (var i in data){
				//Добавление метки.

				fn = function(j){
					//var link_html = '<a href="' + data[j]['url'] + '" target="_blank">см. Википедию</a>';
					//var information = "<b>" + data[j]["title"] + "</b><br><br>" + "<i>Information:</i> " + data[j]["comment"] + "<br>" + "<i>Sides:</i>" + data[j]["data"]["sides"] + "<br>" + "<i>Date:</i>" + " from " + data[j]["period"]["from_date"]["day"] + "." + data[j]["period"]["from_date"]["month"] + "." + data[j]["period"]["from_date"]["year"] + " to " + data[j]["period"]["to_date"]["day"] + "." + data[j]["period"]["to_date"]["month"] + "." + data[j]["period"]["to_date"]["year"] + "<br>" + "<i>Ref:</i> " + link_html;

					myGeoObjects[j] = new ymaps.Placemark([data[j]["coord"]["lat"], data[j]["coord"]["lng"]], {
						hintContent: data[j]["coord"]["comment"],
						ID: data[j]["eventId"]
						},{
							openBalloonOnClick: false,
							preset: color + 'DotIcon'
							});
					//Генерация текста в окно.
					myGeoObjects[j].events.add('click', function (e) {
						$jq.ajax({
							url: BaseURL + "/by_id?id=" + myGeoObjects[j].properties.get('ID'),
							dataType: 'json',
						}).done(function(inform) {
							var link_html = '<a href="' + inform[0]['url'] + '" target="_blank">см. Википедию</a>';
							var information = "<b>" + inform[0]["title"] + "</b><br><br>" + "<i>Information:</i> " + inform[0]["comment"] + "<br>" + "<i>Sides:</i>" + inform[0]["data"]["sides"] + "<br>" + "<i>Date:</i>" + " from " + inform[0]["period"]["from_date"]["day"] + "." + inform[0]["period"]["from_date"]["month"] + "." + inform[0]["period"]["from_date"]["year"] + " to " + inform[0]["period"]["to_date"]["day"] + "." + inform[0]["period"]["to_date"]["month"] + "." + inform[0]["period"]["to_date"]["year"] + "<br>" + "<i>Ref:</i> " + link_html;
							//Пока у нас информация о метке выводится без помощи балуна, значит записывать её здесь не нужно.
							//myGeoObjects[j].properties.set('hintContent', 'inform[0]["coord"]["comment"] + "\n" + inform[0]["title"]',
							//'balloonContentBody', 'information',
							//'balloonContentHeader', 'inform[j]["title"]');
						
							if (open_by_id != myGeoObjects[j].properties.get('ID')) { 
								$jq('#log').html(information);
								$jq('#log').show();
								open_by_id = myGeoObjects[j].properties.get('ID')
							}
							else {
								$jq('#log').hide();
								open_by_id = -1;
							}
						});
					});
				};
				fn(i);
				//myMap.geoObjects.add(myPlacemark)

			};


			//Кластеризация.
			//clusterer.options.set('geoObjectOpenBalloonOnClick', true)
			var clusterer = new ymaps.Clusterer({
				gridSize: 64,
				hasBalloon: true,
				margin: 10,
				showInAlphabeticalOrder: true,
				zoomMargin: 0,
				clusterDisableClickZoom: true,
				id: type
				});

			clusterer.add(myGeoObjects);
			myMap.geoObjects.add(clusterer);
			//Отдаём информацию о метках при клике на кластер.
			clusterer.events.add('click', function(e) {
				var ID_keeper=[];
				var ID_object=[];
				for (var h in clusterer.geoObjects){
					ID_keeper.push(clusterer.geoObjects[h].properties.get('ID'));
					ID_object.push({clusterer.geoObjects[h].properties.get('ID'): clusterer.geoObjects[h]})
				};
				$jq.ajax({
					url: BaseURL + "/by_id?id=" + ID_keeper.join(','),
					dataType: 'json',
				}).done(function(data) {
					for (var j in data){
						var link_html = '<a href="' + data[j]['url'] + '" target="_blank">см. Википедию</a>';
						var information = "<b>" + data[j]["title"] + "</b><br><br>" + "<i>Information:</i> " + data[j]["comment"] + "<br>" + "<i>Sides:</i>" + data[j]["data"]["sides"] + "<br>" + "<i>Date:</i>" + " from " + data[j]["period"]["from_date"]["day"] + "." + data[j]["period"]["from_date"]["month"] + "." + data[j]["period"]["from_date"]["year"] + " to " + data[j]["period"]["to_date"]["day"] + "." + data[j]["period"]["to_date"]["month"] + "." + data[j]["period"]["to_date"]["year"] + "<br>" + "<i>Ref:</i> " + link_html;
						ID_object[ID_keeper[j]].properties.set('hintContent', 'data[j]["coord"]["comment"] + "\n" + data[j]["title"]',
						'balloonContentBody', 'information',
						'balloonContentHeader', 'data[j]["title"]' );
					}
					
				}
			}




		});
	}


	category_list.events.add('click', function (e) {
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
