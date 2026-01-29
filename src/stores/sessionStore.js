import { defineStore } from 'pinia'

export const useSessionStore = defineStore('sessionStore', {
  state: () => ({
    sessions: []
  }),

  getters: {
    getSessionById: (state) => (sessionId) => {
      return state.sessions.find(s => s.session_id === sessionId)
    }
  },

  actions: {
    loadSessions() {
      const saved = localStorage.getItem('session_id_chat_history_list')
      if (saved) {
        try {
          this.sessions = JSON.parse(saved)
        } catch (e) {
          console.error('Failed to parse sessions from localStorage:', e)
          this.sessions = []
        }
      }
    },

    saveSessions() {
      localStorage.setItem('session_id_chat_history_list', JSON.stringify(this.sessions))
    },

    updateSessionTitleById(sessionId, newTitle) {
      const session = this.sessions.find(s => s.session_id === sessionId)
      if (session) {
        session.session_title = newTitle
        this.saveSessions()
      }
    },

    addSession(session) {
      this.sessions.push(session)
      this.saveSessions()
    },

    removeSessionById(sessionId) {
      this.sessions = this.sessions.filter(s => s.session_id !== sessionId)
      this.saveSessions()
    },

    updateChatHistoryById(sessionId, chatHistory) {
      const session = this.sessions.find(s => s.session_id === sessionId)
      if (session) {
        session.chatHistory = chatHistory
        this.saveSessions()
      }
    },

    updateSessionById(sessionId, sessionTitle, chatHistory) {
      const session = this.sessions.find(s => s.session_id === sessionId)
      if (session) {
        session.session_title = sessionTitle
        session.chatHistory = chatHistory
        this.saveSessions()
      }
    }
  }
})
