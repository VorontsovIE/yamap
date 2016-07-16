ymaps.ready(init);

function init () {
    var log = document.getElementById('log'),
        myMap = new ymaps.Map("map", {
            center: [48.856929, 2.341198],
            zoom: 1,
            controls: []
        });

    $jq('#log').toggle();
	
	var open_by_id;
	
	$jq.ajax({
        url: "test_6.json",
		dataType: 'json',
    }).done(function(data) {
     	console.log (data)
		for (var i in data){
			myPlacemark = new ymaps.Placemark([data[i]["coord"]["lat"], data[i]["coord"]["lng"]], {
				hintContent: data[i]["coord"]["comment"] + "\n" + data[i]["title"]
			});
			
			fn = function(j){
				myPlacemark.events.add(['click'
				], function (e) {
					if (open_by_id != j) {
						$jq('#log').show();
						information = data[j]["comment"] + "\n" + "Sides:" + data[j]["data"]["sides"] + "\n" + "Date:" + data[j]["period"]["to_date"]["day"] + "." + data[j]["period"]["to_date"]["month"] + "." + data[j]["period"]["to_date"]["year"] + " to " + data[j]["period"]["from_date"]["day"] + "." + data[j]["period"]["from_date"]["month"] + "." + data[j]["period"]["from_date"]["year"] + "\n" + "Ref: " + data[j]["url"];	
						log.innerText = information;
						open_by_id = j
					}
					else {
						$jq('#log').hide();
						open_by_id = -1;
					}
				});				
			};
			fn(i);
			myMap.geoObjects.add(myPlacemark)
		}
	});
}