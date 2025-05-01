import {
    generateStoryItemTemplate, 
    generateStoriesListEmptyTemplate, 
    generateStoriesListErrorTemplate,
    generateLoaderAbsoluteTemplate,
    generateAddStoryButtonTemplate
} from '../../templates';
import HomePresenter from './home-presenter';
import * as StoryAPI from '../../data/api';

export default class HomePage {
    #presenter = null;

    async render() {
        return `
            <section class="container">
                <h1 class="section-title">Stories</h1>
        
                <div class="add-story-container">
                    ${generateAddStoryButtonTemplate()}
                </div>

                <div class="stories-list__container">
                    <div id="stories-list"></div>
                    <div id="stories-list-loading-container"></div>
                </div>
            </section>
        `;
    }

    async afterRender() {
        this.#presenter = new HomePresenter({
            view: this,
            model: StoryAPI,
        });

        await this.#presenter.initialStories();
    }

    populateStories(stories) {
        if (stories.length <= 0) {
            this.populateEmptyStories();
            return;
        }

        const html = stories.reduce((accumulator, story) => {
            return accumulator.concat(
                generateStoryItemTemplate({
                    id: story.id,
                    name: story.name,
                    description: story.description,
                    photoUrl: story.photoUrl,
                    createdAt: story.createdAt,
                }),
            );
        }, '');

        document.getElementById('stories-list').innerHTML = `
            <div class="stories-list">${html}</div>
        `;
    }

    populateEmptyStories() {
        document.getElementById('stories-list').innerHTML = generateStoriesListEmptyTemplate();
    }

    populateStoriesError(message) {
        document.getElementById('stories-list').innerHTML = generateStoriesListErrorTemplate(message);

        document.getElementById('retry-button').addEventListener('click', () => {
            this.#presenter.initialStories();
        });
    }

    showLoading() {
        document.getElementById('stories-list-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
    }

    hideLoading() {
        document.getElementById('stories-list-loading-container').innerHTML = '';
    }

    showSuccessMessage(message) {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-messae';
        successMessage.textContent = message;

        document.body.appendChild(successMessage);

        setTimeout(() => {
            successMessage.remove();
        }, 3000);
    }

    showErrorMessage(message) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = message;

        document.body.appendChild(errorMessage);

        setTimeout(() => {
            errorMessage.remove();
        }, 3000);
    }
}
