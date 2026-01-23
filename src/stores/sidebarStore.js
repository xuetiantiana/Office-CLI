import { defineStore } from 'pinia'

export const useSidebarStore = defineStore('sidebarStore', {
  state: () => ({
    isExpanded: true,
    sidebarWidth: '20em',
    expandedWidth: '20em',
    collapsedWidth: '40px'
  }),
  
  getters: {
    currentWidth: (state) => state.isExpanded ? state.expandedWidth : state.collapsedWidth
  },
  
  actions: {
    toggleSidebar() {
      this.isExpanded = !this.isExpanded
      this.sidebarWidth = this.isExpanded ? this.expandedWidth : this.collapsedWidth
    },
    
    setExpanded(expanded) {
      this.isExpanded = expanded
      this.sidebarWidth = expanded ? this.expandedWidth : this.collapsedWidth
    }
  }
})
