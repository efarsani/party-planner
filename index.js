const COHORT = "2609-Emilie";
const API_URL = `https://fsa-crud-2aa9294fe819.herokuapp.com/api/${COHORT}`;

const app = document.querySelector("#app");

const state = {
  parties: [],
  selectedParty: null,
  error: "",
};

async function fetchData(path) {
  const response = await fetch(`${API_URL}${path}`);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error?.message || "The API request failed.");
  }

  return result.data;
}

async function loadParties() {
  try {
    state.parties = await fetchData("/events");
    state.error = "";
  } catch (error) {
    console.error(error);
    state.error = "Could not load the party list.";
  }

  render();
}

let latestSelection = 0;

async function selectParty(id) {
  const selection = ++latestSelection;

  try {
    const party = await fetchData(`/events/${id}`);

    if (selection !== latestSelection) return;

    state.selectedParty = party;
    state.error = "";
  } catch (error) {
    console.error(error);

    if (selection !== latestSelection) return;

    state.error = "Could not load that party's details.";
  }

  render();
}

function PartyList() {
  const section = document.createElement("section");

  const heading = document.createElement("h2");
  heading.textContent = "Upcoming Parties";

  const list = document.createElement("ul");

  for (const party of state.parties) {
    const item = document.createElement("li");
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = party.name;
    button.addEventListener("click", () => selectParty(party.id));

    item.append(button);
    list.append(item);
  }

  section.append(heading, list);
  return section;
}

function PartyDetails() {
  const section = document.createElement("section");

  const heading = document.createElement("h2");
  heading.textContent = "Party Details";
  section.append(heading);

  const party = state.selectedParty;

  if (!party) {
    const message = document.createElement("p");
    message.textContent = "Please select a party to see its details.";
    section.append(message);
    return section;
  }

  const name = document.createElement("h3");
  name.textContent = `${party.name} #${party.id}`;

  const date = document.createElement("p");
  date.textContent = party.date.slice(0, 10);

  const location = document.createElement("address");
  location.textContent = party.location;

  const description = document.createElement("p");
  description.textContent = party.description;

  section.append(name, date, location, description);
  return section;
}

function render() {
  const title = document.createElement("h1");
  title.textContent = "Party Planner";

  const main = document.createElement("main");
  main.append(PartyList(), PartyDetails());

  app.replaceChildren(title, main);

  if (state.error) {
    const message = document.createElement("p");
    message.textContent = state.error;
    message.setAttribute("role", "alert");
    app.append(message);
  }
}

render();
loadParties();
