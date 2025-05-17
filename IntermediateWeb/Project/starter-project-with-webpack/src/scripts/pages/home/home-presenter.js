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

            const processedStories = listStory.map(story => ({
                ...story,
                lat: story.lat ? parseFloat(story.lat) : null,
                lon: story.lon ? parseFloat(story.lon) : null
            }));

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

            try {
                await this._triggerPushNotification({
                    title: 'New Story Added',
                    message: `A new story has been added: ${description.substring(0, 30)}...`,
                    url: '#'
                });
            } catch (notifyError) {
                console.error('Error sending push notification:', notifyError);
            }

            await this.initialStories();
        } catch (error) {
            console.error('addNewStory: error:', error);
            this.#view.showErrorMessage(error.message);
        } finally {
            this.#view.hideLoading();
        }
    }

    async _triggerPushNotification(data) {
        try {
            const response = await fetch(`${CONFIG.BASE_URL}/notifications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getAccessToken()}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }

            const responseJson = await response.json();
            console.log('Push notification triggered:', responseJson);
            return responseJson;
        } catch (error) {
            console.error('Error triggering push notification:', error);
            throw error;
        }
    }
}