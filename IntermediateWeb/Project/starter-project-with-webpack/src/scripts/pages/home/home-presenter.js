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

            this._checkForNewStories(listStory);
        } catch (error) {
            console.error('initialStories: error:', error);
            this.#view.populateStoriesError(error.message);
        } finally {
            this.#view.hideLoading();
        }
    }

    async _checkForNewStories(currentStories) {
        try {
            const lastKnownStoryTime = localStorage.getItem('lastKnownStoryTime');
            
            if (currentStories.length > 0) {
                const sortedStories = [...currentStories].sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                
                const newestStory = sortedStories[0];
                const newestStoryTime = new Date(newestStory.createdAt).getTime();
                
                if (!lastKnownStoryTime || newestStoryTime > parseInt(lastKnownStoryTime)) {
                    if (lastKnownStoryTime && 
                        sessionStorage.getItem('adding_story') !== 'true' &&
                        sessionStorage.getItem('story_added') !== 'true') {
                        this._sendNewStoryNotification(newestStory);
                    }
                    
                    localStorage.setItem('lastKnownStoryTime', newestStoryTime.toString());
                }
            }
        } catch (error) {
            console.error('Error checking for new stories:', error);
        }
    }

    async _sendNewStoryNotification(story) {
        try {
            // Skip server-side push notification and use service worker directly
            if ('serviceWorker' in navigator) {
                try {
                    const registration = await navigator.serviceWorker.ready;
                    if (registration.active) {
                        registration.active.postMessage({
                            type: 'SIMULATE_PUSH',
                            title: 'New Story Added!',
                            message: `${story.name} added a new story: ${story.description.substring(0, 50)}${story.description.length > 50 ? '...' : ''}`,
                            url: `#/stories/${story.id}`,
                            storyId: story.id
                        });
                        console.log('Push notification simulated via service worker');
                    }
                } catch (swError) {
                    console.error('Failed to use service worker for notification:', swError);
                }
            }
        } catch (error) {
            console.error('Error sending notification for new story:', error);
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

            if ('serviceWorker' in navigator) {
                try {
                    const registration = await navigator.serviceWorker.ready;
                    if (registration.active) {
                        registration.active.postMessage({
                            type: 'SIMULATE_PUSH',
                            title: 'New Story Added',
                            message: `A new story has been added: ${description.substring(0, 30)}...`,
                            url: '#/stories/' + response.id,
                            storyId: response.id
                        });
                        console.log('Push notification simulated via service worker');
                    }
                } catch (error) {
                    console.error('Error simulating push notification:', error);
                }
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
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                if (registration.active) {
                    registration.active.postMessage({
                        type: 'SIMULATE_PUSH',
                        ...data
                    });
                    console.log('Push notification simulated via service worker');
                    return { success: true };
                }
            }
            
            return { success: false, message: 'Service worker not available' };
        } catch (error) {
            console.error('Error triggering push notification:', error);
            return { success: false, message: error.message };
        }
    }
}