import AddPresenter from './add-presenter';
import * as StoryAPI from '../../data/api';
import { generateLoaderAbsoluteTemplate } from '../../templates';

export default class AddPage {
    #presenter = null;
    #form = null;
    #imagePreview = null;

    async render() {
        return `
            <section class="container">
                <h1 class="section-title">Add New Story</h1>
                
                <div class="add-story-form-container">
                    <form id="add-story-form" class="add-story-form">
                        <div class="form-group">
                            <label for="description">Description</label>
                            <textarea id="description" name="description" required placeholder="Share your story here..."></textarea>
                        </div>
                        <div class="form-group">
                            <label for="photo">Photo</label>
                            <input type="file" id="photo" name="photo" accept="image/*" required>
                            <div id="image-preview" class="image-preview"></div>
                        </div>
                        <div class="form-group form-location">
                            <label>Location (Optional)</label>
                            <div class="location-inputs">
                                <div class="location-input">
                                    <label for="latitude">Latitude</label>
                                    <input type="number" id="latitude" name="latitude" placeholder="Latitude" value="">
                                </div>
                                <div class="location-input">
                                    <label for="longitude">Longitude</label>
                                    <input type="number" id="longitude" name="longitude" placeholder="Longitude" value="">
                                </div>
                            </div>
                        </div>
                        <div class="form-actions">
                            <span id="submit-button-container">
                                <button type="submit" class="btn submit-story-button">Submit Story</button>
                            </span>
                            <a href="#/" class="btn btn-outline">Cancel</a>
                        </div>
                    </form>
                </div>
            </section>
        `;
    }

    async afterRender() {
        this.#presenter = new AddPresenter({
            view: this,
            model: StoryAPI,
        });

        this._setupForm();
        this._setupImagePreview();
    }

    _setupForm() {
        this.#form = document.getElementById('add-story-form');
        this.#form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const description = document.getElementById('description').value;
            const photoUrl = document.getElementById('photo').files[0];
            const latitude = document.getElementById('latitude').value || null;
            const longitude = document.getElementById('longitude').value || null;

            await this.#presenter.addNewStory({
                description,
                photo: photoUrl,
                lat: latitude,
                lon: longitude,
            });
        });
    }

    _setupImagePreview() {
        const photoInput = document.getElementById('photo');
        this.#imagePreview = document.getElementById('image-preview');

        photoInput.addEventListener('change', (event) => {
            const file = event.target.files[0];

            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.#imagePreview.innerHtml = `
                        <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px;">
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    showLoading() {
        document.getElementById('submit-button-container').innerHTML = `
            <button class="btn" type="submit" disabled>
                <div class="loader-button"></div> Submitting...
            </button>
        `;
    }

    hideLoading() {
        document.getElementById('submit-button-container').innerHTML = `
            <button class="btn submit-story-button" type="submit">Submit Story</button>
        `;
    }

    showSuccessMessage(message) {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
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

    clearForm() {
        this.#form.reset();
        this.#imagePreview.innerHTML = '';
    }

    navigateToHome() {
        window.location.hash = '/';
    }
}