import NotesApi from '../data/remote/notes-api.js';
import Utils from '../utils.js';
import '../components/note-form.js';
import '../components/loading-indicator.js';

const home = () => {
  let notesData = [];
  let currentPage = localStorage.getItem('currentPage') || 'home';
  let loadingElement;
  
  const initializeApp = async () => {
    renderLoadingIndicator();

    const cachedData = localStorage.getItem('notesBackup');
    if (cachedData) {
      try {
        notesData = JSON.parse(cachedData);
        renderPage();
      } catch (e) {
        console.error('Error parsing cached notes', e);
      }
    }

    await fetchNotes();
    renderPage();
    updateAppBarActiveState();

    document.addEventListener('page-change', (event) => {
      currentPage = event.detail.page;
      localStorage.setItem('currentPage', currentPage);
      renderPage();
      updateAppBarActiveState();
    });

    document.addEventListener('search', (event) => {
      const { query } = event.detail;
      const noteListElement = document.querySelector('note-list');
      noteListElement.query = query;
    });

    document.addEventListener('add-note', async (event) => {
      const { title, body } = event.detail;
      
      showLoading();
      
      const result = await NotesApi.addNote({ title, body });
      
      if (result.error) {
        showErrorMessage(result.message);
      } else {
        await fetchNotes();
        renderPage();
        showSuccessNotification('Note added successfully!');
      }
      
      hideLoading();
    });

    document.addEventListener('delete-note', async (event) => {
      const { id } = event.detail;
      
      showLoading();
      
      const result = await NotesApi.deleteNote(id);
      
      if (result.error) {
        showErrorMessage(result.message);
      } else {
        await fetchNotes();
        renderPage();
        showSuccessNotification('Note deleted successfully!');
      }
      
      hideLoading();
    });

    document.addEventListener('archive-note', async (event) => {
      const { id, archived } = event.detail;
      
      showLoading();
      
      let result;
      if (archived) {
        result = await NotesApi.archiveNote(id);
      } else {
        result = await NotesApi.unarchiveNote(id);
      }
      
      if (result.error) {
        showErrorMessage(result.message);
      } else {
        await fetchNotes();
        renderPage();
        showSuccessNotification(`Note ${archived ? 'archived' : 'unarchived'} successfully!`);
      }
      
      hideLoading();
    });
  };

  const updateAppBarActiveState = () => {
    const appBar = document.querySelector('app-bar');
    if (appBar) {
      const shadowRoot = appBar.shadowRoot;
      if (shadowRoot) {
        const navLinks = shadowRoot.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
          link.classList.remove('active');
        });

        const currentNavLink = shadowRoot.getElementById(`${currentPage}-link`);
        if (currentNavLink) {
          currentNavLink.classList.add('active');
        }
      }
    }
  };

  const fetchNotes = async () => {
    showLoading();
    
    try {
      const activeResult = await NotesApi.getAllNotes();
      const archivedResult = await NotesApi.getArchivedNotes();
      
      let allNotes = [];
      
      if (!activeResult.error) {
        allNotes = [...allNotes, ...activeResult.data];
      } else {
        showErrorMessage(`Error fetching active notes: ${activeResult.message}`);
      }
      
      if (!archivedResult.error) {
        allNotes = [...allNotes, ...archivedResult.data];
      } else {
        showErrorMessage(`Error fetching archived notes: ${archivedResult.message}`);
      }
      
      if (allNotes.length > 0) {
        notesData = allNotes;
        localStorage.setItem('notesBackup', JSON.stringify(notesData));
      } else {
        const backupData = localStorage.getItem('notesBackup');
        if (backupData) {
          notesData = JSON.parse(backupData);
          showErrorMessage('Using cached notes data. Some features may be limited.');
        }
      }
    } catch (error) {
      showErrorMessage(`Unexpected error: ${error.message}`);
      const backupData = localStorage.getItem('notesBackup');
      if (backupData) {
        notesData = JSON.parse(backupData);
        showErrorMessage('Using cached notes data. Some features may be limited.');
      }
    } finally {
      hideLoading();
    }
  };

  const renderLoadingIndicator = () => {
    loadingElement = document.createElement('loading-indicator');
    document.body.appendChild(loadingElement);
  };

  const showLoading = () => {
    if (loadingElement) {
      loadingElement.show();
    }
  };

  const hideLoading = () => {
    if (loadingElement) {
      loadingElement.hide();
    }
  };

  const showErrorMessage = (message) => {
    alert(`Error: ${message}`);
  };

  const showSuccessNotification = (message) => {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    document.body.appendChild(notification);
    Utils.showElement(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        Utils.hideElement(notification);
        document.body.removeChild(notification);
      }, 500);
    }, 2000);
  };

  function renderPage() {
    const mainElement = document.querySelector('main');
    mainElement.innerHTML = '';

    if (currentPage === 'home') {
      renderHomePage(mainElement);
    } else if (currentPage === 'archived') {
      renderArchivedPage(mainElement);
    }
  }

  function renderHomePage(container) {
    const formElement = document.createElement('note-form');
    container.appendChild(formElement);
    Utils.showElement(formElement);
    
    const searchElement = document.createElement('search-bar');
    container.appendChild(searchElement);
    
    const noteListElement = document.createElement('note-list');
    noteListElement.notes = notesData;
    noteListElement.archived = false;
    container.appendChild(noteListElement);
  }

  function renderArchivedPage(container) {
    const searchElement = document.createElement('search-bar');
    container.appendChild(searchElement);
    
    const noteListElement = document.createElement('note-list');
    noteListElement.notes = notesData;
    noteListElement.archived = true;
    container.appendChild(noteListElement);
  }

  function renderNoteList() {
    const noteListElement = document.querySelector('note-list');
    if (noteListElement) {
      noteListElement.notes = notesData;
    }
  }

  initializeApp();
};

export default home;