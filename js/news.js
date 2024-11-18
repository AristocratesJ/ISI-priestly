document.addEventListener('DOMContentLoaded', () => {
    // Theme switcher functionality
    const toggleSwitch = document.querySelector('#checkbox');
    const currentTheme = localStorage.getItem('theme') || 'light';

    document.documentElement.setAttribute('data-theme', currentTheme);
    toggleSwitch.checked = currentTheme === 'dark';

    toggleSwitch.addEventListener('change', function(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });

    // Date filter functionality - Only execute if element exists
    const dateFilter = document.querySelector('#dateFilter');
    if (dateFilter) {
        const today = new Date().toISOString().split('T')[0];
        dateFilter.value = today;

        dateFilter.addEventListener('change', function(e) {
            console.log('Filtering for date:', e.target.value);
        });
    }

    // Add News button functionality
    const addNewsBtn = document.querySelector('.btn-primary');
    if (addNewsBtn) {
        addNewsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Funkcja dodawania ogłoszenia będzie dostępna wkrótce!');
        });
    }

    // News card hover effects
    const newsCards = document.querySelectorAll('.news-card');
    newsCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Read more buttons
    const readMoreBtns = document.querySelectorAll('.btn-outline-primary');
    readMoreBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Pełna treść artykułu będzie dostępna wkrótce!');
        });
    });

    // Simulate real-time updates
    function updateViewCount() {
        const viewCounters = document.querySelectorAll('.news-stats .fa-eye');
        viewCounters.forEach(counter => {
            const currentCount = parseInt(counter.parentElement.textContent.trim());
            counter.parentElement.textContent = ` ${currentCount + Math.floor(Math.random() * 3)}`;
            counter.parentElement.prepend(counter.cloneNode(true));
        });
    }

    // Update view counts every 30 seconds
    setInterval(updateViewCount, 30000);

    // Initialize tooltips if Bootstrap is loaded
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
}); 