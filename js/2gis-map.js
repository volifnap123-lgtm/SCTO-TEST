document.addEventListener('DOMContentLoaded', function() {
    function initMap() {
        if (document.getElementById('dgismap')) {
            if (typeof DG !== 'undefined' && typeof DG.map === 'function') {
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
            } else {
                setTimeout(initMap, 200);
            }
        }
    }
    
    if (document.getElementById('dgismap')) {
        if (typeof DG !== 'undefined' && typeof DG.map === 'function') {
            initMap();
        } else {
            if (typeof DG !== 'undefined' && DG.then) {
                DG.then(function() {
                    setTimeout(initMap, 300);
                });
            } else {
                setTimeout(initMap, 500);
            }
        }
    }
});

window.addEventListener('load', function() {
    if (document.getElementById('dgismap')) {
        setTimeout(function() {
            if (typeof DG !== 'undefined' && typeof DG.map === 'function') {
                var existingMap = document.getElementById('dgismap').innerHTML;
                if (!existingMap || existingMap.trim() === '') {
                    var map = DG.map('dgismap', {
                        center: [51.833466, 107.594453],
                        zoom: 18,
                        fullscreenControl: false,
                        zoomControl: true
                    });

                    DG.marker([51.833466, 107.594453]).addTo(map).bindPopup(
                        '<strong>СЦТО "Правка Дисков"</strong><br>' +
                        'ул. Революции 1905 года, 13а<br>' +
                        'Улан-Удэ'
                    );
                }
            }
        }, 1000);
    }
});
