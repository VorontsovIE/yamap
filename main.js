ymaps.ready(init);

function isEmpty(obj) {
    if (obj == null) return true;
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
}

function init () {
    var log = document.getElementById('log'),
        myMap = new ymaps.Map("map", {
            center: [48.856929, 2.341198],
            zoom: 1,
            controls: []
        });
	var ListBox = new ymaps.control.ListBox({
		data: {
			content: 'Категории'
		},
		items: [
			new ymaps.control.ListBoxItem(
				{data:{
					content: 'Тест 0',
					file: 'data\\test_0.json',
					color: 'islands#darkOrange',
					select: false
			}}),
			new ymaps.control.ListBoxItem(
				{data:{
					content: 'Тест 1',
					file: 'data\\test_1.json',
					color: 'islands#violet',
					select: false,
			}}),
			new ymaps.control.ListBoxItem(
				{data:{
					content: 'Тест 2',
					file: 'data\\test_2.json',
					color:'islands#yellow',
					select: false,
			}}),
			new ymaps.control.ListBoxItem(
				{data:{
					content: 'military_conflict',
					file: 'http://172.20.10.5:4567/?year_from=1&year_to=2000',
					color:'islands#green',
					select: false,
			}}),
		]
	});
	myMap.controls.add(ListBox);

    $jq('#log').toggle();
	
	var open_by_id;
	
	ListBox.events.add('click', function (e) {
            var item = e.get('target');
			if (item.data.get('file') != undefined)
			{	
				if (item.data.select == true) {
					console.log('wrong');
					var iter = myMap.geoObjects.getIterator();
					var obj = iter.getNext();
					while (isEmpty(obj) == false) {
						console.log(obj);
						console.log(obj.options.get('id'));
						if (obj.options.get('id')==item.data.get('file'))
						{
							myMap.geoObjects.remove(obj);
						}
						obj = iter.getNext();
					}
					item.data.select = false;
				} else {
				item.data.select = true;
				console.log(item.data.select);
				var url = item.data.get('file')
				var color = item.data.get('color')
				console.log(item.data.get('content'));
				col=item.data.get('color')+'DotIcon';
				console.log(col);

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
							preset: col
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
					preset: item.data.get('color')+'ClusterIcons',
					clusterDisableClickZoom: true,
					gridSize: 50,
					hasBalloon: false,
					id: url
					});
					console.log(clusterer.options.get("preset"));
				clusterer.add(myGeoObjects);
				myMap.geoObjects.add(clusterer);
				
				});
			}}
		});
}