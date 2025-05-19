export default class BookmarkPresenter {
    #view;
    #model;

    constructor({ view, model }) {
        this.#view = view;
        this.#model = model;
    }

    async getBookmarkedStories() {
        this.#view.showBookmarkedStoriesLoading();
        this.#view.hideBookmarkedStoriesEmpty();
        this.#view.hideBookmarkedStoriesError();

        try {
            const stories = await this.#model.getAll();
            
            this.#view.populateBookmarkedStories(stories);
            
            if (stories.length === 0) {
                this.#view.showBookmarkedStoriesEmpty();
            }
        } catch (error) {
            console.error('Error fetching bookmarked stories:', error);
            this.#view.showBookmarkedStoriesError(error.message || 'Failed to load bookmarked stories');
        } finally {
            this.#view.hideBookmarkedStoriesLoading();
        }
    }

    async removeBookmark(storyId) {
        try {
            const success = await this.#model.delete(storyId);
            
            if (success) {
                this.#view.showToast('Story removed from bookmarks');
                await this.getBookmarkedStories();
            } else {
                this.#view.showToast('Failed to remove story from bookmarks', false);
            }
        } catch (error) {
            console.error('Error removing bookmark:', error);
            this.#view.showToast('Error removing bookmark: ' + (error.message || 'Unknown error'), false);
        }
    }
}