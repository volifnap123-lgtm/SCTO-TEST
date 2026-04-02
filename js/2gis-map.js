document.addEventListener('DOMContentLoaded', function() {
    function initMap() {
        if (typeof DG === 'undefined' || typeof DG.map !== 'function') {
            console.log('2ГИС ещё загружается...');
            setTimeout(initMap, 500);
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
    }
    
    function loadDGScript() {
        if (document.getElementById('dgismap')) {
            if (typeof DG !== 'undefined' && typeof DG.map === 'function') {
                initMap();
            } else {
                var script = document.createElement('script');
                script.src = 'https://maps.api.2gis.ru/2.0/loader.js?pkg=full';
                script.onload = function() {
                    setTimeout(initMap, 100);
                };
                script.onerror = function() {
                    var mapEl = document.getElementById('dgismap');
                    if (mapEl) mapEl.innerHTML = '<div style="text-align:center;padding:40px;color:#666;">Ошибка загрузки карты</div>';
                };
                document.head.appendChild(script);
            }
        }
    }
    
    if (document.readyState === 'complete') {
        loadDGScript();
    } else {
        window.addEventListener('load', loadDGScript);
    }
});
