import { defineStore } from 'pinia'

export const useFileStore = defineStore('fileStore', {
  state: () => ({
    // 存储待传递的文件列表
    pendingFiles: [],
  }),
  
  actions: {
    // 设置待传递的文件列表
    setPendingFiles(files) {
      this.pendingFiles = files
    },
    
    // 获取并清空待传递的文件列表
    getAndClearPendingFiles() {
      const files = [...this.pendingFiles]
      this.pendingFiles = []
      return files
    },
    
    // 清空待传递的文件列表
    clearPendingFiles() {
      this.pendingFiles = []
    }
  }
})
