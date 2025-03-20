class FooterBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    this.render();
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
          
        :host {
          display: block;
          width: 100%;
          background-color: #B5EAD7; 
          color: #444;
          padding: 16px;
          text-align: center;
          margin-top: auto;
          border-top: 3px dashed #FFDFD3;
        }
          
        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 90px;
        }
          
        .copyright {
          margin-top: 8px;
          font-size: 0.9rem;
          color: #666;
        }
          
        a {
          color: #FF9AA2;
          text-decoration: none;
          transition: color 0.3s ease;
        }
          
        a:hover {
          color: #FF6B77;
        }
        
        .footer-emoji {
          font-size: 1.2rem;
          margin: 0 3px;
        }
      </style>
        
      <div class="footer-content">
        <p><span class="footer-emoji">✨</span> Keep your thoughts organized <span class="footer-emoji">✨</span></p>
        <p class="copyright">© ${new Date().getFullYear()} Audi's Notes App. All rights reserved.</p>
      </div>
    `;
  }
}
  
customElements.define('footer-bar', FooterBar);