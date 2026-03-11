document.addEventListener('DOMContentLoaded', function() {
    const reviewsContainer = document.getElementById('reviews-container');
    let currentIndex = 0;
    
    const reviewsData = [
        {
            id: 1,
            author: 'Иван Петров',
            rating: 5,
            date: '15.02.2026',
            text: 'Отличная работа! Привёз колесо после сильного удара, думал уже не спасти. Мастера сделали всё качественно, диск как новый. Рекомендую!',
            photos: ['images/placeholder.jpg'],
            comments: 3
        },
        {
            id: 2,
            author: 'Алексей Смирнов',
            rating: 5,
            date: '10.02.2026',
            text: 'Обратился в эту мастерскую по рекомендации друга. Не пожалел! Правка диска заняла меньше часа, цена адекватная. Теперь только сюда!',
            photos: [],
            comments: 1
        },
        {
            id: 3,
            author: 'Мария Козлова',
            rating: 4,
            date: '05.02.2026',
            text: 'Хороший сервис. Отремонтировали два диска после зимней эксплуатации. Единственное, пришлось подождать дольше обещанного времени, но результат того стоил.',
            photos: ['images/placeholder.jpg', 'images/placeholder.jpg'],
            comments: 0
        },
        {
            id: 4,
            author: 'Дмитрий Иванов',
            rating: 5,
            date: '28.01.2026',
            text: 'Профессионалы своего дела! Правили литой диск после попадания в яму. Сделали аккуратно, без следов ремонта. Спасибо за качественную работу!',
            photos: [],
            comments: 2
        },
        {
            id: 5,
            author: 'Елена Васильева',
            rating: 5,
            date: '20.01.2026',
            text: 'Очень довольна сервисом. Мастера вежливые, всё объяснили, показали. Диск восстановили полностью. Цены вполне адекватные за такое качество.',
            photos: ['images/placeholder.jpg'],
            comments: 0
        }
    ];

    function renderReview(index) {
        const review = reviewsData[index];
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        
        // Создаем HTML для отзыва
        let photosHtml = '';
        if (review.photos && review.photos.length > 0) {
            photosHtml = `
                <div class="review-photos">
                    ${review.photos.map(photo => `<img src="${photo}" alt="Фото" class="review-photo">`).join('')}
                </div>
            `;
        }
        
        reviewCard.innerHTML = `
            <div class="review-header">
                <div class="review-author">
                    <div class="author-avatar neon-border">👤</div>
                    <div class="author-info">
                        <div class="author-name">${review.author}</div>
                        <div class="review-date">${review.date}</div>
                    </div>
                </div>
                <div class="review-rating">
                    ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                </div>
            </div>
            <div class="review-body">
                <p class="review-text">${review.text}</p>
                ${photosHtml}
            </div>
            <div class="review-footer">
                <div class="review-comments">💬 ${review.comments} комментариев</div>
                <div class="review-controls">
                    <button class="review-nav prev">‹</button>
                    <button class="review-nav next">›</button>
                    <button class="review-more">Подробнее</button>
                </div>
            </div>
        `;
        
        reviewsContainer.innerHTML = '';
        reviewsContainer.appendChild(reviewCard);
        
        // Добавляем обработчики событий
        setupReviewControls(index);
    }

    function setupReviewControls(index) {
        const prevBtn = document.querySelector('.review-nav.prev');
        const nextBtn = document.querySelector('.review-nav.next');
        const moreBtn = document.querySelector('.review-more');
        
        prevBtn.addEventListener('click', function() {
            const newIndex = (index - 1 + reviewsData.length) % reviewsData.length;
            renderReview(newIndex);
        });
        
        nextBtn.addEventListener('click', function() {
            const newIndex = (index + 1) % reviewsData.length;
            renderReview(newIndex);
        });
        
        moreBtn.addEventListener('click', function() {
            if (moreBtn.classList.contains('expanded')) {
                moreBtn.textContent = 'Подробнее';
                moreBtn.classList.remove('expanded');
                document.querySelector('.review-text').style.maxHeight = '100px';
            } else {
                moreBtn.textContent = 'Свернуть';
                moreBtn.classList.add('expanded');
                document.querySelector('.review-text').style.maxHeight = 'none';
            }
        });
    }

    function loadReviews() {
        reviewsContainer.innerHTML = '<div class="skeleton-review"></div>';
        
        setTimeout(() => {
            renderReview(currentIndex);
        }, 800);
    }

    loadReviews();
});