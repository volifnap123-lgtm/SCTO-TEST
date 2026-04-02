var mapInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    function initMap() {
        if (mapInitialized) return;
        
        var mapContainer = document.getElementById('dgismap');
        if (!mapContainer) return;
        
        if (typeof DG !== 'undefined' && typeof DG.map === 'function') {
            var existingMap = mapContainer.innerHTML;
            if (existingMap && existingMap.trim() !== '') {
                mapInitialized = true;
                return;
            }
            
            var map = DG.map('dgismap', {
                center: [51.833466, 107.594453],
                zoom: 18,
                fullscreenControl: false,
                zoomControl: true
            });

            DG.marker([51.833466, 107.594453]).addTo(map).bindPopup(
                '<strong>СЦТО "Правка Дисков"</strong><br>' +
                'ул. Революции 1905 года, 13а<br>' +
                'Улан-Удэ<br>' +
                '<a href="https://2gis.ru/ulanude/firm/5207815350139447" target="_blank">Открыть в 2ГИС</a>'
            );
            
            mapInitialized = true;
        } else {
            setTimeout(initMap, 200);
        }
    }
    
    if (document.getElementById('dgismap')) {
        if (typeof DG !== 'undefined' && typeof DG.map === 'function') {
            initMap();
        } else if (typeof DG !== 'undefined' && DG.then) {
            DG.then(function() {
                setTimeout(initMap, 300);
            });
        } else {
            setTimeout(initMap, 500);
        }
    }
});
