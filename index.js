// ============================================================
// PARTY PLANNER
// This file builds the whole page using JavaScript.
// It is organized into 4 sections:
//   1. Setup (the API address)
//   2. State (the data the app remembers)
//   3. Functions that change state (they talk to the API)
//   4. Components (functions that build pieces of the page)
//   5. Render (puts everything on the screen)
// ============================================================

// ---------- 1. SETUP ----------

// TODO: Replace this with YOUR cohort code (ask your instructor if unsure).
// It looks something like "2510-FTB-ET-WEB-PT".
const COHORT = "2609-Emilie";
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const API = `${BASE}/${COHORT}`;

// ---------- 2. STATE ----------
// "State" is just the data our app is currently holding.
// Whenever any of these change, we redraw the page.

let parties = []; // the list of all parties
let selectedParty = null; // the one party the user clicked (null = none yet)
let guests = []; // every guest in the system
let rsvps = []; // every RSVP (which guest is going to which party)

// ---------- 3. FUNCTIONS THAT CHANGE STATE ----------
// Each one: asks the API for data, saves it into state, then calls render().
// Each one uses try...catch so an error doesn't crash the app.

/** Get the list of all parties from the API */
async function getParties() {
  try {
    const response = await fetch(`${API}/events`);
    const result = await response.json();
    parties = result.data; // the API puts the real data inside "data"
    render();
  } catch (error) {
    console.error("Could not load parties:", error);
  }
}

/** Get one party by its id (runs when a party name is clicked) */
async function getParty(id) {
  try {
    const response = await fetch(`${API}/events/${id}`);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (error) {
    console.error("Could not load that party:", error);
  }
}

/** Get every guest (extension) */
async function getGuests() {
  try {
    const response = await fetch(`${API}/guests`);
    const result = await response.json();
    guests = result.data;
    render();
  } catch (error) {
    console.error("Could not load guests:", error);
  }
}

/** Get every RSVP (extension) */
async function getRsvps() {
  try {
    const response = await fetch(`${API}/rsvps`);
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (error) {
    console.error("Could not load RSVPs:", error);
  }
}

// ---------- 4. COMPONENTS ----------
// A "component" is a function that builds and returns a piece of the page.

/** One clickable party name in the list */
function PartyListItem(party) {
  const li = document.createElement("li");
  li.textContent = party.name;

  // Extension: highlight the party that is currently selected
  if (selectedParty && selectedParty.id === party.id) {
    li.classList.add("selected");
  }

  // When clicked, fetch that party's details
  li.addEventListener("click", () => getParty(party.id));
  return li;
}

/** The whole list of party names */
function PartyList() {
  const ul = document.createElement("ul");
  ul.classList.add("party-list");
  // Turn each party into a list item and add it to the list
  const items = parties.map(PartyListItem);
  ul.replaceChildren(...items);
  return ul;
}

/** Extension: the guests who RSVP'd to the selected party */
function GuestList() {
  const ul = document.createElement("ul");

  // 1. Find RSVPs for this party
  const partyRsvps = rsvps.filter((rsvp) => rsvp.eventId === selectedParty.id);
  // 2. Collect the guest ids from those RSVPs
  const guestIds = partyRsvps.map((rsvp) => rsvp.guestId);
  // 3. Keep only guests whose id is in that list
  const partyGuests = guests.filter((guest) => guestIds.includes(guest.id));

  for (const guest of partyGuests) {
    const li = document.createElement("li");
    li.textContent = guest.name;
    ul.append(li);
  }
  return ul;
}

/** Details of the selected party, or a message if nothing is selected */
function PartyDetails() {
  const section = document.createElement("section");

  if (!selectedParty) {
    const p = document.createElement("p");
    p.textContent = "Please select a party to learn more.";
    section.append(p);
    return section;
  }

  // The date from the API looks like "2023-11-13T00:00:00.000Z".
  // .slice(0, 10) keeps just "2023-11-13".
  const date = selectedParty.date.slice(0, 10);

  // innerHTML lets us write a chunk of HTML as text
  section.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${date}">${date}</time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
  `;
  section.append(GuestList());
  return section;
}

// ---------- 5. RENDER ----------
// Builds the full page from the current state.
// Called every time state changes.

function render() {
  const app = document.querySelector("#app");
  app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>
      <section>
        <h2>Party Details</h2>
        <PartyDetails></PartyDetails>
      </section>
    </main>
  `;
  // Swap the placeholder tags above for the real components
  app.querySelector("PartyList").replaceWith(PartyList());
  app.querySelector("PartyDetails").replaceWith(PartyDetails());
}

// ---------- START THE APP ----------

async function init() {
  render(); // show the empty layout right away
  await getParties(); // then load the data
  await getGuests();
  await getRsvps();
}

init();
