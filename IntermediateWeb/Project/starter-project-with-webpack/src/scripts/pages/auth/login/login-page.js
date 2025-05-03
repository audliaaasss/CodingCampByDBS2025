import LoginPresenter from './login-presenter';
import * as StoryAPI from '../../../data/api';
import * as AuthModel from '../../../utils/auth';

export default class LoginPage {
    #presenter = null;

    async render() {
        return `
            <section class="login-container">
                <article class="login-form-container animate-scale-up">
                    <h1 class="login__title animate-fade-in">Masuk akun</h1>

                    <form id="login-form" class="login-form animate-fade-in delay-100">
                        <div class="form-control animate-fade-in delay-200">
                            <label for="email-input" class="login-form__email-title">Email</label>

                            <div class="login-form__title-container">
                                <input id="email-input" type="email" name="email" placeholder="Contoh: name@email.com">
                            </div>
                        </div>
                        <div class="form-control animate-fade-in delay-300">
                            <label for="password-input" class="login-form__password-title">Password</label>

                            <div class="login-form__title-container">
                                <input id="password-input" type="password" name="password" placeholder="Masukkan password Anda">
                            </div>
                        </div>
                        <div class="form-buttons login-form__form-buttons animate-fade-in delay-400">
                            <div id="submit-button-container">
                                <button class="btn" type="submit">Masuk</button>
                            </div>
                            <p class="login-form__do-not-have-account">Belum punya akun? <a href="#/register">Daftar</a></p>
                        </div>
                    </form>
                </article>
            </section>
        `;
    }

    async afterRender() {
        this.#presenter = new LoginPresenter({
            view: this,
            model: StoryAPI,
            authModel: AuthModel,
        });

        this.#setupForm();
        this.#setupFormTransitions();
    }

    #setupForm() {
        document.getElementById('login-form').addEventListener('submit', async (event) => {
            event.preventDefault();

            const data = {
                email: document.getElementById('email-input').value,
                password: document.getElementById('password-input').value,
            };
            await this.#presenter.getLogin(data);
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
        
        const registerLink = document.querySelector('.login-form__do-not-have-account a');
        if (registerLink) {
            registerLink.addEventListener('mouseenter', () => {
                registerLink.animate(
                    [
                        { transform: 'translateX(0)' },
                        { transform: 'translateX(3px)' },
                        { transform: 'translateX(0)' }
                    ],
                    { 
                        duration: 300,
                        easing: 'ease-in-out'
                    }
                );
            });
        }
    }

    loginSuccessfully(message) {
        console.log(message);

        const container = document.querySelector('.login-form-container');
        
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
            location.hash = '/';
        }, 100);
    }

    loginFailed(message) {
        const form = document.getElementById('login-form');
        
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
                    <i class="fas fa-spinner loader-button"></i> Masuk
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
                <button class="btn" type="submit">Masuk</button>
            `;
        }, 200);
    }
}