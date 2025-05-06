import {
    generateLoaderAbsoluteTemplate,
    generateStoryDetailTemplate,
} from '../../templates';
import DetailPresenter from './detail-presenter';
import { parseActivePathname } from '../../routes/url-parser';
import * as StoryAPI from '../../data/api';
import Map from '../../utils/map';
import 'leaflet/dist/leaflet.css';
import '../../../styles/transition.css';

export default class DetailPage {
    #presenter = null;
    #map = null;

    async render() {
        return `
            <section>
                <div class="story-detail__container animate-fade-in detail-page-transition">
                    <div id="story-detail" class="story-detail"></div>
                    <div id="story-detail-loading-container"></div>
                </div>
            </section>
        `;
    }

    async afterRender() {
        this.#presenter = new DetailPresenter(parseActivePathname().id, {
            view: this,
            model: StoryAPI,
        });

        this.#presenter.showStoryDetail();
    }

    populateStoryDetail(message, story) {
        document.getElementById('story-detail').innerHTML = generateStoryDetailTemplate({
            name: story.name,
            description: story.description,
            photoUrl: story.photoUrl,
            createdAt: story.createdAt,
        });

        const storyTitle = document.querySelector('.story-detail h1');
        if (storyTitle) {
            storyTitle.classList.add('animate-fade-in');
            storyTitle.style.viewTransitionName = 'story-title';
        }

        const storyDescription = document.querySelector('.story-detail__description');
        if (storyDescription) {
            storyDescription.classList.add('animate-fade-in', 'delay-100', 'content-with-transition');
        }

        if (story.lat && story.lon) {
            this._addLocationMap(story.lat, story.lon, story.name);
        }
    }

    async _addLocationMap(lat, lon, name) {
        const mapContainer = document.createElement('div');
        mapContainer.id = 'detail-map-container';
        mapContainer.style.height = '300px';
        mapContainer.style.marginTop = '20px';
        mapContainer.classList.add('content-with-transition');

        const mapHeader = document.createElement('h2');
        mapHeader.className = 'story-detail__location__title animate-fade-in delay-200';
        mapHeader.textContent = 'Story Location';

        const locationInfo = document.createElement('div');
        locationInfo.className = 'story-location-info animate-fade-in delay-300';
        locationInfo.innerHTML = `
            <p>Latitude: ${lat}</p>
            <p>Longitude: ${lon}</p>
        `;

        const locationSection = document.createElement('div');
        locationSection.className = 'story-detail__location';
        locationSection.appendChild(mapHeader);
        locationSection.appendChild(locationInfo);
        locationSection.appendChild(mapContainer);

        const storyDetailElement = document.querySelector('.story-detail__container');
        storyDetailElement.appendChild(locationSection);

        try {
            this.#map = await Map.build('#detail-map-container', {
                center: [lat, lon],
                zoom: 13
            });

            this.#map.addMarker([lat, lon], {}, {
                content: `<strong>Story by ${name}</strong>`
            });

            try {
                const placeName = await Map.getPlaceNameByCoordinate(lat, lon);
                if (placeName) {
                    const placeElement = document.createElement('p');
                    placeElement.className = 'animate-fade-in delay-400';
                    placeElement.textContent = `Location: ${placeName}`;
                    locationInfo.appendChild(placeElement);                }
            } catch (error) {
                console.error('Error getting place name:', error);
            }
        } catch (error) {
            console.error('Error initializing map:', error);
            mapContainer.innerHTML = '<p>Unable to load map. Please try again later.</p>';
        }
    }

    populateStoryDetailError(messae) {
        document.getElementById('story-detail').innerHTML = `
            <div class="story-detail__error animate-fade-in">
                <h2>Error Loading Story</h2>
                <p>${messae ? messae : 'Please try using a different network or report this error.'}</p>
            </div>
        `;
    }

    showStoryDetailLoading() {
        document.getElementById('story-detail-loading-container').innerHTML =
            generateLoaderAbsoluteTemplate();
    }

    hideStoryDetailLoading() {
        document.getElementById('story-detail-loading-container').innerHTML = '';
    }
}