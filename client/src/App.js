import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import './App.css';

const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://notes-mern-final.onrender.com/api/notes'
    : '/api/notes';

function App() {
  const { user, token, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editNote, setEditNote] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchNotes();
    }
  }, [token]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNotes(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError('Failed to fetch notes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleNote = async (method = 'POST', id = '') => {
    if (method !== 'DELETE' && !newNote.trim()) {
      setError('Note text cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const url = `${API_URL}${id ? `/${id}` : ''}`;
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: method !== 'DELETE' ? JSON.stringify({ text: newNote }) : undefined
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      if (method === 'DELETE') {
        setNotes(notes.filter(note => note._id !== id));
        setNewNote('');
        setEditNote(null);
        setError(null);
        return;
      }

      const data = await response.json();
      if (method === 'PUT') {
        setNotes(notes.map(note => note._id === data._id ? data : note));
      } else if (method === 'POST') {
        setNotes([data, ...notes]);
      }

      setNewNote('');
      setEditNote(null);
      setError(null);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || `Failed to ${method.toLowerCase()} note. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await handleNote('DELETE', id);
    }
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div className="container">
      <div className="header-container">
        <h1 className="header">Notes App</h1>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="inputContainer">
        <input 
          type="text" 
          value={newNote} 
          onChange={e => setNewNote(e.target.value)} 
          placeholder="Enter your note here..." 
          className="input"
          disabled={loading}
        />
        <button 
          onClick={() => handleNote(editNote ? 'PUT' : 'POST', editNote?._id)}
          className="button addButton"
          disabled={loading}
        >
          {loading ? 'Loading...' : editNote ? 'Update Note' : 'Add Note'}
        </button>
      </div>

      {loading && <div className="loading">Loading...</div>}

      <ul className="notesList">
        {notes.length > 0 ? (
          notes.map(note => (
            <li key={note._id} className="noteItem">
              <p className="noteText">{note.text}</p>
              <div className="buttonGroup">
                <button 
                  onClick={() => {
                    setEditNote(note);
                    setNewNote(note.text);
                  }}
                  className="button editButton"
                  disabled={loading}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(note._id)}
                  className="button deleteButton"
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="emptyState">No notes yet. Add your first note above!</p>
        )}
      </ul>
    </div>
  );
}

export default App;
