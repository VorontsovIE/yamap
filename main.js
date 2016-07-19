ymaps.ready(init)

function change_url(year_from, year_to, type) {
	var base_url = 'http://172.20.10.5:4567/?'  //year_from=' // 1&year_to=2000'
	return (base_url + 'year_from=' + year_from + '&year_to=' + year_to + '&type=' + type);
}

var year_from = 300;
var year_to = 700;
var type = '';

col = '#eeee'

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
		create_request(change_url(year_from, year_to, type), col)
    },
    range: true,
    min: 1,
    max: 2999,
	animate: true,
    values: [ 300, 700 ],
    slide: function( event, ui ) {
      $( "#amount" ).val(ui.values[ 0 ] + " - " + ui.values[ 1 ] );
    }
  });
  $( "#amount" ).val($( "#slider-range" ).slider( "values", 0 ) +
    " - " + $( "#slider-range" ).slider( "values", 1 ) );
});
  

function init () {
    var log = document.getElementById('log');
	other_element = $('#slider-range');
    myMap = new ymaps.Map("map", {
        center: [48.856929, 15.341198],
        zoom: 3,
        controls: []
    },{suppressMapOpenBlock: true});
	console.log(other_element.slider("values", 1));
	
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

	create_request = function(url, col, type) {
		$jq.ajax({
			url: url,
			dataType: 'json',
		}).done(function(data) {
			myGeoObjects = [];
			console.log ('data_loaded');
			console.log(data);
			for (var i in data){
				myGeoObjects[i] = new ymaps.Placemark([data[i]["coord"]["lat"], data[i]["coord"]["lng"]], {
			hintContent: data[i]["coord"]["comment"] + "\n" + data[i]["title"]},{
					preset: col + 'DotIcon'
				});
				
				fn = function(j){
					myGeoObjects[j].events.add(['click'
					], function (e) {
						if (open_by_id != j + url) {
							$jq('#log').show();
							information = data[j]["comment"] + "\n" + "Sides:" + data[j]["data"]["sides"] + "\n" + "Date:" + data[j]["period"]["to_date"]["day"] + "." + data[j]["period"]["to_date"]["month"] + "." + data[j]["period"]["to_date"]["year"] + " to " + data[j]["period"]["from_date"]["day"] + "." + data[j]["period"]["from_date"]["month"] + "." + data[j]["period"]["from_date"]["year"] + "\n" + "Ref: " + data[j]["url"];	
							log.innerText = information;
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
			preset: col+'ClusterIcons',
			clusterDisableClickZoom: true,
			gridSize: 50,
			hasBalloon: false,
			id: type,
			});
			console.log(clusterer.options.get("preset"));
		clusterer.add(myGeoObjects);
		myMap.geoObjects.add(clusterer);
		
		});
	}

	
	ListBox.events.add('click', function (e) {
            var item = e.get('target');
			if (item.data.get('type') != undefined)
			{	
				if (item.data.select == true) {
					console.log('wrong');
					var iter = myMap.geoObjects.getIterator();
					var obj = iter.getNext();
					while (isEmpty(obj) == false) {
						console.log(obj);
						console.log(obj.options.get('id'));
						if (obj.options.get('id') == item.data.get('type'))
						{
							myMap.geoObjects.remove(obj);
						}
						obj = iter.getNext();
					}
					item.data.select = false;
				} else {
				item.data.select = true;
				console.log(item.data.select);
				type = item.data.get('type')
				color = item.data.get('color')
				console.log(item.data.get('type'));
				col=item.data.get('color');
				console.log(col);
				create_request(change_url(year_from, year_to, type), col, type);
			}}
		});
}