// All data access goes through this file. App.jsx only calls the five
// exported functions.
//
// Session shape: { id, location, buyIn, addOn, cashOut, date }  (date = "YYYY-MM-DD")
//
// Requests go to /api/sessions, which the Vite dev server proxies to the
// ASP.NET backend (see vite.config.js).

const BASE_URL = '/api/sessions'

async function request(path = '', options = {}) {
  const response = await fetch(BASE_URL + path, options)
  if (!response.ok) {
    if (response.status === 404) throw new Error('Session not found')
    throw new Error(`Request failed (${response.status} ${response.statusText})`)
  }
  // PUT and DELETE answer 204 No Content, so there is no body to parse.
  return response.status === 204 ? null : response.json()
}

function jsonBody(method, data) {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }
}

export async function listSessions() {
  return request()
}

export async function getSession(id) {
  return request(`/${id}`)
}

export async function createSession(data) {
  return request('', jsonBody('POST', data))
}

export async function updateSession(id, data) {
  await request(`/${id}`, jsonBody('PUT', data))
}

export async function deleteSession(id) {
  await request(`/${id}`, { method: 'DELETE' })
}
