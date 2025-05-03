import RegisterPresenter from './register-presenter';
import * as StoryAPI from '../../../data/api';

export default class RegisterPage {
    #presenter = null;

    async render() {
        return `
            <section class="register-container">
                <div class="register-form-container animate-scale-up">
                    <h1 class="register__title animate-fade-in">Daftar akun</h1>

                    <form id="register-form" class="register-form animate-fade-in delay-100">
                        <div class="form-control animate-fade-in delay-200">
                            <label for="name-input" class="register-form__name-title">Nama lengkap</label>

                            <div class="register-form__title-container">
                                <input id="name-input" type="text" name="name" placeholder="Masukkan nama lengkap Anda">
                            </div>
                        </div>
                        <div class="form-control animate-fade-in delay-300">
                            <label for="email-input" class="register-form__email-title">Email</label>

                            <div class="register-form__title-container">
                                <input id="email-input" type="email" name="email" placeholder="Contoh: nama@email.com">
                            </div>
                        </div>
                        <div class="form-control animate-fade-in delay-300">
                            <label for="password-input" class="register-form__password-title">Password</label>

                            <div class="register-form__title-container">
                                <input id="password-input" type="password" name="password" placeholder="Masukkan password baru">
                            </div>
                        </div>
                        <div class="form-buttons register-form__form-buttons animate-fade-in delay-400">
                            <div id="submit-button-container">
                                <button class="btn" type="submit">Daftar akun</button>
                            </div>
                            <p class="register-form__already-have-account">Sudah punya akun? <a href="#/login">Masuk</a></p>
                        </div>
                    </form>
                </div>
            </section>
        `;
    }

    async afterRender() {
        this.#presenter = new RegisterPresenter({
            view: this,
            model: StoryAPI,
        });

        this.#setupForm();
        this.#setupFormTransitions();

    }

    #setupForm() {
        document.getElementById('register-form').addEventListener('submit', async (event) => {
            event.preventDefault();

            const data = {
                name: document.getElementById('name-input').value,
                email: document.getElementById('email-input').value,
                password: document.getElementById('password-input').value,
            };
            await this.#presenter.getRegistered(data);
        });
    }

    #setupFormTransitions() {
        const inputs = document.querySelectorAll('input');
        
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.animate(
                    [
                        { transform: 'translateX(0)' },
                        { transform: 'translateX(5px)' },
                        { transform: 'translateX(0)' }
                    ],
                    { 
                        duration: 300,
                        easing: 'ease-out'
                    }
                );
            });
        });
    }

    registeredSuccessfully(message) {
        console.log(message);

        container.animate(
            [
                { opacity: 1, transform: 'scale(1)' },
                { opacity: 0, transform: 'scale(0.9)' }
            ],
            {
                duration: 400,
                easing: 'ease-in',
                fill: 'forwards'
            }
        );

        setTimeout(() => {
            location.hash = '/login';
        }, 100);
    }

    registeredFailed(message) {
        const form = document.getElementById('register-form');
        
        form.animate(
            [
                { transform: 'translateX(0)' },
                { transform: 'translateX(-10px)' },
                { transform: 'translateX(10px)' },
                { transform: 'translateX(-10px)' },
                { transform: 'translateX(0)' }
            ],
            {
                duration: 400,
                easing: 'ease-in-out'
            }
        );

        alert(message);
    }

    showSubmitLoadingButton() {
        const buttonContainer = document.getElementById('submit-button-container');
        
        buttonContainer.animate(
            [
                { opacity: 1 },
                { opacity: 0.7 }
            ],
            {
                duration: 200,
                fill: 'forwards'
            }
        );
        
        setTimeout(() => {
            buttonContainer.innerHTML = `
                <button class="btn" type="submit" disabled>
                    <i class="fas fa-spinner loader-button"></i> Daftar akun
                </button>
            `;
        }, 200);
    }

    hideSubmitLoadingButton() {
        const buttonContainer = document.getElementById('submit-button-container');
        
        buttonContainer.animate(
            [
                { opacity: 0.7 },
                { opacity: 1 }
            ],
            {
                duration: 200,
                fill: 'forwards'
            }
        );
        
        setTimeout(() => {
            buttonContainer.innerHTML = `
                <button class="btn" type="submit">Daftar akun</button>
            `;
        }, 200);
    }
}