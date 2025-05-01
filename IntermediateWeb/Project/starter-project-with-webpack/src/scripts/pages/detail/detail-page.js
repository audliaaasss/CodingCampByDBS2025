import {
    generateLoaderAbsoluteTemplate,
    generateStoryDetailTemplate,
} from '../../templates';
import DetailPresenter from './detail-presenter';
import { parseActivePathname } from '../../routes/url-parser';
import * as StoryAPI from '../../data/api';

export default class DetailPage {
    #presenter = null;

    async render() {
        return `
            <section>
                <div class="story-detail__container">
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

    populateStoryDetail(messae, story) {
        document.getElementById('story-detail').innerHTML = generateStoryDetailTemplate({
            name: story.name,
            description: story.description,
            photoUrl: story.photoUrl,
            createdAt: story.createdAt,
        });
    }

    populateStoryDetailError(messae) {
        document.getElementById('story-detail').innerHTML = `
            <div class="story-detail__error">
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