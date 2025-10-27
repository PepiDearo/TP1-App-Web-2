import React, { useState, useEffect } from "react";
import { auth, db, storage } from "./firebase";
import {
  updateProfile,
  updateEmail,
  signOut,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const Profile = () => {
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [email, setEmail] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [password, setPassword] = useState("");
  const [nameUpdated, setNameUpdated] = useState(false);

  // Vérifier si l'utilisateur est anonyme
  const isAnonymousUser = user?.isAnonymous;
  
  // Vérifier si l'utilisateur est connecté avec un numéro de téléphone
  const isPhoneUser = user?.providerData?.some(
    provider => provider.providerId === 'phone'
  );

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || "/default-avatar.png");
      // Ne pas mettre à jour l'email pour les utilisateurs téléphone
      if (!isPhoneUser) {
        setEmail(user.email || "");
      }
    }
  }, [user, isPhoneUser]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Reset l'état de confirmation du nom après 2 secondes
  useEffect(() => {
    if (nameUpdated) {
      const timer = setTimeout(() => setNameUpdated(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [nameUpdated]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await updateProfile(user, { photoURL: downloadURL });
      await updateDoc(doc(db, "users", user.uid), { photoURL: downloadURL });

      setPhotoURL(downloadURL);
      setMessage("✅ Photo mise à jour avec succès !");
    } catch (error) {
      console.error("Erreur de téléversement :", error);
      setMessage("⚠️ Échec de la mise à jour de la photo.");
    } finally {
      setUploading(false);
    }
  };

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    if (!displayName.trim() || !user) return;

    try {
      await updateProfile(user, { displayName });
      await updateDoc(doc(db, "users", user.uid), { displayName });
      await user.reload();
      
      // Feedback visuel immédiat
      setNameUpdated(true);
      setMessage("✅ Pseudonyme mis à jour avec succès !");
      
    } catch (error) {
      console.error("Erreur mise à jour nom :", error);
      setMessage("⚠️ Erreur lors de la mise à jour du pseudonyme.");
    }
  };

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    if (!email.trim() || !user) return;

    try {
      await updateEmail(user, email);
      await updateDoc(doc(db, "users", user.uid), { email });
      setMessage("✅ E-mail mis à jour !");
    } catch (error) {
      console.error("Erreur mise à jour e-mail :", error);
      setMessage("⚠️ Reconnecte-toi pour modifier ton e-mail.");
    }
  };

  const reauthenticateUser = async () => {
    if (!user || !user.email) return false;
    
    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      return true;
    } catch (error) {
      console.error("Erreur de ré-authentification:", error);
      setMessage("❌ Mot de passe incorrect");
      return false;
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || isAnonymousUser) return;
    
    setIsDeleting(true);
    try {
      // Essayer de supprimer directement d'abord
      await performAccountDeletion();
      
    } catch (error) {
      console.error("Erreur suppression compte :", error);
      
      if (error.code === 'auth/requires-recent-login') {
        // Demander la ré-authentification
        setShowReauthModal(true);
        setMessage("🔒 Ré-authentification requise");
      } else {
        setMessage("⚠️ Erreur lors de la suppression du compte: " + error.message);
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const performAccountDeletion = async () => {
    if (!user) return;

    // Supprimer la photo de profil du storage si elle existe
    if (user.photoURL && user.photoURL.includes('avatars')) {
      try {
        const storageRef = ref(storage, `avatars/${user.uid}`);
        await deleteObject(storageRef);
      } catch (error) {
        console.warn("Erreur lors de la suppression de la photo:", error);
      }
    }

    // Supprimer le document utilisateur de Firestore
    await deleteDoc(doc(db, "users", user.uid));

    // Supprimer le compte utilisateur de Firebase Auth
    await deleteUser(user);

    setMessage("✅ Compte supprimé avec succès !");
    
    // Redirection après un court délai
    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  };

  const handleReauthAndDelete = async () => {
    if (!password.trim()) {
      setMessage("❌ Veuillez entrer votre mot de passe");
      return;
    }

    setIsDeleting(true);
    try {
      const reauthSuccess = await reauthenticateUser();
      if (reauthSuccess) {
        await performAccountDeletion();
        setShowReauthModal(false);
        setPassword("");
      }
    } catch (error) {
      console.error("Erreur après ré-authentification:", error);
      setMessage("⚠️ Erreur lors de la suppression: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      window.location.href = "/";
    });
  };

  const handleBackToChat = () => {
    window.location.href = "/chat";
  };

  return (
    <div
      className="profile-page"
      style={{
        minHeight: "100vh",
        width: "100vw",
        overflowY: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        padding: "2rem 1rem",
      }}
    >
      <div
        className="box"
        style={{
          background: "white",
          borderRadius: "1rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          padding: "2rem",
          width: "100%",
          maxWidth: "480px",
          textAlign: "center",
        }}
      >
        {/* === Avatar === */}
        <figure
          className="image is-128x128"
          style={{
            margin: "0 auto 1.5rem",
          }}
        >
          <img
            src={photoURL}
            alt="Avatar"
            className="is-rounded"
            style={{
              width: "128px",
              height: "128px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        </figure>

        {/* Avertissement pour les utilisateurs anonymes */}
        {isAnonymousUser && (
          <div
            className="notification is-warning is-light"
            style={{ marginBottom: "1.5rem" }}
          >
            <p>
              <strong>Compte temporaire</strong><br />
              Vous utilisez un compte anonyme. Certaines fonctionnalités sont limitées.
            </p>
          </div>
        )}

        {/* Avertissement pour les utilisateurs téléphone */}
        {isPhoneUser && (
          <div
            className="notification is-info is-light"
            style={{ marginBottom: "1.5rem" }}
          >
            <p>
              <strong>Compte téléphone</strong><br />
              Vous êtes connecté avec un numéro de téléphone. Certaines fonctionnalités sont limitées.
            </p>
          </div>
        )}

        {/* === File upload === */}
        <div className="file is-centered" style={{ marginBottom: "1.5rem" }}>
          <label className="file-label">
            <input
              className="file-input"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />
            <span className="file-cta">
              <span className="file-label">
                {uploading ? "Envoi..." : "Changer la photo"}
              </span>
            </span>
          </label>
        </div>

        {/* === Update pseudonyme === */}
        <form onSubmit={handleNameUpdate} style={{ marginBottom: "1.5rem" }}>
          <div className="field">
            <label className="label" style={{ textAlign: "left" }}>
              Pseudonyme
            </label>
            <div className="control">
              <input
                className="input"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{
                  borderColor: nameUpdated ? '#48c78e' : '#dbdbdb',
                  boxShadow: nameUpdated ? '0 0 0 0.125em rgba(72, 199, 142, 0.25)' : 'none'
                }}
              />
            </div>
            {/* Message de confirmation en temps réel */}
            {nameUpdated && (
              <p className="help is-success" style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
                ✓ Pseudonyme mis à jour !
              </p>
            )}
          </div>
          <button 
            className="button is-link is-fullwidth" 
            type="submit"
            style={{
              backgroundColor: nameUpdated ? '#48c78e' : '#485fc7',
              borderColor: nameUpdated ? '#48c78e' : '#485fc7'
            }}
          >
            {nameUpdated ? '✓ Mis à jour !' : 'Mettre à jour'}
          </button>
        </form>

        {/* === Update email - CACHÉ pour les utilisateurs téléphone === */}
        {!isPhoneUser && (
          <form onSubmit={handleEmailUpdate} style={{ marginBottom: "1.5rem" }}>
            <div className="field">
              <label className="label" style={{ textAlign: "left" }}>
                Adresse e-mail
              </label>
              <div className="control">
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button className="button is-info is-fullwidth" type="submit">
              Mettre à jour l'e-mail
            </button>
          </form>
        )}

        {/* === Privacy and Data Management Section === */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h3 className="title is-5" style={{ textAlign: "left", marginBottom: "1rem" }}>
            Confidentialité et données
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <a 
              href="/privacy" 
              className="button is-text is-fullwidth"
              style={{ 
                textAlign: "left", 
                justifyContent: "flex-start",
                border: "1px solid #dbdbdb",
                padding: "0.75rem"
              }}
            >
              <span style={{ marginRight: "0.5rem" }}>📄</span>
              Politique de confidentialité
            </a>
            
            {/* Bouton de suppression de compte - seulement pour les utilisateurs non anonymes */}
            {!isAnonymousUser && (
              <button
                className="button is-text is-fullwidth"
                style={{ 
                  textAlign: "left", 
                  justifyContent: "flex-start",
                  border: "1px solid #dbdbdb",
                  padding: "0.75rem",
                  color: "#ff3860"
                }}
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
              >
                <span style={{ marginRight: "0.5rem" }}>🗑️</span>
                {isDeleting ? "Suppression..." : "Supprimer mon compte et mes données"}
              </button>
            )}
          </div>
          
          <div 
            className="notification is-warning is-light" 
            style={{ 
              marginTop: "1rem",
              fontSize: "0.8rem",
              textAlign: "left"
            }}
          >
            <p>
              <strong>Important :</strong> La suppression de votre compte effacera 
              définitivement toutes vos données, y compris votre profil et vos messages.
              {isAnonymousUser && " Cette fonctionnalité n'est pas disponible pour les comptes anonymes."}
            </p>
          </div>
        </div>

        {/* === Modal de confirmation de suppression === */}
        {showDeleteConfirm && (
          <div className="modal is-active">
            <div className="modal-background" onClick={() => setShowDeleteConfirm(false)}></div>
            <div className="modal-card">
              <header className="modal-card-head">
                <p className="modal-card-title">Confirmer la suppression</p>
                <button 
                  className="delete" 
                  aria-label="close"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                ></button>
              </header>
              <section className="modal-card-body">
                <p>Êtes-vous sûr de vouloir supprimer votre compte ?</p>
                <p style={{ marginTop: "1rem", fontWeight: "bold" }}>
                  Cette action est irréversible et supprimera définitivement :
                </p>
                <ul style={{ textAlign: "left", marginTop: "0.5rem" }}>
                  <li>• Votre profil utilisateur</li>
                  <li>• Votre photo de profil</li>
                  <li>• Tous vos messages</li>
                  <li>• Toutes vos données</li>
                </ul>
              </section>
              <footer className="modal-card-foot" style={{ justifyContent: "flex-end" }}>
                <button 
                  className="button" 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Annuler
                </button>
                <button 
                  className="button is-danger" 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Suppression..." : "Supprimer définitivement"}
                </button>
              </footer>
            </div>
          </div>
        )}

        {/* === Modal de ré-authentification === */}
        {showReauthModal && (
          <div className="modal is-active">
            <div className="modal-background" onClick={() => !isDeleting && setShowReauthModal(false)}></div>
            <div className="modal-card">
              <header className="modal-card-head">
                <p className="modal-card-title">Vérification de sécurité</p>
                <button 
                  className="delete" 
                  aria-label="close"
                  onClick={() => setShowReauthModal(false)}
                  disabled={isDeleting}
                ></button>
              </header>
              <section className="modal-card-body">
                <p>Pour supprimer votre compte, veuillez confirmer votre identité :</p>
                <div className="field" style={{ marginTop: "1rem" }}>
                  <label className="label">Mot de passe</label>
                  <div className="control">
                    <input
                      className="input"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Entrez votre mot de passe"
                      disabled={isDeleting}
                    />
                  </div>
                </div>
              </section>
              <footer className="modal-card-foot" style={{ justifyContent: "flex-end" }}>
                <button 
                  className="button" 
                  onClick={() => setShowReauthModal(false)}
                  disabled={isDeleting}
                >
                  Annuler
                </button>
                <button 
                  className="button is-danger" 
                  onClick={handleReauthAndDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Suppression..." : "Confirmer et supprimer"}
                </button>
              </footer>
            </div>
          </div>
        )}

        {/* === Infos === */}
        <div
          style={{
            textAlign: "left",
            marginTop: "1.5rem",
            fontSize: "0.9rem",
            borderTop: "1px solid #dbdbdb",
            paddingTop: "1.5rem"
          }}
        >
          <p>
            <strong>Type de compte :</strong>{" "}
            {isAnonymousUser ? "Anonyme" : isPhoneUser ? "Téléphone" : "Standard"}
          </p>
          <p>
            <strong>Fournisseur :</strong>{" "}
            {user?.providerData[0]?.providerId || "Firebase"}
          </p>
          {!isPhoneUser && (
            <p>
              <strong>Email :</strong>{" "}
              {user?.email || "Non disponible"}
            </p>
          )}
          {isPhoneUser && (
            <p>
              <strong>Téléphone :</strong>{" "}
              {user?.phoneNumber || "Non disponible"}
            </p>
          )}
          <p>
            <strong>Dernière connexion :</strong>{" "}
            {user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString('fr-FR') : "Non disponible"}
          </p>
          <p>
            <strong>Compte créé le :</strong>{" "}
            {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleString('fr-FR') : "Non disponible"}
          </p>
        </div>

        {/* === Message === */}
        {message && (
          <div
            className={`notification ${
              message.includes('✅') ? 'is-success' : 
              message.includes('❌') ? 'is-danger' : 
              message.includes('🔒') ? 'is-warning' : 'is-danger'
            } is-light`}
            style={{
              marginTop: "1rem",
              textAlign: "center",
            }}
          >
            {message}
          </div>
        )}

        {/* === Buttons === */}
        <div style={{ marginTop: "2rem" }}>
          <button
            className="button is-link is-fullwidth"
            onClick={handleBackToChat}
            style={{ marginBottom: "0.75rem" }}
          >
            Retour au Chat
          </button>

          <button
            className="button is-danger is-fullwidth"
            onClick={handleLogout}
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;