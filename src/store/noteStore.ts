import localforage from 'localforage';
import { Note } from '../types';
import { generateId } from '../lib/utils';

const store = localforage.createInstance({
  name: 'nocturne_notes'
});

export const NoteStore = {
  async getNotes(): Promise<Note[]> {
    const notes: Note[] = [];
    await store.iterate((value: Note) => {
      notes.push(value);
    });
    return notes.sort((a, b) => b.updatedAt - a.updatedAt);
  },

  async getNote(id: string): Promise<Note | null> {
    return await store.getItem<Note>(id);
  },

  async saveNote(note: Note): Promise<Note> {
    const updatedNote = { ...note, updatedAt: Date.now() };
    await store.setItem(note.id, updatedNote);
    return updatedNote;
  },

  async createNote(): Promise<Note> {
    const newNote: Note = {
      id: generateId(),
      title: '',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
      attachments: {},
      isFavorite: false,
    };
    await store.setItem(newNote.id, newNote);
    return newNote;
  },

  async deleteNote(id: string): Promise<void> {
    await store.removeItem(id);
  },
  
  async exportNotes(): Promise<string> {
    const notes = await this.getNotes();
    return JSON.stringify(notes, null, 2);
  },
  
  async importNotes(jsonData: string): Promise<void> {
    const notes: Note[] = JSON.parse(jsonData);
    for (const note of notes) {
      await store.setItem(note.id, note);
    }
  }
};
