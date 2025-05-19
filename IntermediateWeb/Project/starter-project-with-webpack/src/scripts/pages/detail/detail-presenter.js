export default class DetailPresenter {
    #storyId;
    #view;
    #model;
    #bookmarkModel;

    constructor(storyId, { view, model, bookmarkModel }) {
        this.#storyId = storyId;
        this.#view = view;
        this.#model = model;
        this.#bookmarkModel = bookmarkModel;
    }

    async showStoryDetail() {
        this.#view.showStoryDetailLoading();

        try {
            const bookmarkedStory = await this.#bookmarkModel.get(this.#storyId);

            if (bookmarkedStory) {
                this.#view.populateStoryDetail('Story loaded from bookmarks', bookmarkedStory);
                return;
            }

            const response = await this.#model.getDetailStory(this.#storyId);

            if (!response.ok) {
                console.error('showStoryDetail: response:', response);
                this.#view.populateStoryDetailError(response.message);
                return;
            }

            const story = response.story;

            const processedStory = {
                ...story,
                lat: story.lat || null,
                lon: story.lon || null
            };

            this.#view.populateStoryDetail(response.message, processedStory);
        } catch (error) {
            console.error('showStoryDetail: error:', error);
            this.#view.populateStoryDetailError(error.message);
        } finally {
            this.#view.hideStoryDetailLoading();
        }
    }
}