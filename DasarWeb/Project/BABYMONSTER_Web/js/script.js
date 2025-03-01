function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach (page => {
        page.style.display = 'none';
    });

    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.style.display = 'block';
    }

    activeState(pageId);
}

function activeState(pageId) {
    const navLinks = document.querySelectorAll('.nav-list li a');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    let activeLink;

    if (pageId === 'profile') {
        activeLink = document.querySelector('.nav-list li a[onclick="showPage(\'profile\')"]');
    } else if (pageId === 'discography') {
        activeLink = document.querySelector('.nav-list li a[onclick="showPage(\'discography\')"]');
    } else if (pageId === 'fandom') {
        activeLink = document.querySelector('.nav-list li a[onclick="showPage(\'fandom\')"]');
    } else if (['ruka', 'pharita', 'asa', 'ahyeon', 'rami', 'rora', 'chiquita'].includes(pageId)) {
        // If it's a member page, highlight the Member dropdown
        activeLink = document.querySelector('.nav-list li.dropdown > a');
    }

    if (activeLink) {
        activeLink.classList.add('active');
    }
}

showPage('profile')

document.addEventListener('DOMContentLoaded', function() {
    const slideContainer = document.querySelector('.slide-container');
    const dots = document.querySelectorAll('.slide-dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const items = document.querySelectorAll('.album-item');

    let currentIndex = 0;
    const itemsPerView = window.innerWidth <= 768 ? 2 : 3;
    const maxIndex = Math.ceil(items.length / itemsPerView) - 1;

    updateSlide();
    mobileView();

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            currentIndex = parseInt(dot.getAttribute('data-index'));
            updateSlide();
        });
    });

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlide()
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateSlide();
        }
    });

    function updateSlide() {
        if (window.innerWidth > 768) {
            const translateX = -currentIndex * (100 / itemsPerView) * itemsPerView;
            slideContainer.style.transform = `translateX(${translateX}%)`;

            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });

            prevBtn.style.display = currentIndex === 0 ? 'none' : 'flex';
            nextBtn.style.display = currentIndex === maxIndex ? 'none' : 'flex';
        }
    }

    function mobileView() {
        if (window.innerWidth <= 768) {
            slideContainer.style.transform = 'none';
        }
    }

    window.addEventListener('resize', () => {
        mobileView();
        if (window.innerWidth > 768) {
            updateSlide();
        }
    });
}); 