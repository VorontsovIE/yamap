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

var myButton =
new ymaps.control.Button(
'<b>Я кнопка</b>'
);
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
"new.json",

{
clusterize: false,
gridSize: 32,
paddingTemplate: 'myCallback',
});

objectManager.objects.options.set('preset', 'islands#greenDotIcon');
objectManager.clusters.options.set('preset', 'islands#greenClusterIcons');
myMap.geoObjects.add(objectManager);

}