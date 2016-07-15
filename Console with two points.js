ymaps.ready(init);

function init () {
    var log = document.getElementById('log'),
        myMap = new ymaps.Map("map", {
            center: [48.856929, 2.341198],
            zoom: 1,
            controls: []
        }),
    myPlacemark1 = new ymaps.Placemark(myMap.getCenter(), {
        hintContent: 'Метка 1.'
    });
    $jq('#log').toggle();
    myPlacemark1.events.add([
        'click'
    ], function (e) {
        $jq('#log').toggle();
        log.innerHTML = "Здесь будет вся информация по метке 1.";
    });
    myPlacemark2 = new ymaps.Placemark([59, 63], {
        hintContent: 'Метка 2.'
    });
    $jq('#log').toggle();
    myPlacemark2.events.add([
        'click'
    ], function (e) {
        $jq('#log').toggle();
        log.innerHTML = "Здесь будет вся информация по метке 2.";
    });

    myMap.geoObjects.add(myPlacemark1);
    myMap.geoObjects.add(myPlacemark2);


}