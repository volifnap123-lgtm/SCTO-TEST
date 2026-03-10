document.addEventListener('DOMContentLoaded', function() {
    DG.then(function() {
        const map = DG.map('dgismap', {
            center: [51.833466, 107.594453],
            zoom: 18,
            fullscreenControl: false
        });

        DG.marker([51.833466, 107.594453]).addTo(map).bindPopup(
            '<strong>СЦТО "Правка Дисков"</strong><br>' +
            'ул. Революции 1905 года, 13а, Улан-Удэ'
        );

        const routeControl = DG.control.route({
            waypoints: [
                null,
                DG.latLng(51.833466, 107.594453)
            ],
            routeDraggable: true,
            fitSelectedRoutes: true
        }).addTo(map);

        DG.control.location({ position: 'topleft' }).addTo(map);
    });
});