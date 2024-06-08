document.addEventListener('DOMContentLoaded', function() {
    const categoryCards = document.querySelectorAll('.category-card');

    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const subcategories = this.querySelector('.subcategories');
            if (subcategories) {
                subcategories.style.display = subcategories.style.display === 'block' ? 'none' : 'block';
            }
        });
    });
});