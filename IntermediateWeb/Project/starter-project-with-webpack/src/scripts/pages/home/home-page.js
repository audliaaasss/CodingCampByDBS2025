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
import '../../../styles/transition.css';
import NotificationHelper from '../../utils/notification-helper';

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

                <div class="stories-list__container">
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

        this._checkNotificationStatus();
        this._setupEventListeners();
    }

    _setupEventListeners() {
        const addStoryBtn = document.querySelector('.add-story-button');
        if (addStoryBtn) {
            addStoryBtn.addEventListener('click', () => {
                sessionStorage.setItem('adding_story', 'true');
            });
        }
        
        document.body.addEventListener('submit', async (event) => {
            if (event.target.id === 'add-story-form') {
                sessionStorage.setItem('story_added', 'true');
            }
        });
        
        if (sessionStorage.getItem('story_added') === 'true') {
            sessionStorage.removeItem('story_added');
            
            setTimeout(() => {
                this._simulatePushMessage();
            }, 2000);
        }
    }
    
    async _checkNotificationStatus() {
        const subscription = await NotificationHelper.getSubscription();
        if (!subscription) {
            setTimeout(() => {
                this.showInfoMessage('Subscribe to notifications to stay updated with new stories!');
            }, 1000);
        }
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
                    className: `story-card-transition-${story.id}`
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

    async _simulatePushMessage() {
        try {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                console.log('Push notifications not supported in this browser');
                return;
            }
            
            const registration = await navigator.serviceWorker.ready;
            if (!registration.active) {
                console.error('Service worker is not active');
                return;
            }
            
            const subscription = await NotificationHelper.getSubscription();
            if (!subscription) {
                console.log('User not subscribed to push notifications');
                return; 
            }
            
            try {
                const StoryAPI = await import('../../data/api');
                const response = await StoryAPI.subscribePushNotification({
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: subscription.keys.p256dh,
                        auth: subscription.keys.auth
                    }
                });
                console.log('Push subscription sent to server:', response);
                
                await this.#presenter._triggerPushNotification({
                    title: 'New Story Added!',
                    message: 'Someone just added a new story. Check it out!',
                    url: '#'
                });
            } catch (serverError) {
                console.error('Error sending push via server:', serverError);
                
                registration.active.postMessage({
                    type: 'SIMULATE_PUSH',
                    title: 'New Story Added!',
                    message: 'Someone just added a new story. Check it out!',
                    url: '#'
                });
                
                console.log('Simulated push message sent to service worker');
            }
        } catch (error) {
            console.error('Error simulating push:', error);
        }
    }

    showInfoMessage(message) {
        const infoMessage = document.createElement('div');
        infoMessage.className = 'info-message animate-scale-up';
        infoMessage.style.backgroundColor = '#3498db';
        infoMessage.style.color = '#fff';
        infoMessage.style.padding = '10px 20px';
        infoMessage.style.borderRadius = '4px';
        infoMessage.style.position = 'fixed';
        infoMessage.style.bottom = '20px';
        infoMessage.style.right = '20px';
        infoMessage.style.zIndex = '1000';
        infoMessage.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        infoMessage.textContent = message;

        document.body.appendChild(infoMessage);

        setTimeout(() => {
            infoMessage.remove();
        }, 5000);
    }
}
