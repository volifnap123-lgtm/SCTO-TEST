document.addEventListener('DOMContentLoaded', function() {
    const photosGrid = document.getElementById('photosGrid');
    const addPhotoBtn = document.getElementById('addPhotoBtn');
    const addPhotoModal = document.getElementById('addPhotoModal');
    const closePhotoModal = document.getElementById('closePhotoModal');
    const addPhotoForm = document.getElementById('addPhotoForm');

    function loadPhotos() {
        if (!photosGrid) return;
        
        photosGrid.innerHTML = '<div class="skeleton-photo"></div><div class="skeleton-photo"></div><div class="skeleton-photo"></div><div class="skeleton-photo"></div>';
        
        setTimeout(() => {
            const photos = JSON.parse(localStorage.getItem('adminPhotos') || '[]');
            photosGrid.innerHTML = '';
            
            if (photos.length === 0) {
                photosGrid.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🖼️</div>
                        <h3>Галерея пуста</h3>
                        <p>Добавьте первое фото, чтобы оно появилось на сайте</p>
                    </div>
                `;
                return;
            }
            
            photos.forEach(photo => {
                const card = document.createElement('div');
                card.className = 'photo-card-admin';
                card.innerHTML = `
                    <img src="${photo.url}" alt="${photo.caption}" onerror="this.src='../frontend/images/placeholder.jpg'">
                    <div class="photo-caption">${photo.caption}</div>
                    <div class="photo-actions">
                        <button class="edit-photo" data-id="${photo.id}" title="Редактировать">✏️</button>
                        <button class="delete-photo" data-id="${photo.id}" title="Удалить">🗑️</button>
                    </div>
                `;
                photosGrid.appendChild(card);
            });
            
            setupPhotoActions();
        }, 800);
    }

    function setupPhotoActions() {
        const editButtons = document.querySelectorAll('.edit-photo');
        const deleteButtons = document.querySelectorAll('.delete-photo');
        
        editButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                editPhoto(id);
            });
        });
        
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                if (confirm('Вы уверены, что хотите удалить это фото?')) {
                    deletePhoto(id);
                }
            });
        });
    }

    function editPhoto(id) {
        const photos = JSON.parse(localStorage.getItem('adminPhotos') || '[]');
        const photo = photos.find(p => p.id === id);
        
        if (photo) {
            addPhotoModal.style.display = 'block';
            document.getElementById('photoUrl').value = photo.url;
            document.getElementById('photoCaption').value = photo.caption;
            
            const saveBtn = document.createElement('button');
            saveBtn.className = 'neon-button full-width';
            saveBtn.textContent = 'Сохранить изменения';
            saveBtn.onclick = function() {
                photo.url = document.getElementById('photoUrl').value;
                photo.caption = document.getElementById('photoCaption').value;
                localStorage.setItem('adminPhotos', JSON.stringify(photos));
                addPhotoModal.style.display = 'none';
                loadPhotos();
                alert('Фото успешно обновлено!');
            };
            
            const form = document.getElementById('addPhotoForm');
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.style.display = 'none';
            }
            
            const existingSaveBtn = form.querySelector('.save-changes-btn');
            if (existingSaveBtn) existingSaveBtn.remove();
            
            form.appendChild(saveBtn);
        }
    }

    function deletePhoto(id) {
        let photos = JSON.parse(localStorage.getItem('adminPhotos') || '[]');
        const photo = photos.find(p => p.id === id);
        
        if (photo) {
            photos = photos.filter(p => p.id !== id);
            localStorage.setItem('adminPhotos', JSON.stringify(photos));
            loadPhotos();
            alert('Фото удалено');
        }
    }

    if (addPhotoBtn) {
        addPhotoBtn.addEventListener('click', () => {
            addPhotoModal.style.display = 'block';
            
            const form = document.getElementById('addPhotoForm');
            const saveBtn = form.querySelector('.save-changes-btn');
            if (saveBtn) saveBtn.remove();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.style.display = 'block';
        });
    }

    if (closePhotoModal) {
        closePhotoModal.addEventListener('click', () => {
            addPhotoModal.style.display = 'none';
            document.getElementById('addPhotoForm').reset();
        });
    }

    if (addPhotoForm) {
        addPhotoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const url = document.getElementById('photoUrl').value;
            const caption = document.getElementById('photoCaption').value;
            
            const photos = JSON.parse(localStorage.getItem('adminPhotos') || '[]');
            photos.push({
                id: Date.now(),
                url,
                caption,
                createdAt: new Date().toISOString()
            });
            
            localStorage.setItem('adminPhotos', JSON.stringify(photos));
            
            alert('Фото успешно добавлено!');
            addPhotoForm.reset();
            addPhotoModal.style.display = 'none';
            loadPhotos();
        });
    }

    loadPhotos();
});