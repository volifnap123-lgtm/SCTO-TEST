document.addEventListener('DOMContentLoaded', function() {
    function initMap() {
        if (typeof DG === 'undefined') {
            console.error('2ГИС не загрузился');
            document.getElementById('dgismap').innerHTML = '<div style="text-align:center;padding:40px;color:#666;">Карта временно недоступна</div>';
            return;
        }
        
        const map = DG.map('dgismap', {
            center: [51.833466, 107.594453],
            zoom: 18,
            fullscreenControl: false
        });

        DG.marker([51.833466, 107.594453]).addTo(map).bindPopup(
            '<strong>СЦТО "Правка Дисков"</strong><br>' +
            'ул. Революции 1905 года, 13а, Улан-Удэ<br>' +
            '<a href="https://2gis.ru/ulanude/firm/5207815350139447" target="_blank">Открыть в 2ГИС</a>'
        );

        try {
            DG.control.location({ position: 'topleft' }).addTo(map);
        } catch(e) {
            console.log('Location control not available');
        }
    }
    
    if (document.getElementById('dgismap')) {
        if (typeof DG !== 'undefined') {
            initMap();
        } else {
            window.DG = { then: function(cb) { window.dgCallbacks = window.dgCallbacks || []; window.dgCallbacks.push(cb); }};
            
            var script = document.createElement('script');
            script.src = 'https://maps.api.2gis.ru/2.0/loader.js?pkg=full';
            script.onload = function() {
                if (window.dgCallbacks) {
                    window.dgCallbacks.forEach(function(cb) { cb(); });
                }
                initMap();
            };
            script.onerror = function() {
                document.getElementById('dgismap').innerHTML = '<div style="text-align:center;padding:40px;color:#666;">Ошибка загрузки карты</div>';
            };
            document.head.appendChild(script);
        }
    }
});
