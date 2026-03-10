document.addEventListener('DOMContentLoaded', function() {
    const reviewsContainer = document.getElementById('reviews-container');

    function loadReviews() {
        reviewsContainer.innerHTML = '<div class="neon-loader"></div>';

        setTimeout(() => {
            const mockReviews = [
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

            reviewsContainer.innerHTML = '';

            mockReviews.forEach(review => {
                const reviewElement = document.createElement('div');
                reviewElement.className = 'review-card neon-card';
                reviewElement.innerHTML = `
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
                        ${review.photos.length > 0 ? `
                            <div class="review-photos">
                                ${review.photos.map(photo => `<img src="${photo}" alt="Фото" class="review-photo">`).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="review-footer">
                        <div class="review-comments">
                            <span>💬 ${review.comments} комментариев</span>
                        </div>
                        <button class="toggle-review-btn neon-button">Развернуть</button>
                    </div>
                `;
                reviewsContainer.appendChild(reviewElement);
            });

            setupReviewToggles();
        }, 1000);
    }

    function setupReviewToggles() {
        const toggleButtons = document.querySelectorAll('.toggle-review-btn');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const reviewCard = this.closest('.review-card');
                const reviewText = reviewCard.querySelector('.review-text');
                const isExpanded = reviewCard.classList.toggle('expanded');
                
                if (isExpanded) {
                    reviewText.style.maxHeight = reviewText.scrollHeight + 'px';
                    this.textContent = 'Свернуть';
                } else {
                    reviewText.style.maxHeight = '100px';
                    this.textContent = 'Развернуть';
                }
            });
        });
    }

    loadReviews();
});