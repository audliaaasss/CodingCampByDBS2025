import {
    generateStoryItemTemplate, 
    generateStoriesListEmptyTemplate, 
    generateStoriesListErrorTemplate,
    generateLoaderAbsoluteTemplate
} from '../../templates';
import BookmarkPresenter from './bookmark-presenter';
import BookmarkDB from '../../data/database'; 
import '../../../styles/transition.css';

export default class BookmarkPage {
    #presenter = null;
    #bookmarks = [];

    async render() {
        return `
            <section class="container home-page-transition">
                <h1 class="section-title animate-fade-in" tabindex="-1">Bookmarked</h1>
        
                <div class="bookmark-page-description animate-fade-in delay-100">
                    <p>View all your saved stories here. Your bookmarks are available offline!</p>
                </div>

                <div class="stories-list__container">
                    <div id="stories-list" role="list"></div>
                    <div id="stories-list-loading-container"></div>
                </div>
            </section>
        `;
    }

    async afterRender() {
        this.#presenter = new BookmarkPresenter({
            view: this,
            model: BookmarkDB,
        });

        await this.#presenter.getBookmarkedStories();
    }

    populateBookmarkedStories(stories) {
        this.#bookmarks = stories;

        if (!stories || stories.length <= 0) {
            this.populateEmptyStories();
            return;
        }

        const html = stories.reduce((accumulator, story, index) => {
            const animationDelay = Math.min(index * 100, 500);
            
            const storyItem = document.createElement('div');
            storyItem.innerHTML = generateStoryItemTemplate({
                id: story.id,
                name: story.name,
                description: story.description,
                photoUrl: story.photoUrl,
                createdAt: story.createdAt,
                animationDelay,
                className: `story-card-transition-${story.id}`
            });
            
            const storyItemElement = storyItem.firstElementChild;
            
            const moreInfoDiv = storyItemElement.querySelector('.story-item__more-info');
            const bookmarkedInfo = document.createElement('div');
            bookmarkedInfo.className = 'story-item__bookmarked';
            bookmarkedInfo.innerHTML = `<i class="fas fa-bookmark"></i> Bookmarked on ${new Date(story.bookmarkedAt).toLocaleDateString()}`;
            moreInfoDiv.appendChild(bookmarkedInfo);
            
            const readMoreButton = storyItemElement.querySelector('.story-item__read-more');
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'story-item__actions';
            
            const clonedReadMoreButton = readMoreButton.cloneNode(true);
            actionsDiv.appendChild(clonedReadMoreButton);
            
            const removeButton = document.createElement('button');
            removeButton.className = 'btn story-item__read-more remove-bookmark-button';
            removeButton.style.marginLeft = '10px'; 
            removeButton.dataset.id = story.id;
            removeButton.innerHTML = 'Remove <i class="fas fa-trash"></i>';
            actionsDiv.appendChild(removeButton);
            
            readMoreButton.parentNode.replaceChild(actionsDiv, readMoreButton);
            
            return accumulator + storyItemElement.outerHTML;
        }, '');

        const storiesList = document.getElementById('stories-list');
        if (storiesList) {
            storiesList.innerHTML = `
                <div class="stories-list">${html}</div>
            `;
            
            const removeButtons = storiesList.querySelectorAll('.remove-bookmark-button');
            removeButtons.forEach(button => {
                button.addEventListener('click', async (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    const storyId = button.dataset.id;
                    await this.#presenter.removeBookmark(storyId);
                });
            });
        }
    }

    populateEmptyStories() {
        const storiesList = document.getElementById('stories-list');
        if (storiesList) {
            const emptyTemplate = generateStoriesListEmptyTemplate();
            const emptyElement = document.createElement('div');
            emptyElement.innerHTML = emptyTemplate;
            
            const emptyTitle = emptyElement.querySelector('.stories-list__empty h2');
            const emptyText = emptyElement.querySelector('.stories-list__empty p');
            
            if (emptyTitle) emptyTitle.textContent = 'No Bookmarked Stories';
            if (emptyText) emptyText.textContent = 'You have not bookmarked any stories yet. Browse and bookmark stories to view them offline!';
            
            storiesList.innerHTML = emptyElement.innerHTML;
        }
    }

    populateStoriesError(message) {
        const errorTemplate = generateStoriesListErrorTemplate(message);
        const storiesList = document.getElementById('stories-list');
        
        if (storiesList) {
            storiesList.innerHTML = errorTemplate;
        }
    }

    showLoading() {
        const loadingContainer = document.getElementById('stories-list-loading-container');
        if (loadingContainer) {
            loadingContainer.innerHTML = generateLoaderAbsoluteTemplate();
        }
    }

    hideLoading() {
        const loadingContainer = document.getElementById('stories-list-loading-container');
        if (loadingContainer) {
            loadingContainer.innerHTML = '';
        }
    }

    showSuccessMessage(message) {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message animate-scale-up';
        successMessage.textContent = message;

        document.body.appendChild(successMessage);

        setTimeout(() => {
            successMessage.classList.add('animate-fade-out');
            setTimeout(() => {
                successMessage.remove();
            }, 300);
        }, 3000);
    }

    showErrorMessage(message) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message animate-scale-up';
        errorMessage.textContent = message;

        document.body.appendChild(errorMessage);

        setTimeout(() => {
            errorMessage.classList.add('animate-fade-out');
            setTimeout(() => {
                errorMessage.remove();
            }, 300);
        }, 3000);
    }

    showBookmarkedStoriesLoading() {
        this.showLoading();
    }

    hideBookmarkedStoriesLoading() {
        this.hideLoading();
    }

    showBookmarkedStoriesEmpty() {
        this.populateEmptyStories();
    }

    hideBookmarkedStoriesEmpty() {
        //This will be handled by populateBookmarkedStories
    }

    showBookmarkedStoriesError(message) {
        this.populateStoriesError(message);
    }

    hideBookmarkedStoriesError() {
        //This will be handled by populateBookmarkedStories
    }

    showToast(message, isSuccess = true) {
        if (isSuccess) {
            this.showSuccessMessage(message);
        } else {
            this.showErrorMessage(message);
        }
    }
}