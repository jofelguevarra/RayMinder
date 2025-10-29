console.log("friends.js loaded");

const API_URL = "http://localhost:5007/api/friends";
const username = localStorage.getItem("username");

const messageDiv = document.getElementById("user-info");
const friendInput = document.getElementById("friend-username");
const friendsList = document.getElementById("friends-list");
const addBtn = document.getElementById("add-friend-btn");

async function loadFriends() {
  try {
    const response = await fetch(`${API_URL}/${username}`);
    const friends = await response.json();
    friendsList.innerHTML = "";

    if (friends.length === 0) {
      friendsList.innerHTML = "<li>No friends yet.</li>";
      return;
    }

    friends.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.friendUsername;
      friendsList.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading friends:", err);
  }
}

addBtn.addEventListener("click", async () => {
  const friendUsername = friendInput.value.trim();
  if (!friendUsername) return;

  const data = { username, friendUsername };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      messageDiv.textContent = "Friend added!";
      messageDiv.style.color = "green";
      friendInput.value = "";
      loadFriends();
    } else {
      const err = await response.json();
      messageDiv.textContent = err.message || "Failed to add friend.";
      messageDiv.style.color = "red";
    }
  } catch (err) {
    console.error("Error adding friend:", err);
  }
});

window.addEventListener("load", loadFriends);
