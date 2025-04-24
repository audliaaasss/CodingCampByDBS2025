import CatsLocal from "../../data/local/cats.js";
import { generateCatItemTemplate } from '../../templates.js';
import HomePresenter from "./home-presenter.js";

export default class HomePage {
    #presenter;
   
    async render() {
        return `
            <h1 class="content-title">Home Page</h1>
            <p>Ini adalah konten halaman utama.</p>
      
            <div id="cats"></div>
 
            <p>Mari kita cek <a href="#/about">halaman about</a>!</p>
        `;
    }
   
    async afterRender() {
        this.#presenter = new HomePresenter({
            model: CatsLocal,
            view: this,
        });
   
      await this.#presenter.showCats();
    }
   
    showCats(cats) {
        const html = cats.reduce(
            (accumulator, currentValue) => accumulator.concat(generateCatItemTemplate(currentValue)),
            '',
        );

        document.getElementById('cats').innerHTML = `
            <ul class="cats-list">${html}</ul>
        `;
    }
}