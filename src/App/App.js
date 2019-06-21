import React, {Component} from 'react';
import {Route, Link} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import NoteListNav from '../NoteListNav/NoteListNav';
import NotePageNav from '../NotePageNav/NotePageNav';
import NoteListMain from '../NoteListMain/NoteListMain';
import NotePageMain from '../NotePageMain/NotePageMain';
import AddFolder from '../AddFolder/AddFolder'
import AddNote from '../AddNote/AddNote'
import {getNotesForFolder, findNote, findFolder} from '../notes-helpers';
import './App.css';
import NotefulContext from '../NotefulContext/NotefulContext'
import FolderError from '../FolderError/FolderError'
import NoteError from '../NoteError/NoteError'
import config from '../config'

class App extends Component {
    state = {
        notes: [],
        folders: []
    };

    componentDidMount() {

    Promise.all([
        fetch(`${config.API_ENDPOINT}folders/`).then(res => res.json())
      , fetch(`${config.API_ENDPOINT}notes/`).then(res => res.json())
      ])
      .then(results => {
        let newNotes = results[1].map(note => {
        	return {
          	id: note.id.toString(),
          	name: note.name,
          	modified: note.modified,
          	folder_id: note.folder_id,
          	content: note.content
          }
        })
        this.setState({
          folders: results[0],
          notes: newNotes
      });
    })
  }

    renderNavRoutes() {
        const {notes, folders} = this.state;
        return (
            <>
                {['/', '/folder/:folderId'].map(path => (
                    <Route
                        exact
                        key={path}
                        path={path}
                        render={routeProps => (
                            <NoteListNav
                                folders={folders}
                                notes={notes}
                                {...routeProps}
                            />
                        )}
                    />
                ))}
                <Route
                    path="/note/:noteId"
                    render={routeProps => {
                        const {noteId} = routeProps.match.params;
                        const note = findNote(notes, noteId) || {};
                        const folder = findFolder(folders, note.folder_id);
                        return <NotePageNav {...routeProps} folder={folder} />;
                    }}
                />
                <Route
                    path="/add-folder" component={NotePageNav}/>
                <Route
                    path="/add-note" component={NotePageNav}
                    />
            </>
        );
    }

    renderMainRoutes() {
        const {notes, folders} = this.state;
        return (
            <>
                {['/'].map(path => (
                    <Route
                        exact
                        key={path}
                        path={path}
                        render={routeProps => {
                            const { folderId } = routeProps.match.params;
                            const notesForFolder = getNotesForFolder(
                                notes,
                                folderId
                            );
                            return (
                                <NoteListMain
                                    {...routeProps}
                                    notes={notesForFolder}
                                />
                            );
                        }}
                    />
                ))}
                <Route
                  exact
                  path="/folder/:folderId"
                  render={routeProps => {
                    const{ folderId } = parseInt(routeProps.match.params)
                    const notesForFolder = getNotesForFolder(
                      notes,
                      folderId
                    )
                    // Somehow I'm not sending the right data to the /api/folder/:folder_id endpoint. It's just getting all notes
                    return (
                      <NoteListMain
                        {...routeProps}
                        notes={notesForFolder}
                      />
                    )
                  }}
                />
                <Route
                    path="/note/:noteId"
                    render={routeProps => {
                        const {noteId} = routeProps.match.params;
                        const note = findNote(notes, noteId);
                        return <NotePageMain {...routeProps} note={note} />;
                    }}
                />
                <Route
                    path='/add-folder'
                    render={routeProps => {
                        return(
                            <FolderError>
                                <AddFolder value="hello"></AddFolder>
                            </FolderError>
                        )
                    }}
                />
              <Route path="/add-note" component={AddNote} />
            </>
        );
    }

    render() {
        const contextValue = {notes: this.state.notes, folders: this.state.folders}
        return (
            <NotefulContext.Provider value={contextValue}>
            <div className="App">
                <nav className="App__nav">{this.renderNavRoutes()}</nav>
                <header className="App__header">
                    <h1>
                        <Link to="/">Noteful</Link>{' '}
                        <FontAwesomeIcon icon="check-double" />
                    </h1>
                </header>
                <main className="App__main">{this.renderMainRoutes()}</main>
            </div>
            </NotefulContext.Provider>
        );
    }
}

export default App;
