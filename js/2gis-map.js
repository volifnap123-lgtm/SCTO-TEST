window.DG = window.DG || {};
window.DG.then = function(callback) {
    window.DG._callbacks = window.DG._callbacks || [];
    window.DG._callbacks.push(callback);
    return this;
};

document.addEventListener('DOMContentLoaded', function() {
    var script = document.createElement('script');
    script.src = 'https://maps.api.2gis.ru/2.0/loader.js?pkg=full';
    script.onload = function() {
        if (window.DG._callbacks) {
            window.DG._callbacks.forEach(function(cb) { 
                if (typeof cb === 'function') cb(); 
            });
        }
    };
    script.onerror = function() {
        var mapEl = document.getElementById('dgismap');
        if (mapEl) mapEl.innerHTML = '<div style="text-align:center;padding:40px;color:#666;">Ошибка загрузки карты. Проверьте интернет-соединение.</div>';
    };
    document.head.appendChild(script);
});

DG.then(function() {
    if (typeof DG === 'undefined') return;
    
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
});
