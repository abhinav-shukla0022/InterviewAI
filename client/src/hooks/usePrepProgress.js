import { useState, useEffect, useCallback, useRef } from "react"
import { fetchPrepProgress, savePrepProgress, deletePrepNote } from "../utils/prepprogressApi"

export function usePrepProgress(field) {
  const [notes, setNotes] = useState([])
  const [checklist, setChecklist] = useState([])
  const [watchedVideos, setWatchedVideos] = useState([])
  const [loadingProgress, setLoadingProgress] = useState(false)

  // Ref to avoid saving on initial load
  const isInitialLoad = useRef(true)

  // Fetch when field changes
  useEffect(() => {
    if (!field) return
    isInitialLoad.current = true
    setLoadingProgress(true)
    fetchPrepProgress(field)
      .then((data) => {
        setNotes(data.notes || [])
        setChecklist(data.checklist || [])
        setWatchedVideos(data.watchedVideos || [])
      })
      .catch((err) => console.error("Failed to fetch prep progress:", err))
      .finally(() => {
        setLoadingProgress(false)
        // Allow auto-save after a tick (so state settles first)
        setTimeout(() => { isInitialLoad.current = false }, 100)
      })
  }, [field])

  // Auto-save helper
  const save = useCallback(
    (newNotes, newChecklist, newWatchedVideos) => {
      if (!field || isInitialLoad.current) return
      savePrepProgress(field, newNotes, newChecklist, newWatchedVideos).catch((err) =>
        console.error("Auto-save failed:", err)
      )
    },
    [field]
  )

  // Add note
  const addNote = useCallback(
    (text) => {
      if (!text.trim()) return
      const newNotes = [...notes, text.trim()]
      const newChecklist = [...checklist, false]
      setNotes(newNotes)
      setChecklist(newChecklist)
      save(newNotes, newChecklist, watchedVideos)
    },
    [notes, checklist, watchedVideos, save]
  )

  // Delete note
  const deleteNote = useCallback(
    async (index) => {
      try {
        const data = await deletePrepNote(field, index)
        // Use server-returned arrays (already spliced correctly)
        setNotes(data.notes)
        setChecklist(data.checklist)
        save(data.notes, data.checklist, watchedVideos)
      } catch (err) {
        console.error("Delete note failed:", err)
      }
    },
    [field, watchedVideos, save]
  )

  // Toggle checklist
  const toggleChecklist = useCallback(
    (index) => {
      const newChecklist = checklist.map((v, i) => (i === index ? !v : v))
      setChecklist(newChecklist)
      save(notes, newChecklist, watchedVideos)
    },
    [checklist, notes, watchedVideos, save]
  )

  // Toggle watched video
  const toggleWatchedVideo = useCallback(
    (videoIndex) => {
      const newWatched = watchedVideos.includes(videoIndex)
        ? watchedVideos.filter((v) => v !== videoIndex)
        : [...watchedVideos, videoIndex]
      setWatchedVideos(newWatched)
      save(notes, checklist, newWatched)
    },
    [watchedVideos, notes, checklist, save]
  )

return {
  notes: field ? { [field]: notes } : {},
  checklist: field ? { [field]: checklist } : {},
  watchedVideos: field ? { [field]: watchedVideos } : {},
  loadingProgress,
  addNote,
  deleteNote,
  toggleChecklist,
  toggleWatchedVideo
}
}