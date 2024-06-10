export class LoadingSpinner {
    constructor() {
      this.spinner = document.createElement('div');
      this.spinner.className = 'loading-spinner';
      this.spinner.innerHTML = `
        <div class="spinner"></div>
      `;
      this.hide();
    }
  
    show() {
      document.body.appendChild(this.spinner);
    }
  
    hide() {
      if (this.spinner.parentNode) {
        this.spinner.parentNode.removeChild(this.spinner);
      }
    }
  }
  