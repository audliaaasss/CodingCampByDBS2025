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

                <div id="add-story-modal" class="modal">
                    <div class="modal-content">
                        <span class="close-modal">&times;</span>
                        <h2>Add New Story</h2>
                        <form id="add-story-form">
                            <div class="form-group">
                                <label for="description">Description</label>
                                <textarea id="description" name="description" required></textarea>
                            </div>
                            <div class="form-group">
                                <label for="photo">Photo</label>
                                <input type="file" id="photo" name="photo" accept="image/*" required>
                                <div id="image-preview"></div>
                            </div>
                            <div class="form-actions">
                                <button type="submit" id="submit-story" class="btn submit-story-button">Submit</button>
                            </div>
                        </form>
                    </div>
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
        this._setupAddStoryButton();
        this._setupModalEvents();
        this._setupImagePreview();
        this._setupFormSubmit();
    }

    _setupAddStoryButton() {
        const addStoryButton = document.getElementById('add-story-button');
        addStoryButton.addEventListener('click', () => {
            document.getElementById('add-story-modal').style.display = 'block';
        });
    }

    _setupModalEvents() {
        const modal = document.getElementById('add-story-modal');
        const closeModal = document.querySelector('.close-modal');

        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    _setupImagePreview() {
        const photoInput = document.getElementById('photo');
        const imagePreview = document.getElementById('image-preview');

        photoInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.innerHTML = `
                        <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px;">
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    _setupFormSubmit() {
        const form = document.getElementById('add-story-form');
        
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const description = document.getElementById('description').value;
            const photoFile = document.getElementById('photo').files[0];

            await this.#presenter.addNewStory({
                description,
                photo: photoFile,
                lat: null,
                lon: null,
            });

            form.reset();
            document.getElementById('image-preview').innerHTML = '';
            document.getElementById('add-story-modal').style.display = 'none';
        });
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
