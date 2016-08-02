var BaseURL = 'http://95.85.18.95:4567';
BaseURL = 'http://localhost:4567'; // comment, when you need to push on
var year_from = 1500;
var year_to = 1900;
var type = 'military_conflict';
color = '#eee';

var chosen = [];
var countries = [];
var country;

function get_events_url(year_from, year_to, type, countries) {
    var type_filter, country_filter, date_filter, params_array;
    type_filter = type ? ('type=' + type) : '';
    country_filter = countries ? ('country=' + countries.join(',').toLowerCase()) : '';
    date_filter = 'year_from=' + year_from + '&year_to=' + year_to;
    params_array = [date_filter, type_filter, country_filter, 'only_coord'].filter(function(elem, index, arr) {
        return elem; // Leave non-empty elements
    });
    return (BaseURL + '/?' + params_array.join('&'));
}

// Перебор объектов не до бесконечности
function isEmpty(obj) {
    if (obj == null) return true;
    if (obj.length === 0) return true;
    if (obj.length > 0) return false;
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
};

$jq(function () {
    $('#country-selector select').on('change', function(event) {
        // Ввод и считывание страны
        // .val([chosen]).trigger("change");
        countries = $(event.target).val();
        if (countries == null || countries.join == null) {
            countries = [];
        }
        console.log('#country-selector --> change; countries: ' + countries);
        chosen = countries;
        myMap.geoObjects.removeAll();
        // countries.concat(chosen);
        create_request(get_events_url(year_from, year_to, type, countries), color);
    });

    // Date range picker
    $( "#slider-range" ).slider({
        stop: function(event, ui) {
            year_from = $("#slider-range").slider("values", 0);
            year_to = $("#slider-range").slider("values", 1);
            console.log('#slider-range --> stop; from: ' + year_from + '; to: ' + year_to);
            myMap.geoObjects.removeAll();
            create_countries(function(){
                create_request(get_events_url(year_from, year_to, type, chosen), color)
            });
        },
        range: true,
        min: 1,
        max: 2016, // Data().getFullYear(),
        animate: true,
        values: [ year_from, year_to ],
        slide: function(event, ui) {
            $( "#amount" ).val(ui.values[ 0 ] + " - " + ui.values[ 1 ] );
        }
    });
    $( "#amount" ).val($( "#slider-range" ).slider( "values", 0 ) + " - " + $( "#slider-range" ).slider( "values", 1 ) );
});



function map_init () {
    myMap = new ymaps.Map("map", {
        center: [48.856929, 15.341198],
        zoom: 2,
        controls: []
    }, {suppressMapOpenBlock: true, minZoom: 2});

    // Ограничение просмотра карты по вертикали
    // Копипаста отсюда: https://yandex.ru/blog/mapsapi/36558/56a9547cb15b79e31e0d08a6
    // проверка передвижения экрана, не пускает выше и ниже карты (там где уже нет тайлов)
    myMap.action.setCorrection(function (tick) {
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
                {
                    data: {
                        type: 'military_conflict',
                        content: 'military_conflict',
                        color: 'islands#green',
                        select: false,
                    }
                }
            ),
        ]
    });

    myMap.controls.add(category_list);
    '<p><input type="text" maxlength="25" size="20"></p>'
    $jq('#log').toggle();

    var open_by_id;
    create_countries = function(finish_callback) {
        var url = BaseURL + '/countries' + '?year_from=' + year_from + '&year_to=' + year_to + '&counter=true';
        console.log('create_countries -- ' + url);
        $jq.ajax({
            url: url,
            dataType: 'json',
        }).done(
            function(data){
                console.log('create_countries -- data from ' + url + ' loaded');
                var country_list = [];
                for (var country in data){
                    country_list.push({id: data[country][1], text:data[country][0] +' '+ data[country][1]})
                }
                $("select.countries").select2('destroy').empty().select2({
                    data: country_list
                });
                $('#country-selector select').val(chosen).trigger("change");
                if (finish_callback) {
                    console.log('Run create countries callback');
                    finish_callback();
                }
            }
        )
    }
    $("select.countries").select2();
    create_countries();

    set_placemark_content = function(placemark, data) {
        var link_html = '<a href="' + data['url'] + '" target="_blank">см. Википедию</a>';
        var information = "<b>" + data["title"] + "</b><br><br>" + "<i>Information:</i> " + data["comment"] + "<br>" + "<i>Sides:</i>" + data["data"]["sides"] + "<br>" + "<i>Date:</i>" + " from " + data["period"]["from_date"]["day"] + "." + data["period"]["from_date"]["month"] + "." + data["period"]["from_date"]["year"] + " to " + data["period"]["to_date"]["day"] + "." + data["period"]["to_date"]["month"] + "." + data["period"]["to_date"]["year"] + "<br>" + "<i>Ref:</i> " + link_html;
        placemark.properties.set('full_info_loaded', true);
        placemark.properties.set('hintContent', data["title"]);
        placemark.properties.set('balloonContentBody', information);
        placemark.properties.set('balloonContentHeader', data["title"] );
    }

    //Начинка. Формирование запроса.
    create_request = function(url, color, type) {
        console.log('create_request -- ' + url);
        $jq.ajax({
            url: url,
            dataType: 'json',
        }).done(
            function(data) {
                console.log('create request -- data from ' + url + ' loaded');
                myGeoObjects = [];
                for (var i in data){
                    // Add placemark
                    fn = function(j){
                        myGeoObjects[j] = new ymaps.Placemark([data[j]["coord"]["lat"], data[j]["coord"]["lng"]], {
                            hintContent: data[j]["coord"]["comment"],
                            ID: data[j]["eventId"]
                        },{
                            openBalloonOnClick: true,
                            preset: color + 'DotIcon'
                        });
                    };
                    fn(i);
                    // myMap.geoObjects.add(myPlacemark)
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
                // Load info on click to a cluster
                clusterer.events.add('click', function(event) {
                    console.log('create_request, cluster click triggered');
                    var placemark_ids_to_load = [];
                    var placemark_by_id = {};
					if ((event.get('target')) instanceof ymaps.Placemark == false){
                        var cluster_placemarks = event.get('target').getGeoObjects();
					}
					else{
						var cluster_placemarks = [event.get('target')]
					}
                    for (var placemark_index in cluster_placemarks) {
                        var placemark = cluster_placemarks[placemark_index];
                        var placemark_id = placemark.properties.get('ID');
                        placemark_by_id[placemark_id] = placemark;
                        if (! placemark.properties.get('full_info_loaded')) {
                          placemark_ids_to_load.push(placemark_id);
                        }
                    }

                    if (placemark_ids_to_load.length > 0) {
                        var cluster_url = BaseURL + "/by_id?id=" + placemark_ids_to_load.join(',');
                        console.log('create_request, cluster click -- ' + cluster_url);
                        $jq.ajax({
                            url: cluster_url,
                            dataType: 'json',
                        }).done(
                            function(data) {
                                console.log('create_request, cluster click -- data from ' + cluster_url + ' loaded');
                                for (var j in data){
                                    var eventId = data[j]['eventId'];
                                    set_placemark_content(placemark_by_id[eventId], data[j])
                                }
                            }
                        );
						//Балун метки может загрузиться только с информацией, если её нет во время клика, надо вызывать балун отдельно.
						if ((event.get('target')) instanceof ymaps.Placemark == true){
							var geoObject = event.get('target'),
                            position = event.get('globalPixels'),
							balloon = geoObject.balloon.open(position);
					    } 
                    }

                });
            }
        );
    }

    category_list.events.add('click', function (e) {
        console.log('Category selector clicked');
        var item = e.get('target');
        if (item.data.get('type') != undefined) {
            if (item.data.select == true) {
                console.log('Category selector -- event removal');
                var iter = myMap.geoObjects.getIterator();
                var obj = iter.getNext();
                while (isEmpty(obj) == false) {
                    if (obj.options.get('id') == item.data.get('type')) {
                        myMap.geoObjects.remove(obj);
                    }
                    obj = iter.getNext();
                }
                item.data.select = false;
            } else {
                item.data.select = true;
                type = item.data.get('type')
                color = item.data.get('color')
                console.log('Category selector -- request for events');
                create_request(get_events_url(year_from, year_to, type, countries), color, type);
            }
        }
    });

    console.log('Request for events on initial page load');
    create_request(get_events_url(year_from, year_to, type, []), color);
}

ymaps.ready(map_init);
