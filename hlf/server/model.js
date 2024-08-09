const { getActorConnection } = require("./lib/hyperledger");

async function createProject(id, value) {
  let contract = await getActorConnection();
  try {
    await contract.submitTransaction(
      "createProject",
      id,
      JSON.stringify(Object.assign(value, { id: id }))
    );
    return `Asset ${id} was successfully created!`;
  } catch (error) {
    throw error;
  }
}

async function updateProject(id, value) {
  let contract = await getActorConnection();
  try {
    await contract.submitTransaction(
      "updateProject",
      id,
      JSON.stringify(Object.assign(value, { id: id }))
    );
    return `Asset ${id} was successfully updated!`;
  } catch (error) {
    throw error;
  }
}

async function readProject(id) {
  let contract = await getActorConnection();
  try {
    const projectBuffer = await contract.evaluateTransaction("readProject", id);
    const project = parseBuffer(projectBuffer);
    return project.value;
  } catch (error) {
    throw error;
  }
}

async function deleteProject(id) {
  let contract = await getActorConnection();
  try {
    await contract.submitTransaction("deleteProject", id);
    return `Asset ${id} was successfully deleted!`;
  } catch (error) {
    throw error;
  }
}

function parseBuffer(projectBuffer) {
  const decoder = new TextDecoder("utf-8");
  const decodedStr = decoder.decode(projectBuffer);
  return JSON.parse(decodedStr);
}

async function getAllProjects() {
  let contract = await getActorConnection();
  try {
    const projectsBuffer = await contract.submitTransaction("getAllProjects");
    const projects = parseBuffer(projectsBuffer);
    return projects.map((project) => {
      return JSON.parse(project.value);
    });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createProject,
  updateProject,
  readProject,
  deleteProject,
  getAllProjects,
};
