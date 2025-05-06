import {
    generateStoryItemTemplate, 
    generateStoriesListEmptyTemplate, 
    generateStoriesListErrorTemplate,
    generateLoaderAbsoluteTemplate,
    generateAddStoryButtonTemplate
} from '../../templates';
import HomePresenter from './home-presenter';
import * as StoryAPI from '../../data/api';
import Map from '../../utils/map';
import 'leaflet/dist/leaflet.css';
import '../../../styles/transition.css'

export default class HomePage {
    #presenter = null;
    #map = null;
    #stories = [];

    async render() {
        return `
            <section class="container home-page-transition">
                <h1 class="section-title animate-fade-in" tabindex="-1">Stories</h1>
        
                <div class="add-story-container animate-fade-in delay-100">
                    ${generateAddStoryButtonTemplate()}
                </div>

                <div class="map-container content-with-transition">
                    <h2>Stories Map</h2>
                    <div id="stories-map" style="height: 400px; margin-bottom: 20px;"></div>
                </div>

                <div class="stories-list__container content-with-transition">
                    <div id="stories-list" role="list"></div>
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

        try {
            this.#map = await Map.build('#stories-map', {
                center: [-2.5489, 118.0149],
                zoom: 5
            });
        } catch (error) {
            console.error('Error initializing map:', error);
            document.getElementById('stories-map').innerHTML = '<p>Unable to load map. Please try again later.</p>';
        }

        await this.#presenter.initialStories();
    }

    populateStories(stories) {
        this.#stories = stories;

        if (stories.length <= 0) {
            this.populateEmptyStories();
            return;
        }

        const html = stories.reduce((accumulator, story, index) => {
            const animationDelay = Math.min(index * 100, 500);
            return accumulator.concat(
                generateStoryItemTemplate({
                    id: story.id,
                    name: story.name,
                    description: story.description,
                    photoUrl: story.photoUrl,
                    createdAt: story.createdAt,
                    animationDelay,
                    className: 'story-card-transition'
                }),
            );
        }, '');

        document.getElementById('stories-list').innerHTML = `
            <div class="stories-list">${html}</div>
        `;

        this._addStoryMarkers(stories);
    }

    _addStoryMarkers(stories) {
        if (!this.#map) return;

        stories.forEach(story => {
            if (story.lat && story.lon) {
                const marker = this.#map.addMarker(
                    [story.lat, story.lon],
                    {},
                    {
                        content: `
                            <div class="story-popup">
                                <h3>${story.name}</h3>
                                <p>${story.description.substring(0, 100)}${story.description.length > 100 ? '...' : ''}</p>
                                <a href="#/stories/${story.id}">Read more</a>
                            </div>
                        `
                    }
                );

                marker.addEventListener('dblclick', () => {
                    location.hash = `/stories/${story.id}`;
                });
            }
        });
    }

    populateEmptyStories() {
        document.getElementById('stories-list').innerHTML = generateStoriesListEmptyTemplate();
    }

    populateStoriesError(message) {
        const errorTemplate = generateStoriesListErrorTemplate(message);
        const storiesList = document.getElementById('stories-list');
        
        if (storiesList) {
            storiesList.innerHTML = errorTemplate;
            
            const retryButton = document.getElementById('retry-button');

            if (retryButton) {
                retryButton.addEventListener('click', () => {
                    this.#presenter.initialStories();
                });
            }
        }
    }

    showLoading() {
        document.getElementById('stories-list-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
    }

    hideLoading() {
        document.getElementById('stories-list-loading-container').innerHTML = '';
    }

    showSuccessMessage(message) {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-messae animate-scale-up';
        successMessage.textContent = message;

        document.body.appendChild(successMessage);

        setTimeout(() => {
            successMessage.remove();
        }, 3000);
    }

    showErrorMessage(message) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message animate-scale-up';
        errorMessage.textContent = message;

        document.body.appendChild(errorMessage);

        setTimeout(() => {
            errorMessage.remove();
        }, 3000);
    }
}
