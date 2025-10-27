import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
  getDocs,
} from "firebase/firestore";
import ChatSidebar from "./ChatSideBar";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeChat, setActiveChat] = useState("general");
  const [usersOnline, setUsersOnline] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const user = auth.currentUser;
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  
  //fonction pour detecter et formater les liens dans le texte
  const formatMessageWithLinks = (text) => {
    if (!text) return text;

    

    // expression reguliere pour detecter les URL
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    
    //verifier si le message contient un lien youtube pour le preview
    const isYouTube = text.includes('youtube.com') || text.includes('youtu.be');
    const firstLink = getFirstLink(text);
    
    return (
      <div>
        {/* Montre le message original avec des liens clickable*/}
        <div>
          {text.split(urlRegex).map((part, index) => {
            if (part.match(urlRegex)) {
              return (
                <a 
                  key={index}
                  href={part} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: 'inherit',
                    textDecoration: 'underline',
                    wordBreak: 'break-all'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {part}
                </a>
              );
            }
            return part;
          })}
        </div>
        
        {/* montre le yt preview apres msg */}
        {isYouTube && firstLink && (
          <div style={{ marginTop: '0.5rem' }}>
            <iframe
              width="100%"
              height="200"
              src={getYouTubeEmbedUrl(firstLink)}
              title="YouTube video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ borderRadius: '8px' }}
            ></iframe>
          </div>
        )}
      </div>
    );
  };


  // fonction pour convertir les URL youtube en URL embed
  const getYouTubeEmbedUrl = (url) => {
    try {
      // yt shorts
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
      
      // handler pour youtube.com URLs
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URL(url);
        const videoId = urlParams.searchParams.get('v');
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
      
      return url;
    } catch (error) {
      return url;
    }
  };

  // fonction pour detecter si le texte contient un lien
  const containsLink = (text) => {
    if (!text) return false;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return urlRegex.test(text);
  };

  
  // function pour extraire le premier lien du texte
  const getFirstLink = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
  };

  
  //fonction pour rendre l'aperçu de la réponse avec une flèche
  const renderReplyPreview = (replyTo, isCurrentUser) => {
    if (!replyTo) return null;
    
    return (
      <div
        style={{
          position: 'relative',
          marginBottom: '0.5rem',
        }}
      >
        {/* fleche qui point message original */}
        <div
          style={{
            position: 'absolute',
            left: isCurrentUser ? 'auto' : '-15px',
            right: isCurrentUser ? '-15px' : 'auto',
            top: '8px',
            width: '0',
            height: '0',
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: isCurrentUser ? 'none' : '8px solid rgba(0, 0, 0, 0.1)',
            borderLeft: isCurrentUser ? '8px solid rgba(0, 0, 0, 0.1)' : 'none',
          }}
        ></div>
        
        {/* repliquer msg */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '12px',
            padding: '0.5rem 0.75rem',
            borderLeft: isCurrentUser ? 'none' : '3px solid #209cee',
            borderRight: isCurrentUser ? '3px solid #209cee' : 'none',
            marginLeft: isCurrentUser ? 'auto' : '0',
            marginRight: isCurrentUser ? '0' : 'auto',
            maxWidth: '90%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: 'bold', color: '#209cee', fontSize: '0.75rem' }}>
              {replyTo.senderName === user.displayName ? 'You' : replyTo.senderName}
            </span>
            <span style={{ color: '#666', fontSize: '0.65rem' }}>
              {formatTime(replyTo.timestamp)}
            </span>
          </div>
          <div style={{ color: '#333', lineHeight: '1.2', fontSize: '0.8rem' }}>
            {replyTo.text.length > 80 
              ? `${replyTo.text.substring(0, 80)}...` 
              : replyTo.text
            }
          </div>
        </div>
      </div>
    );
  };

  //fonction pour scroller au bas des messages
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: "smooth",
        block: "end"
      });
    }, 100);
  };

  
  //fonction pour scroller a l'input
  const scrollToInput = () => {
    setTimeout(() => {
      const inputForm = document.querySelector('form');
      if (inputForm) {
        inputForm.scrollIntoView({ 
          behavior: "smooth",
          block: "center"
        });
      }
    }, 100);
  };

  
  // handle sourie entrer avec delai
  const handleMouseEnter = (messageId) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredMessage(messageId);
  };

  
  //handle souris quitter avec delai
  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMessage(null);
    }, 300); // 300ms delay 
  };

  
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    setDoc(
      userRef,
      {
        uid: user.uid,
        displayName: user.displayName || user.email,
        email: user.email,
        photoURL: user.photoURL || "/default-avatar.png",
        isOnline: true,
        lastActive: serverTimestamp(),
      },
      { merge: true }
    );
    const handleBeforeUnload = () => {
      updateDoc(userRef, { isOnline: false, lastActive: serverTimestamp() });
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      updateDoc(userRef, { isOnline: false, lastActive: serverTimestamp() });
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const onlineUsers = snapshot.docs.map((doc) => doc.data());
      setUsersOnline(onlineUsers);
      setAllUsers(onlineUsers);
    });
    return () => unsubscribe();
  }, []);

 
  //mettre le chat history de firestore
  useEffect(() => {
    if (!user) return;
    
    const loadChatHistory = async () => {
      try {
        // load les chats privés
        const privateChatsRef = collection(db, "privateChats");
        const q = query(
          privateChatsRef,
          where("participants", "array-contains", user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const chats = [];
        
        querySnapshot.forEach((doc) => {
          const chatData = doc.data();
          const otherParticipant = chatData.participants.find(p => p !== user.uid);
          chats.push({
            id: doc.id,
            userId: otherParticipant,
            displayName: chatData.participantNames?.[otherParticipant] || "Utilisateur",
            lastMessage: chatData.lastMessage || "",
            timestamp: chatData.lastTimestamp || serverTimestamp()
          });
        });
        
        setChatHistory(chats);
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    };

    loadChatHistory();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const path =
      activeChat === "general"
        ? collection(db, "messages", activeChat, "chats")
        : collection(
            db,
            "privateChats",
            [user.uid, activeChat].sort().join("_"),
            "messages"
          );
    const q = query(path, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesData);
    });
    return () => unsubscribe();
  }, [activeChat, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    try {
      const path =
        activeChat === "general"
          ? collection(db, "messages", activeChat, "chats")
          : collection(
              db,
              "privateChats",
              [user.uid, activeChat].sort().join("_"),
              "messages"
            );
      
      const messageData = {
        text: newMessage,
        sender: user.uid,
        senderName: user.displayName || user.email,
        timestamp: serverTimestamp(),
        edited: false,
        containsLinks: containsLink(newMessage)
      };

      
      //ajouter les donnees de reponse si on repond a un message
      if (replyingTo) {
        messageData.replyTo = {
          messageId: replyingTo.id,
          sender: replyingTo.sender,
          senderName: replyingTo.senderName,
          text: replyingTo.text,
          timestamp: replyingTo.timestamp
        };
      }

      await addDoc(path, messageData);

    
      //maj le chat history pour les chats privés
      if (activeChat !== "general") {
        const chatId = [user.uid, activeChat].sort().join("_");
        const chatRef = doc(db, "privateChats", chatId);
        await setDoc(chatRef, {
          participants: [user.uid, activeChat],
          participantNames: {
            [user.uid]: user.displayName || user.email,
            [activeChat]: usersOnline.find(u => u.uid === activeChat)?.displayName || "Utilisateur"
          },
          lastMessage: newMessage,
          lastTimestamp: serverTimestamp()
        }, { merge: true });
      }

      setNewMessage("");
      setReplyingTo(null);
      scrollToBottom();
    } catch (error) {
      alert("⚠️ Impossible d'envoyer le message. Réessaie plus tard.");
    }
  };

  const editMessage = async (messageId, newText) => {
    if (!newText.trim()) return;
    
    try {
      const path =
        activeChat === "general"
          ? doc(db, "messages", activeChat, "chats", messageId)
          : doc(
              db,
              "privateChats",
              [user.uid, activeChat].sort().join("_"),
              "messages",
              messageId
            );
      
      await updateDoc(path, {
        text: newText,
        edited: true,
        editTimestamp: serverTimestamp(),
        containsLinks: containsLink(newText)
      });
      
      setEditingMessage(null);
      setEditText("");
      setHoveredMessage(null);
    } catch (error) {
      console.error("Error editing message:", error);
      alert("⚠️ Impossible de modifier le message.");
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
      return;
    }
    
    try {
      const path =
        activeChat === "general"
          ? doc(db, "messages", activeChat, "chats", messageId)
          : doc(
              db,
              "privateChats",
              [user.uid, activeChat].sort().join("_"),
              "messages",
              messageId
            );
      
      await deleteDoc(path);
      setHoveredMessage(null);
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("⚠️ Impossible de supprimer le message.");
    }
  };

  const startReply = (message, e) => {
    e.stopPropagation();
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredMessage(null);
    setReplyingTo(message);
  
    scrollToInput();
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]');
      if (input) {
        input.focus({ preventScroll: true });
      }
    }, 150);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const startEdit = (message) => {
    setEditingMessage(message.id);
    setEditText(message.text);
    setHoveredMessage(null);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditText("");
  };

  const startPrivateChat = async (userId) => {
    setActiveChat(userId);
    
    
    //mettre le chat history si pas deja la
    const existingChat = chatHistory.find(chat => chat.userId === userId);
    if (!existingChat) {
      const userToAdd = allUsers.find(u => u.uid === userId);
      const newChat = {
        id: [user.uid, userId].sort().join("_"),
        userId: userId,
        displayName: userToAdd?.displayName || "Utilisateur",
        lastMessage: "",
        timestamp: serverTimestamp()
      };
      setChatHistory(prev => [...prev, newChat]);
    }
  };

  const removeChat = async (chatId, userId) => {
    try {

      // enlever de local stat
      setChatHistory(prev => prev.filter(chat => chat.userId !== userId));
      
      
      // si le chat supprimé est actif, switch au general
      if (activeChat === userId) {
        setActiveChat("general");
      }
      
    } catch (error) {
      console.error("Error removing chat:", error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "À l'instant";
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return "À l'instant";
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)} h`;
    return date.toLocaleDateString();
  };

  const formatEditTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return `modifié à ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <section
      className="section"
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: 0,
        width: "100vw"
      }}
    >
      <div
        className="container is-fluid"
        style={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        <div className="columns is-gapless" style={{ flex: 1, height: "100%" }}>
          {/* Sidebar Component */}
          <ChatSidebar
            activeChat={activeChat}
            setActiveChat={setActiveChat}
            usersOnline={usersOnline}
            allUsers={allUsers}
            chatHistory={chatHistory}
            startPrivateChat={startPrivateChat}
            removeChat={removeChat}
          />

          {/* Chat Area */}
          <div
            className="column"
            style={{
              display: "flex",
              flexDirection: "column",
              background: "white",
              height: "100vh",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "1rem",
                borderBottom: "1px solid #ddd",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <h2 className="title is-5">
                {activeChat === "general"
                  ? "💬 Salon Général"
                  : `Chat Privé avec ${
                      usersOnline.find((u) => u.uid === activeChat)
                        ?.displayName || chatHistory.find(c => c.userId === activeChat)?.displayName || "Utilisateur"
                    }`}
              </h2>
              <div style={{ fontSize: "0.9rem" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    background: "green",
                    borderRadius: "50%",
                    marginRight: "5px",
                  }}
                ></span>
                {usersOnline.filter((u) => u.isOnline).length} en ligne
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={messagesContainerRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {messages.map((message) => {
                const isCurrentUser = message.sender === user.uid;
                const isEditing = editingMessage === message.id;
                const isHovered = hoveredMessage === message.id;

                return (
                  <div
                    key={message.id}
                    style={{
                      alignSelf: isCurrentUser ? "flex-end" : "flex-start",
                      marginBottom: "0.5rem",
                      maxWidth: "70%",
                      position: "relative",
                    }}
                    onMouseEnter={() => handleMouseEnter(message.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* buttons positiones tous en haut */}
                    {!isEditing && isHovered && (
                      <div
                        style={{
                          position: "absolute",
                          top: "-35px", // Positioned en haut du message
                          right: isCurrentUser ? "0px" : "auto",
                          left: isCurrentUser ? "auto" : "0px",
                          display: "flex",
                          gap: "2px",
                          background: "white",
                          borderRadius: "6px",
                          padding: "4px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                          zIndex: 10,
                        }}
                        onMouseEnter={() => handleMouseEnter(message.id)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <button
                          className="button is-small is-info"
                          onClick={(e) => startReply(message, e)}
                          style={{ 
                            padding: "0.35rem", 
                            fontSize: "0.7rem",
                            minWidth: "auto",
                            height: "auto",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                          title="Répondre"
                        >
                          ↩️
                        </button>
                        {isCurrentUser && (
                          <>
                            <button
                              className="button is-small is-warning"
                              onClick={() => startEdit(message)}
                              style={{ 
                                padding: "0.35rem", 
                                fontSize: "0.7rem",
                                minWidth: "auto",
                                height: "auto",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                              title="Modifier"
                            >
                              ✏️
                            </button>
                            <button
                              className="button is-small is-danger"
                              onClick={() => deleteMessage(message.id)}
                              style={{ 
                                padding: "0.35rem", 
                                fontSize: "0.7rem",
                                minWidth: "auto",
                                height: "auto",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    
                    {!isCurrentUser && (
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "#666",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {message.senderName}
                      </p>
                    )}
                    
                    {isEditing ? (
                      // maj mode 
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <input
                          className="input is-small"
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              editMessage(message.id, editText);
                            }
                          }}
                          autoFocus
                        />
                        <div style={{ display: "flex", gap: "0.25rem" }}>
                          <button
                            className="button is-success is-small"
                            onClick={() => editMessage(message.id, editText)}
                          >
                            Sauvegarder
                          </button>
                          <button
                            className="button is-light is-small"
                            onClick={cancelEdit}
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      // msg normal avec liens clickable
                      <div
                        style={{
                          background: isCurrentUser ? "#209cee" : "#f5f5f5",
                          color: isCurrentUser ? "white" : "black",
                          borderRadius: "12px",
                          padding: "0.5rem 0.75rem",
                          wordBreak: "break-word",
                          position: "relative",
                        }}
                      >
                        {/* repliquer preview */}
                        {message.replyTo && renderReplyPreview(message.replyTo, isCurrentUser)}
                        
                        {/* message */}
                        {formatMessageWithLinks(message.text)}
                      </div>
                    )}
                    
                    <p
                      style={{
                        fontSize: "0.7rem",
                        color: "#999",
                        marginTop: "0.25rem",
                        textAlign: isCurrentUser ? "right" : "left",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.1rem",
                      }}
                    >
                      <span>{formatTime(message.timestamp)}</span>
                      {message.edited && (
                        <span style={{ fontStyle: "italic" }}>
                          {message.editTimestamp 
                            ? `Modifié ${formatEditTime(message.editTimestamp)}`
                            : "Modifié"
                          }
                        </span>
                      )}
                    </p>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={sendMessage}
              style={{
                padding: "0.75rem",
                borderTop: "1px solid #ddd",
                background: "#fafafa",
                position: "relative",
                flexShrink: 0,
              }}
            >
              {/* Reply Preview in Input */}
              {replyingTo && (
                <div
                  style={{
                    background: 'rgba(32, 156, 238, 0.1)',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    marginBottom: '0.75rem',
                    borderLeft: '3px solid #209cee',
                    fontSize: '0.8rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    position: 'relative',
                  }}
                >
                  {/* fleche qui vise messgae*/}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-12px',
                      top: '12px',
                      width: '0',
                      height: '0',
                      borderTop: '8px solid transparent',
                      borderBottom: '8px solid transparent',
                      borderRight: '8px solid rgba(32, 156, 238, 0.1)',
                    }}
                  ></div>
                  
                  <div style={{ flex: 1, marginLeft: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 'bold', color: '#209cee', fontSize: '0.75rem' }}>
                        Répondre à {replyingTo.senderName === user.displayName ? 'vous' : replyingTo.senderName}
                      </span>
                    </div>
                    <div style={{ color: '#333', lineHeight: '1.2', fontSize: '0.8rem' }}>
                      {replyingTo.text.length > 80 
                        ? `${replyingTo.text.substring(0, 80)}...` 
                        : replyingTo.text
                      }
                    </div>
                  </div>
                  <button
                    type="button"
                    className="delete is-small"
                    onClick={cancelReply}
                    style={{ marginLeft: '0.5rem', flexShrink: 0 }}
                  ></button>
                </div>
              )}
              
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  className="input"
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={replyingTo ? "Tapez votre réponse..." : "Tapez votre message ou collez un lien..."}
                />
                <button className="button is-link" type="submit">
                  {replyingTo ? "Répondre" : "Envoyer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
 
export default Chat;