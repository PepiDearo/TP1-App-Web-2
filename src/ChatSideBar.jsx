import React, { useState } from "react";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import userDefaultImage from "./assets/defaultUserImage.jpg";

const ChatSidebar = ({ 
  activeChat, 
  setActiveChat, 
  usersOnline, 
  allUsers, 
  chatHistory, 
  startPrivateChat, 
  removeChat 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const user = auth.currentUser;

  const filteredUsers = allUsers.filter(u => 
    u.uid !== user.uid && 
    (u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div
      className="column is-one-quarter"
      style={{
        background: "#fafafa",
        borderRight: "1px solid #ddd",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      <div>
        <div style={{ padding: "1rem" }}>
          <h3 className="title is-6">Salons</h3>
          <div
            className={`box is-clickable ${
              activeChat === "general" ? "has-background-link-light" : ""
            }`}
            onClick={() => setActiveChat("general")}
            style={{ marginBottom: "0.5rem" }}
          >
            Général
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ padding: "0 1rem 1rem 1rem" }}>
          <h3 className="title is-6">Rechercher un utilisateur</h3>
          <input
            className="input is-small"
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginBottom: "0.5rem" }}
          />
          
          {searchTerm && (
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {filteredUsers.map((u) => (
                <div
                  key={u.uid}
                  className="box is-clickable"
                  onClick={() => startPrivateChat(u.uid)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.25rem",
                    padding: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: u.isOnline ? "green" : "gray",
                      display: "inline-block",
                    }}
                  ></span>
                  <span>{u.displayName || u.email}</span>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="has-text-centered" style={{ padding: "0.5rem", color: "#666" }}>
                  Aucun utilisateur trouvé
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat History */}
        <div style={{ padding: "1rem" }}>
          <h3 className="title is-6">Historique des chats</h3>
          {chatHistory.length > 0 ? (
            chatHistory.map((chat) => (
              <div
                key={chat.userId}
                className={`box is-clickable ${
                  activeChat === chat.userId ? "has-background-link-light" : ""
                }`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                  padding: "0.75rem",
                  position: "relative",
                }}
              >
                <div 
                  onClick={() => setActiveChat(chat.userId)}
                  style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: usersOnline.find(u => u.uid === chat.userId)?.isOnline ? "green" : "gray",
                      display: "inline-block",
                    }}
                  ></span>
                  <span style={{ flex: 1 }}>{chat.displayName}</span>
                </div>
                <button
                  className="delete is-small"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeChat(chat.id, chat.userId);
                  }}
                  style={{ marginLeft: "0.5rem" }}
                ></button>
              </div>
            ))
          ) : (
            <div className="has-text-centered" style={{ padding: "1rem", color: "#666" }}>
              Aucun chat privé
            </div>
          )}
        </div>
      </div>

      {/*  Section profile */}
      <div
        style={{
          padding: "1rem",
          borderTop: "1px solid #ddd",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <figure className="image is-48x48">
            <img
              src={user.photoURL || userDefaultImage}
              alt="user"
              style={{
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          </figure>
          <div>
            <p className="has-text-weight-semibold">
              {user.displayName || user.email}
            </p>
            <p style={{ fontSize: "0.8rem", color: "green" }}>● En ligne</p>
          </div>
        </div>
        <button
          className="button is-link is-light is-fullwidth"
          onClick={() => (window.location.href = "/profile")}
        >
          Mon Profil
        </button>
        
        {/* lien privacy et data link */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <a 
            href="/privacy" 
            className="button is-text is-small is-fullwidth"
            style={{ 
              textAlign: "left", 
              justifyContent: "flex-start", 
              fontSize: "0.8rem",
              padding: "0.5rem"
            }}
          >
            📄 Politique de confidentialité
          </a>
          <a 
            href="/delete-account" 
            className="button is-text is-small is-fullwidth"
            style={{ 
              textAlign: "left", 
              justifyContent: "flex-start", 
              fontSize: "0.8rem",
              padding: "0.5rem",
              color: "#ff3860"
            }}
          >
            🗑️ Supprimer mon compte
          </a>
        </div>
        
        <button
          className="button is-danger is-light is-fullwidth"
          onClick={() => signOut(auth)}
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default ChatSidebar;