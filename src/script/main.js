import "../styles/style.css";
import { LoadingSpinner } from './loading-spinner.js';
import './app-bar.js';
import './footer-bar.js';

const baseUrl = "https://notes-api.dicoding.dev/v2";
const loadingSpinner = new LoadingSpinner();
async function fetchNonArchivedNotes() {
  try {
    loadingSpinner.show();

    const response = await fetch(`${baseUrl}/notes`);
    const data = await response.json();

    loadingSpinner.hide();

    return data.data.filter(note => !note.archived);
  } catch (error) {
    console.error('Error fetching non-archived notes:', error);
    return [];
  }
}
async function fetchArchivedNotes() {
  try {
    loadingSpinner.show();

    const response = await fetch(`${baseUrl}/notes/archived`);
    const data = await response.json();

    loadingSpinner.hide();

    return data.data;
  } catch (error) {
    console.error('Error fetching archived notes:', error);
    return [];
  }
}
async function renderNotes() {
  loadingSpinner.show();

  const nonArchivedNotes = await fetchNonArchivedNotes();
  const archivedNotes = await fetchArchivedNotes();

  renderNoteList(nonArchivedNotes, 'unArchivedNoteshelfList', true);
  renderNoteList(archivedNotes, 'archivedNoteshelfList', false);

  loadingSpinner.hide();
}
function renderNoteList(notes, containerId, isNonArchived) {
  const notesListContainer = document.getElementById(containerId);
  notesListContainer.innerHTML = '';

  notes.forEach(note => {
    const noteItem = document.createElement('div');
    noteItem.classList.add('note_item');
    noteItem.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.body}</p>
      <p>Created At: ${note.createdAt}</p>
      <div class="action">
        <button class="deleteNote" data-id="${note.id}">Hapus</button>
        ${isNonArchived ? `<button class="archiveNote" data-id="${note.id}">Arsipkan</button>` : 
        `<button class="unarchiveNote" data-id="${note.id}">Kembalikan</button>`}
      </div>
    `;
    notesListContainer.appendChild(noteItem);
  });

  notesListContainer.querySelectorAll('.deleteNote').forEach(button => {
    button.addEventListener('click', async () => {
      const noteId = button.getAttribute('data-id');
      await deleteNoteById(noteId);
    });
  });

  notesListContainer.querySelectorAll('.archiveNote, .unarchiveNote').forEach(button => {
    button.addEventListener('click', async () => {
      const noteId = button.getAttribute('data-id');
      const endpoint = isNonArchived ? 'archive' : 'unarchive';
      await updateNoteStatusById(noteId, endpoint);
    });
  });
}
async function updateNoteStatusById(noteId, endpoint) {
  try {
    const response = await fetch(`${baseUrl}/notes/${noteId}/${endpoint}`, {
      method: 'POST'
    });
    const data = await response.json();
    if (data.status === 'success') {
      await renderNotes();
      if (endpoint === 'archive') {
        alert('Catatan berhasil diarsipkan!');
      } else {
        alert('Catatan berhasil dikembalikan ke Catatan Saya!');
      }
    } else {
      console.error(`Error ${endpoint === 'archive' ? 'archiving' : 'unarchiving'} note:`, data.message);
    }
  } catch (error) {
    console.error(`Error ${endpoint === 'archive' ? 'archiving' : 'unarchiving'} note:`, error);
  }
}
async function deleteNoteById(noteId) {
  try {
    const response = await fetch(`${baseUrl}/notes/${noteId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (data.status === 'success') {
      await renderNotes();
      alert('Catatan berhasil dihapus!');
    } else {
      console.error('Error deleting note:', data.message);
    }
  } catch (error) {
    console.error('Error deleting note:', error);
  }
}

document.getElementById('inputNotes').addEventListener('submit', async function(event) {
  event.preventDefault();
  const inputTitle = document.getElementById('inputTitle').value;
  const inputBody = document.getElementById('inputBody').value;
  if (inputTitle && inputBody) {
    try {
      const response = await fetch(`${baseUrl}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: inputTitle,
          body: inputBody
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        await renderNotes();
        document.getElementById('inputTitle').value = '';
        document.getElementById('inputBody').value = '';
        alert('Catatan berhasil ditambahkan!');
      } else {
        console.error('Error adding note:', data.message);
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  } else {
    alert('Judul dan Isi Catatan harus diisi!');
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  await renderNotes();
});
