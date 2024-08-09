const axios = require('axios');

// Base API URL
const API_BASE_URL = 'http://localhost:8000/project';

/**
 * Makes an API request using Axios.
 * @param {string} method - The HTTP method (e.g., 'GET', 'POST', 'PUT').
 * @param {string} url - The URL of the API endpoint.
 * @param {Object} headers - The headers to include in the request.
 * @param {Object} data - The data to send with the request (for POST, PUT, etc.).
 * @returns {Promise} - A promise that resolves with the response data.
 */
function makeApiRequest(method, url, headers = {}, data = {}) {
  const options = {
    method,
    url,
    headers,
    data,
  };

  return axios.request(options)
    .then(response => response.data)
    .catch(error => {
      console.error('API request error:', error);
      throw error;
    });
}

/**
 * Creates a new project.
 * @param {Object} projectData - The data for the new project.
 * @returns {Promise} - A promise that resolves with the response data.
 */
export function createProject(projectData) {
  const apiHeaders = { 'Content-Type': 'application/json' };

  return makeApiRequest('POST', API_BASE_URL, apiHeaders, projectData)
    .then(data => {
      console.log('Project created:', data);
      return data;
    });
}

/**
 * Updates an existing project.
 * @param {string} projectId - The ID of the project to update.
 * @param {Object} projectData - The updated data for the project.
 * @returns {Promise} - A promise that resolves with the response data.
 */
export function updateProject(projectId, projectData) {
  const apiHeaders = { 'Content-Type': 'application/json' };
  const apiUrl = `${API_BASE_URL}/${projectId}`;

  return makeApiRequest('PUT', apiUrl, apiHeaders, projectData)
    .then(data => {
      console.log('Project updated:', data);
      return data;
    });
}

/**
 * Retrieves all projects.
 * @returns {Promise} - A promise that resolves with the list of projects.
 */
export function getAllProjects() {
  const apiHeaders = { 'Content-Type': 'application/json' };

  return makeApiRequest('GET', API_BASE_URL, apiHeaders)
    .then(data => {
      console.log('All projects:', data);
      return data;
    });
}

/**
 * Retrieves a single project by ID.
 * @param {string} projectId - The ID of the project to retrieve.
 * @returns {Promise} - A promise that resolves with the project data.
 */
export function getProjectById(projectId) {
  const apiHeaders = { 'Content-Type': 'application/json' };
  const apiUrl = `${API_BASE_URL}/${projectId}`;

  return makeApiRequest('GET', apiUrl, apiHeaders)
    .then(data => {
      console.log(`Project ${projectId}:`, data);
      return data;
    });
}

// Examples for each API call

// Example usage of the createProject function
// const newProjectData = {
//   id: '2',
//   value: {
//     name: 'vaibhav contract',
//     proposer: 12123,
//     artist: 234324,
//     isCompleted: false,
//     ipfsHash: 'asfSDVSV123',
//   },
// };

// createProject(newProjectData)
//   .catch(error => console.error('Create project error:', error));

// Example usage of the updateProject function
// const updatedProjectData = {
//   id: '2',
//   value: {
//     name: 'vaibhav contract #2',
//     proposer: 12123,
//     artist: 234324,
//     isCompleted: false,
//     ipfsHash: 'asfSDVSV123',
//   },
// };

// updateProject('2', updatedProjectData)
//   .catch(error => console.error('Update project error:', error));

// Example usage of the getAllProjects function
// getAllProjects()
//   .catch(error => console.error('Get all projects error:', error));

// Example usage of the getProjectById function
// getProjectById('2')
//   .catch(error => console.error('Get project by ID error:', error));