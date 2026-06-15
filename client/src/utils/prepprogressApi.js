import axios from "axios"

const BASE = "https://interviewai-bnux.onrender.com"

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`
})

export const fetchPrepProgress = async (field) => {
  const res = await axios.get(`${BASE}/prep-progress/${field}`, {
    headers: getHeaders()
  })
  return res.data // { notes, checklist, watchedVideos }
}

export const savePrepProgress = async (field, notes, checklist, watchedVideos) => {
  await axios.post(
    `${BASE}/prep-progress/save`,
    { field, notes, checklist, watchedVideos },
    { headers: getHeaders() }
  )
}

export const deletePrepNote = async (field, noteIndex) => {
  const res = await axios.delete(`${BASE}/prep-note/${field}/${noteIndex}`, {
    headers: getHeaders()
  })
  return res.data // { notes, checklist }
}