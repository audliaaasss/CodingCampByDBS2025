customElements.define(
    'my-paragraph',
    class extends HTMLElement {
      constructor() {
        super();
  
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
          <style>
            :host {
              display: block;
            }
  
            p {
              background-color: #666666;
              padding: 5px;
  
              color: white;
            }
          </style>
          <p><slot name="my-text">My default text</slot></p>
        `;
      }
    },
  );