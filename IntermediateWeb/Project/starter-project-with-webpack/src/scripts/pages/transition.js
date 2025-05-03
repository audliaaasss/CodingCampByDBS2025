class PageTransition {
    static #instances = new Map();
    #content = null;
    #currentAnimation = null;
    
    /**
     * Create a new PageTransition instance for a content container
     * @param {HTMLElement} contentElement - The content container element
     * @returns {PageTransition} - The PageTransition instance
     */
    static for(contentElement) {
        if (!this.#instances.has(contentElement)) {
            this.#instances.set(contentElement, new PageTransition(contentElement));
        }
        return this.#instances.get(contentElement);
    }
    
    /**
     * @param {HTMLElement} contentElement - The content container element
     */
    constructor(contentElement) {
        this.#content = contentElement;
        
        this.overlay = document.createElement('div');
        this.overlay.className = 'page-transition-overlay';
        document.body.appendChild(this.overlay);
        
        this.#applyStyles();
    }

    #applyStyles() {
        if (!document.getElementById('page-transition-styles')) {
            const style = document.createElement('style');
            style.id = 'page-transition-styles';
            style.textContent = `
                .page-transition-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: #ffffff;
                    pointer-events: none;
                    z-index: 9999;
                    opacity: 0;
                    visibility: hidden;
                }
                
                .content-container {
                    position: relative;
                    min-height: 100vh;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                
                @keyframes slideInFromRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                
                @keyframes slideOutToLeft {
                    from { transform: translateX(0); }
                    to { transform: translateX(-100%); }
                }
                
                @keyframes slideInFromLeft {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                
                @keyframes slideOutToRight {
                    from { transform: translateX(0); }
                    to { transform: translateX(100%); }
                }
                
                @keyframes slideInFromBottom {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                
                @keyframes slideOutToTop {
                    from { transform: translateY(0); }
                    to { transform: translateY(-100%); }
                }
                
                @keyframes scaleUp {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                
                @keyframes scaleDown {
                    from { transform: scale(1); opacity: 1; }
                    to { transform: scale(0.8); opacity: 0; }
                }
                
                @keyframes rotateIn {
                    from { transform: perspective(1200px) rotateY(90deg); opacity: 0; }
                    to { transform: perspective(1200px) rotateY(0deg); opacity: 1; }
                }
                
                @keyframes rotateOut {
                    from { transform: perspective(1200px) rotateY(0deg); opacity: 1; }
                    to { transform: perspective(1200px) rotateY(-90deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Transition to a new page with the specified effect
     * @param {string} transitionType - The type of transition to use
     * @param {Function} renderCallback - Callback function to render the new page
     * @returns {Promise<void>} - Promise that resolves when the transition is complete
     */
    async transition(transitionType, renderCallback) {
        if (this.#currentAnimation) {
            this.#currentAnimation.cancel();
        }
        
        const transition = this.#getTransitionConfig(transitionType);
        
        await this.#executeExitAnimation(transition);
        
        await renderCallback();
        
        await this.#executeEnterAnimation(transition);
    }
    
    /**
     * Get transition configuration based on transition type
     * @param {string} transitionType - Type of transition to use
     * @returns {Object} - Transition configuration
     */
    #getTransitionConfig(transitionType) {
        const transitions = {
            'default': {
                exit: [
                    { opacity: 1 },
                    { opacity: 0 }
                ],
                enter: [
                    { opacity: 0 },
                    { opacity: 1 }
                ],
                overlay: {
                    animation: [
                        { opacity: 0 },
                        { opacity: 0.1 },
                        { opacity: 0 }
                    ],
                    timing: { duration: 400, fill: 'forwards' }
                },
                timing: { duration: 300, easing: 'ease-in-out', fill: 'forwards' }
            },
            
            'detail': {
                exit: [
                    { transform: 'translateX(0)', opacity: 1 },
                    { transform: 'translateX(-30%)', opacity: 0 }
                ],
                enter: [
                    { transform: 'translateX(30%)', opacity: 0 },
                    { transform: 'translateX(0)', opacity: 1 }
                ],
                overlay: {
                    animation: [
                        { opacity: 0 },
                        { opacity: 0.2 },
                        { opacity: 0 }
                    ],
                    timing: { duration: 500, fill: 'forwards' }
                },
                timing: { duration: 400, easing: 'ease-in-out', fill: 'forwards' }
            },
            
            'add': {
                exit: [
                    { transform: 'translateY(0)', opacity: 1 },
                    { transform: 'translateY(-10%)', opacity: 0 }
                ],
                enter: [
                    { transform: 'translateY(10%)', opacity: 0 },
                    { transform: 'translateY(0)', opacity: 1 }
                ],
                overlay: {
                    animation: [
                        { opacity: 0 },
                        { opacity: 0.2 },
                        { opacity: 0 }
                    ],
                    timing: { duration: 500, fill: 'forwards' }
                },
                timing: { duration: 400, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', fill: 'forwards' }
            },
            
            'auth': {
                exit: [
                    { transform: 'scale(1)', opacity: 1 },
                    { transform: 'scale(0.95)', opacity: 0 }
                ],
                enter: [
                    { transform: 'scale(1.05)', opacity: 0 },
                    { transform: 'scale(1)', opacity: 1 }
                ],
                overlay: {
                    animation: [
                        { opacity: 0 },
                        { opacity: 0.15 },
                        { opacity: 0 }
                    ],
                    timing: { duration: 600, fill: 'forwards' }
                },
                timing: { duration: 450, easing: 'ease-out', fill: 'forwards' }
            },
            
            'home': {
                exit: [
                    { transform: 'translateX(0)', opacity: 1 },
                    { transform: 'translateX(30%)', opacity: 0 }
                ],
                enter: [
                    { transform: 'translateX(-10%)', opacity: 0 },
                    { transform: 'translateX(0)', opacity: 1 }
                ],
                overlay: {
                    animation: [
                        { opacity: 0 },
                        { opacity: 0.1 },
                        { opacity: 0 }
                    ],
                    timing: { duration: 400, fill: 'forwards' }
                },
                timing: { duration: 350, easing: 'ease-in-out', fill: 'forwards' }
            },
            
            'rotate': {
                exit: [
                    { transform: 'perspective(1200px) rotateY(0deg)', opacity: 1 },
                    { transform: 'perspective(1200px) rotateY(-90deg)', opacity: 0 }
                ],
                enter: [
                    { transform: 'perspective(1200px) rotateY(90deg)', opacity: 0 },
                    { transform: 'perspective(1200px) rotateY(0deg)', opacity: 1 }
                ],
                overlay: {
                    animation: [
                        { opacity: 0 },
                        { opacity: 0.2 },
                        { opacity: 0 }
                    ],
                    timing: { duration: 800, fill: 'forwards' }
                },
                timing: { duration: 600, easing: 'ease-in-out', fill: 'forwards' }
            }
        };
        
        return transitions[transitionType] || transitions.default;
    }
    
    /**
     * Execute the exit animation for current content
     * @param {Object} transition - Transition configuration
     * @returns {Promise<void>} - Promise that resolves when animation is complete
     */
    async #executeExitAnimation(transition) {
        this.overlay.style.visibility = 'visible';
        this.overlay.style.opacity = '0';
        
        const overlayAnimation = this.overlay.animate(
            transition.overlay.animation,
            transition.overlay.timing
        );
        
        this.#currentAnimation = this.#content.animate(
            transition.exit,
            transition.timing
        );
        
        await Promise.all([
            new Promise(resolve => {
                this.#currentAnimation.onfinish = resolve;
            }),
            new Promise(resolve => {
                overlayAnimation.onfinish = resolve;
            })
        ]);
    }
    
    /**
     * Execute the enter animation for new content
     * @param {Object} transition - Transition configuration
     * @returns {Promise<void>} - Promise that resolves when animation is complete
     */
    async #executeEnterAnimation(transition) {
        this.#content.style.opacity = '0';
        
        const overlayAnimation = this.overlay.animate(
            transition.overlay.animation,
            transition.overlay.timing
        );
        
        this.#currentAnimation = this.#content.animate(
            transition.enter,
            transition.timing
        );
        
        await Promise.all([
            new Promise(resolve => {
                this.#currentAnimation.onfinish = () => {
                    this.#content.style.opacity = '';
                    this.#content.style.transform = '';
                    resolve();
                };
            }),
            new Promise(resolve => {
                overlayAnimation.onfinish = () => {
                    this.overlay.style.visibility = 'hidden';
                    resolve();
                };
            })
        ]);
        
        this.#currentAnimation = null;
    }
    
    /**
     * Determine the appropriate transition type based on URL
     * @param {string} fromUrl - Previous URL
     * @param {string} toUrl - New URL
     * @returns {string} - Transition type to use
     */
    static determineTransitionType(fromUrl, toUrl) {
        if (!fromUrl || !toUrl) return 'default';
        
        fromUrl = fromUrl.replace('#', '');
        toUrl = toUrl.replace('#', '');
        
        if (toUrl.includes('/stories/')) {
            return 'detail';
        }
        
        if (toUrl === '/add') {
            return 'add';
        }
        
        if (toUrl === '/login' || toUrl === '/register') {
            return 'auth';
        }
        
        if (toUrl === '/' || toUrl === '') {
            return 'home';
        }
        
        return 'default';
    }
}

export default PageTransition;