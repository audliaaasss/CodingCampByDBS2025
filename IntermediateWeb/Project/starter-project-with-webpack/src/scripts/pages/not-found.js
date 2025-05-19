class NotFoundPage {
    async render() {
        return `
            <div class="not-found-container">
                <h2 class="not-found-title">404 Not Found</h2>
                <div class="not-found-image">
                    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100%" height="100%" fill="none"/>
                        <path d="M40,80 L80,40 L160,40 L160,160 L40,160 Z" stroke="#333" stroke-width="4" fill="none"/>
                        <text x="100" y="110" font-size="48" text-anchor="middle" fill="#333">404</text>
                        <line x1="40" y1="40" x2="60" y2="60" stroke="#333" stroke-width="4"/>
                    </svg>
                </div>
                <p class="not-found-message">The page you're looking for doesn't exist or has been moved.</p>
                <div class="not-found-actions">
                    <a href="#/" class="not-found-button">Back to Home</a>
                </div>
            </div>
        `;
    }

    async afterRender() {
        document.title = 'Not Found | Story App';

        const container = document.querySelector('.not-found-container');
        if (container) {
            container.classList.add('fade-in');
        }
    }
}

export default NotFoundPage;