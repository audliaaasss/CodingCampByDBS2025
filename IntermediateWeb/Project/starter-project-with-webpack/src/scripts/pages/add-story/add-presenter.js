export default class AddPresenter {
    #view = null;
    #model = null;

    constructor({ view, model }) {
        this.#view = view;
        this.#model = model;
    }

    async addNewStory({ description, photo, lat, lon }) {
        this.#view.showLoading();

        try {
            const response = await this.#model.addStory({
                description,
                photo,
                lat,
                lon,
            });

            if (!response.ok) {
                console.error('addNewStory: response:', response);
                this.#view.showErrorMessage(response.message || 'Failed to add story');
                return;
            }

            this.#view.showSuccessMessage('Story added successfully!');
            this.#view.clearForm();

            setTimeout(() => {
                this.#view.navigateToHome();
            }, 1500);
        } catch (error) {
            console.error('addNewStory: error:', error);
            this.#view.showErrorMessage(error.message || 'An error occurred while adding the story');
        } finally {
            this.#view.hideLoading();
        }
    }
}