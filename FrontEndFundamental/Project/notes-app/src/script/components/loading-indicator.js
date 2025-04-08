class LoadingIndicator extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }
    
    show() {
        this.style.display = 'flex';
    }
    
    hide() {
        this.style.display = 'none';
    }
    
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(255, 255, 255, 0.7);
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                }
            
                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 5px solid #FF9AA2;
                    border-radius: 50%;
                    border-top-color: #B5EAD7;
                    animation: spin 1s ease-in-out infinite;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
            
                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
            </style>
          
            <div class="spinner"></div>
        `;
    }
}

customElements.define('loading-indicator', LoadingIndicator);

export default LoadingIndicator;