import CatsLocal from "../../data/local/cats.js";
import AboutPresenter from "./home-presenter.js";

class AboutPage {
    #presenter

    async render() {
      return `
        <h1 class="content-title">About Page</h1>
        <p>Ini adalah konten halaman about.</p>
        <ol>
          <li>Kita</li>
          <li>punya</li>
          <li>elemen</li>
          <li>daftar</li>
          <li>di sini!</li>
        </ol>
        <p>Oke, sudah cukup. Kita bisa kembali ke <a href="#/">halaman home</a>.</p>
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