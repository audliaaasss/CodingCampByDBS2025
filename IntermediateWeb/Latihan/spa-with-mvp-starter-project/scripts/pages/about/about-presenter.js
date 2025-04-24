export default class AboutPresenter {
    #model;
    #view;
   
    constructor({ model, view }) {
        this.#model = model;
        this.#view = view;
    }

    async showCats() {
        const cats = await this.#model.getAllCats();
        this.#view.showCats(cats);
    }
}