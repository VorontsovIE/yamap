ymaps.ready(init);

function init() {
	var myMap = new ymaps.Map('map', {
		center: [55.998333, -2.522778],
		zoom: 10,
		controls: []
	});
	var myPlacemark = new ymaps.Placemark([55.8, 37.6]);
	
	myMap.geoObjects.add(myPlacemark);

	var myCircle = new ymaps.Circle([[55.76, 37.64], 10000], 
		{
			draggable: true
		});
	
	myMap.geoObjects.add(myCircle);

	var myButton = new ymaps.control.Button('<b>Я кнопка</b>');
	
	myButton.events
		.add(
			'press',
			function () {
				alert('Щёлк');
			}
		)
		.add(
			'select',
			function () {
				alert('Нажата');
			}	
		)
		.add(
			'deselect',
			function () {
				alert('Отжата');
			}
		);
		
	myMap.controls.add(myButton, {
		float: "left"
	});

	var myListBox = new ymaps.control.ListBox({
		data: {
		content: 'Список'
		},
		items: [
			new ymaps.control.ListBoxItem('Москва'),
			new ymaps.control.ListBoxItem('Новосибирск'),
			new ymaps.control.ListBoxItem('Нью-Йорк')
		]
	});
	
	myMap.controls.add(myListBox);

	var mylacemark = new ymaps.Placemark([55.76, 37.64], {
            // Чтобы балун и хинт открывались на метке, необходимо задать ей определенные свойства.
            balloonContentHeader: "содержимое",
            balloonContentBody: "Содержимое <em>балуна</em> метки",
            balloonContentFooter: "Подвал",
            hintContent: "Хинт метки"
        });

    myMap.geoObjects.add(mylacemark);

var objectManager = new ymaps.LoadingObjectManager(
"geoobjects.json",
{
clusterize: false,
gridSize: 32,
paddingTemplate: 'myCallback',
});


objectManager.objects.options.set('preset', 'islands#greenDotIcon');
objectManager.clusters.options.set('preset', 'islands#greenClusterIcons');

myMap.events.add('boundschange', function (e) { 
console.log(e.get('newZoom'));
console.log(myMap.geoObjects);
if (e.get('newZoom') != e.get('oldZoom')){
	if (e.get('newZoom') > 8){
		myMap.geoObjects.add(objectManager);
	} else{
		myMap.geoObjects.remove(objectManager);
	}
}

});

var objectManager2 = new ymaps.LoadingObjectManager(
"points.json",
{
clusterize: true,
gridSize: 125,
paddingTemplate: 'myCallback',
});

objectManager2.objects.options.set('preset', 'islands#greenDotIcon');
objectManager2.clusters.options.set('preset', 'islands#greenClusterIcons');
//myMap.geoObjects.add(objectManager2);
 var obj = new ymaps.ObjectManager( {clusterize: true, gridSize: 125})
myMap.geoObjects.add(obj);
 
 $.ajax({
        url: "dan\\test_0.json",
		dataType: 'json',
    }).done(function(data) {

		new_data = { 
			"type": "FeatureCollection",
			"features": []
		}
		console.log(new_data);
     	console.log (data)
		for (var key in data){
			feat = {
				"type":"data[type]",
				"id":14,
				"geometry":{
					"type": "Point", "coordinates": [data["coord"]["lat"], data["coord"]["lng"]]},
					"properties": {"balloonContentBody": "Битвы", "balloonContentFooter": "Подвал",
					"balloonContentHeader": "содержимое", "hintContent": "Битва при Данбаре 2"}
			};
			}
		new_data = { 
			"type": "FeatureCollection",
			"features": [feat]
			}
		console.log(new_data);
		obj.add(new_data);
        });
}