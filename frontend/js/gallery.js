document.addEventListener('DOMContentLoaded', function() {
    const mainImg = document.getElementById('main-img');
    const caption = document.getElementById('caption');
    const thumbs = document.querySelectorAll('.thumb');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    let currentIndex = 0;

    function updateGallery(index) {
        if (index >= 0 && index < thumbs.length) {
            currentIndex = index;
            const thumb = thumbs[currentIndex];
            mainImg.src = thumb.getAttribute('data-src');
            caption.textContent = thumb.getAttribute('data-caption');
            
            thumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        }
    }

    thumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', function() {
            updateGallery(index);
        });
    });

    prevBtn.addEventListener('click', function() {
        const newIndex = (currentIndex - 1 + thumbs.length) % thumbs.length;
        updateGallery(newIndex);
    });

    nextBtn.addEventListener('click', function() {
        const newIndex = (currentIndex + 1) % thumbs.length;
        updateGallery(newIndex);
    });

    updateGallery(0);
});