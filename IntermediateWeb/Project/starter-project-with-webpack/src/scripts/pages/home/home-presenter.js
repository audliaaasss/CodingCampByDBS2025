export default class HomePresenter {
    #view;
    #model;

    constructor({ view, model }) {
        this.#view = view;
        this.#model = model;
    }

    async initialStories() {
        this.#view.showLoading();

        try {
            const response = await this.#model.getAllStories();

            if (!response.ok) {
                console.error('initialStories: response:', response);
                this.#view.populateStoriesError(response.message);
                return;
            }

            const { listStory } = response;
            this.#view.populateStories(listStory);
        } catch (error) {
            console.error('initialStories: error:', error);
            this.#view.populateStoriesError(error.message);
        } finally {
            this.#view.hideLoading();
        }
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
                this.#view.showErrorMessage(response.message);
                return;
            }

            this.#view.showSuccessMessage('Story added successfully!');

            await this.initialStories();
        } catch (error) {
            console.error('addNewStory: error:', error);
            this.#view.showErrorMessage(error.message);
        } finally {
            this.#view.hideLoading();
        }
    }
}