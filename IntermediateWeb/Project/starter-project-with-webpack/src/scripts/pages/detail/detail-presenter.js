export default class DetailPresenter {
    #storyId;
    #view;
    #model;

    constructor(storyId, { view, model }) {
        this.#storyId = storyId;
        this.#view = view;
        this.#model = model;
    }

    async showStoryDetail() {
        this.#view.showStoryDetailLoading();

        try {
            const response = await this.#model.getDetailStory(this.#storyId);

            if (!response.ok) {
                console.error('showStoryDetail: response:', response);
                this.#view.populateStoryDetailError(response.error);
                return;
            }

            const story = response.story;
            console.log(story);

            this.#view.populateStoryDetail(response.message, story);
        } catch (error) {
            console.error('showStoryDetail: error:', error);
            this.#view.populateStoryDetailError(error.message);
        } finally {
            this.#view.hideStoryDetailLoading();
        }
    }
}