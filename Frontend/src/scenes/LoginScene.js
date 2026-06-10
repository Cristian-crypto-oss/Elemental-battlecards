import Phaser from 'phaser';

// URL del backend real
const scriptURL = "https://elemental-battlecards.onrender.com/api/auth/login";

export default class LoginScene extends Phaser.Scene {
    constructor() {
        super('LoginScene');
    }

    preload() {
        this.load.video('inicio-video', '/assets/images/inicio/inicio.mp4', { muted: true });
        this.load.image('logo', '/assets/images/Logotipoletras.png');

        this.load.on('loaderror', (file) => console.error('Error al cargar:', file.key, file.url));
        this.load.on('complete', () => console.log('Archivos de LoginScene cargados'));
    }

    create() {
        const { width, height } = this.scale;
        // BACKGROUND VIDEO
        this.bg = this.add.video(width / 2, height / 2, 'inicio-video').setOrigin(0.5);
        this.bg.setDepth(-1); // Poner el video al fondo

        // Esperar a que el video esté listo para escalar correctamente
        this.bg.on('play', () => {
            const scaleX = width / this.bg.width;
            const scaleY = height / this.bg.height;
            const scale = Math.max(scaleX, scaleY);
            this.bg.setScale(scale);
        });
        this.bg.play(true); // Reproducir en bucle

        const formHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800;900&family=Montserrat:wght@400;500;600;700&display=swap');

                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                .login-screen-overlay {
                    width: 1600px;
                    height: 1000px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    align-items: center;
                    padding: 80px 40px 60px 40px;
                    position: relative;
                    font-family: 'Montserrat', sans-serif;
                    color: #e8d6c7;
                    background: radial-gradient(circle at center, rgba(45, 20, 15, 0.45) 0%, rgba(15, 10, 8, 0.92) 80%);
                    pointer-events: none;
                    user-select: none;
                }

                .login-screen-overlay * {
                    pointer-events: auto;
                }

                /* Side Text decoration */
                .side-text-right {
                    position: absolute;
                    right: 40px;
                    top: 50%;
                    transform: translateY(-50%) rotate(90deg);
                    transform-origin: right center;
                    font-family: 'Cinzel', serif;
                    font-size: 13px;
                    letter-spacing: 0.6em;
                    color: rgba(138, 117, 102, 0.2);
                    white-space: nowrap;
                    user-select: none;
                    pointer-events: none;
                }

                /* Header */
                .login-header {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .main-title {
                    font-family: 'Cinzel', serif;
                    font-size: 56px;
                    font-weight: 800;
                    color: #ffaba2;
                    letter-spacing: 0.08em;
                    text-shadow: 
                        0 0 10px rgba(255, 78, 32, 0.45),
                        0 0 20px rgba(255, 78, 32, 0.3),
                        0 0 45px rgba(255, 78, 32, 0.15);
                    animation: titleGlow 4s ease-in-out infinite alternate;
                }

                @keyframes titleGlow {
                    from {
                        text-shadow: 
                            0 0 10px rgba(255, 78, 32, 0.45),
                            0 0 20px rgba(255, 78, 32, 0.3),
                            0 0 45px rgba(255, 78, 32, 0.15);
                    }
                    to {
                        text-shadow: 
                            0 0 14px rgba(255, 78, 32, 0.65),
                            0 0 28px rgba(255, 78, 32, 0.45),
                            0 0 55px rgba(255, 78, 32, 0.25),
                            0 0 75px rgba(255, 78, 32, 0.15);
                    }
                }

                .subtitle {
                    font-family: 'Montserrat', sans-serif;
                    font-size: 12px;
                    font-weight: 500;
                    color: #8e7a6f;
                    letter-spacing: 0.3em;
                    margin-top: 10px;
                    text-transform: uppercase;
                    opacity: 0.8;
                }

                /* Card Container */
                .login-card {
                    background: rgba(20, 18, 17, 0.92);
                    border: 1px solid rgba(138, 117, 102, 0.22);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), inset 0 0 25px rgba(138, 117, 102, 0.03);
                    border-radius: 6px;
                    padding: 45px 50px;
                    width: 450px;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                /* Corner decorations */
                .corner-decor {
                    position: absolute;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    opacity: 0.55;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                }

                .login-card:hover .corner-decor {
                    opacity: 0.8;
                }

                .top-left { top: 8px; left: 8px; }
                .top-right { top: 8px; right: 8px; }
                .bottom-left { bottom: 8px; left: 8px; }
                .bottom-right { bottom: 8px; right: 8px; }

                .card-title {
                    font-family: 'Cinzel', serif;
                    font-size: 26px;
                    font-weight: 700;
                    color: #e8d6c7;
                    margin-bottom: 35px;
                    letter-spacing: 0.05em;
                }

                /* Form Styles */
                .login-form {
                    width: 100%;
                }

                .form-group {
                    width: 100%;
                    margin-bottom: 24px;
                }

                .label-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .form-label {
                    font-size: 10px;
                    font-weight: 700;
                    color: #8a7566;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                }

                .forgot-link {
                    font-size: 10px;
                    font-weight: 700;
                    color: #7d6859;
                    text-decoration: none;
                    letter-spacing: 0.05em;
                    transition: color 0.2s ease;
                }

                .forgot-link:hover {
                    color: #ffaba2;
                }

                /* Input Wrapper & Inputs */
                .input-wrapper {
                    position: relative;
                    width: 100%;
                }

                .input-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #5e4f45;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: none;
                    transition: color 0.2s ease;
                }

                .input-wrapper input {
                    width: 100%;
                    background: #090807;
                    border: 1px solid rgba(138, 117, 102, 0.25);
                    border-radius: 4px;
                    padding: 12px 14px 12px 42px;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 14px;
                    color: #e8d6c7;
                    transition: all 0.25s ease;
                }

                .input-wrapper input::placeholder {
                    color: #5e4f45;
                }

                .input-wrapper input:focus {
                    outline: none;
                    border-color: rgba(255, 78, 32, 0.55);
                    box-shadow: 0 0 12px rgba(255, 78, 32, 0.15);
                }

                .input-wrapper input:focus + .input-icon {
                    color: #ffaba2;
                }

                /* Buttons */
                .btn-summon {
                    width: 100%;
                    background: #ff5b26;
                    border: none;
                    border-radius: 4px;
                    padding: 14px;
                    font-family: 'Cinzel', serif;
                    font-size: 16px;
                    font-weight: 800;
                    color: #1b1816;
                    cursor: pointer;
                    letter-spacing: 0.15em;
                    margin-top: 10px;
                    transition: all 0.25s ease;
                    box-shadow: 0 4px 15px rgba(255, 91, 38, 0.2);
                }

                .btn-summon:hover {
                    background: #ff6c3b;
                    box-shadow: 0 4px 22px rgba(255, 91, 38, 0.45);
                    transform: translateY(-1px);
                }

                .btn-summon:active {
                    transform: translateY(0);
                }

                .btn-summon:disabled {
                    background: #8a7566;
                    color: #4a3c33;
                    cursor: not-allowed;
                    box-shadow: none;
                    opacity: 0.7;
                }

                /* Register Section */
                .register-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-top: 35px;
                    width: 100%;
                }

                .register-label {
                    font-size: 10px;
                    font-weight: 700;
                    color: #8a7566;
                    letter-spacing: 0.1em;
                    margin-bottom: 15px;
                }

                .btn-forge {
                    background: transparent;
                    border: 1px solid rgba(138, 117, 102, 0.4);
                    border-radius: 20px;
                    padding: 10px 28px;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 11px;
                    font-weight: 700;
                    color: #a28c7b;
                    cursor: pointer;
                    letter-spacing: 0.1em;
                    transition: all 0.25s ease;
                    text-transform: uppercase;
                }

                .btn-forge:hover {
                    border-color: #ffaba2;
                    color: #e8d6c7;
                    background: rgba(255, 171, 162, 0.05);
                }

                /* Footer */
                .login-footer {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    user-select: none;
                }

                .footer-links-row {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .footer-link {
                    font-size: 10px;
                    font-weight: 600;
                    color: #5e4f45;
                    text-decoration: none;
                    letter-spacing: 0.15em;
                    transition: color 0.2s ease;
                }

                .footer-link:hover {
                    color: #ffaba2;
                }

                .footer-separator {
                    color: #382e28;
                    font-size: 10px;
                }

                .footer-copyright {
                    font-size: 8px;
                    color: #3d332d;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }
            </style>

            <div class="login-screen-overlay">
                <div class="side-text-right">LEGENDARY ASCENSION</div>

                <header class="login-header">
                    <h1 class="main-title">ELEMENTAL BATTLECARDS</h1>
                    <p class="subtitle">THE SANCTUM AWAITS YOUR PRESENCE</p>
                </header>

                <main class="login-card">
                    <!-- Corner decorations -->
                    <div class="corner-decor top-left">
                        <svg viewBox="0 0 24 24" width="14" height="14">
                            <polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" fill="#8a7566" />
                        </svg>
                    </div>
                    <div class="corner-decor top-right">
                        <svg viewBox="0 0 24 24" width="14" height="14">
                            <circle cx="12" cy="12" r="6" stroke="#8a7566" stroke-width="2" fill="none" />
                            <path d="M12,2 L12,5 M12,19 L12,22 M2,12 L5,12 M19,12 L22,12" stroke="#8a7566" stroke-width="2" />
                        </svg>
                    </div>
                    <div class="corner-decor bottom-left">
                        <svg viewBox="0 0 24 24" width="14" height="14">
                            <path d="M12,2 L4,6 L4,12 C4,17 12,22 12,22 C12,22 20,17 20,12 L20,6 L12,2 Z" stroke="#8a7566" stroke-width="2" fill="none" />
                        </svg>
                    </div>
                    <div class="corner-decor bottom-right">
                        <svg viewBox="0 0 24 24" width="14" height="14">
                            <path d="M12,2 L12,22 M2,12 L22,12 M5,5 L19,19 M5,19 L19,5" stroke="#8a7566" stroke-width="1.5" />
                        </svg>
                    </div>

                    <h2 class="card-title">Enter the Gate</h2>

                    <form class="login-form">
                        <div class="form-group">
                            <label class="form-label">SOUL ID</label>
                            <div class="input-wrapper">
                                <span class="input-icon">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </span>
                                <input name="username" type="text" placeholder="Gamer#1234">
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="label-row">
                                <label class="form-label">SECRET GLYPH</label>
                                <a href="#" class="forgot-link" id="forgot-glyph-btn">LOST GLYPH?</a>
                            </div>
                            <div class="input-wrapper">
                                <span class="input-icon">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                                    </svg>
                                </span>
                                <input name="password" type="password" placeholder="********">
                            </div>
                        </div>

                        <button type="button" class="btn-summon" id="login-btn">SUMMON</button>

                        <div class="register-section">
                            <span class="register-label">NEW GUARDIAN?</span>
                            <button type="button" class="btn-forge" id="register-btn">FORGE ACCOUNT</button>
                        </div>
                    </form>
                </main>

                <footer class="login-footer">
                    <div class="footer-links-row">
                        <a href="#" class="footer-link" id="news-btn">CHRONICLES OF USE</a>
                        <span class="footer-separator">•</span>
                        <a href="#" class="footer-link" id="credits-btn">PRIVACY SIGIL</a>
                        <span class="footer-separator">•</span>
                        <a href="#" class="footer-link" id="contact-btn">CRYSTAL SUPPORT</a>
                    </div>
                    <div class="footer-copyright">
                        © 2026 ELEMENTAL BATTLECARDS. ALL RIGHTS RESERVED.
                    </div>
                </footer>
            </div>
        `;

        this.formElement = this.add.dom(0, 0).createFromHTML(formHTML).setOrigin(0, 0);

        const loginButton = this.formElement.node.querySelector('#login-btn');
        const usernameInput = this.formElement.node.querySelector('input[name="username"]');
        const passwordInput = this.formElement.node.querySelector('input[name="password"]');

        loginButton.addEventListener('click', async () => {
            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            if (!username || !password) {
                alert('Por favor, introduce usuario y contraseña.');
                return;
            }

            loginButton.disabled = true;
            loginButton.textContent = 'SUMMONING...';

            try {
                const res = await fetch(scriptURL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const json = await res.json();

                if (res.ok && json.token) {
                    console.log('Login exitoso:', json);
                    localStorage.setItem('token', json.token); // guardar token
                    this.scene.start('HomeScenes');
                    return;
                }

                alert('Error al iniciar sesión: ' + (json.message || 'Credenciales incorrectas'));
            } catch (error) {
                console.error('Error de conexión/login', error);
                alert('Error de conexión. Revisa la consola.');
            } finally {
                loginButton.disabled = false;
                loginButton.textContent = 'SUMMON';
            }
        });

        // Eventos del pie de página y botones adicionales
        const newsBtn = this.formElement.node.querySelector('#news-btn');
        const creditsBtn = this.formElement.node.querySelector('#credits-btn');
        const contactBtn = this.formElement.node.querySelector('#contact-btn');
        const registerBtn = this.formElement.node.querySelector('#register-btn');
        const forgotGlyphBtn = this.formElement.node.querySelector('#forgot-glyph-btn');

        if (newsBtn) newsBtn.addEventListener('click', (e) => { e.preventDefault(); alert('Noticias - próximamente'); });
        if (creditsBtn) creditsBtn.addEventListener('click', (e) => { e.preventDefault(); alert('Créditos - próximamente'); });
        if (contactBtn) contactBtn.addEventListener('click', (e) => { e.preventDefault(); alert('Contacto - próximamente'); });
        if (forgotGlyphBtn) forgotGlyphBtn.addEventListener('click', (e) => { e.preventDefault(); alert('Recuperación de contraseña próximamente'); });
        
        if (registerBtn) {
            registerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.scene.start('RegisterScene');
            });
        }
    }

    resize(gameSize) {
        const { width, height } = gameSize;
        if (this.bg && this.bg.width > 0) {
            const scaleX = width / this.bg.width;
            const scaleY = height / this.bg.height;
            const scale = Math.max(scaleX, scaleY);
            this.bg.setScale(scale);
        }
        if (this.formElement) {
            this.formElement.setPosition(0, 0);
        }
    }
}
