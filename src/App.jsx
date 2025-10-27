import "bulma/css/bulma.min.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Accueil from "./Accueil";
import Login from "./Login";
import Inscription from "./Inscription";
import Chat from "./Chat";
import Profile from "./Profile";
import Privacy from './Privacy';
import DeleteAccount from './DeleteAccount';

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <section className="section">
        <div className="container has-text-centered">
          <div className="button is-primary is-loading is-large">Chargement...</div>
        </div>
      </section>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Accueil : accessible seulement si l’utilisateur n’est PAS connecté */}
        <Route
          path="/"
          element={!user ? <Accueil /> : <Navigate to="/chat" />}
        />

        {/* Connexion */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/chat" />}
        />

        {/* Inscription */}
        <Route
          path="/inscription"
          element={!user ? <Inscription /> : <Navigate to="/chat" />}
        />

        <Route path="/privacy" element={<Privacy />} />
        <Route path="/delete-account" element={<DeleteAccount />} />

        {/* Chat (protégé) */}
        <Route
          path="/chat"
          element={user ? <Chat /> : <Navigate to="/" />}
        />

        {/* Profil utilisateur (protégé) */}
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/" />}
        />

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
