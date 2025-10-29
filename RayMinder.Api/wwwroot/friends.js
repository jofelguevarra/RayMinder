const API_URL = "http://localhost:5007/api/friends";
const username = localStorage.getItem("username");

document.addEventListener("DOMContentLoaded", async () => {
  if (!username) {
    alert("You must be logged in first!");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("user-info").innerText = `Logged in as: ${username}`;

  document.getElementById("add-friend-btn").addEventListener("click", addFriend);

  await loadFriends();
});

async function loadFriends() {
  const response = await fetch(`${API_URL}/${username}`);
  if (!response.ok) {
    console.error("Failed to load friends");
    return;
  }

  const friends = await response.json();
  const list = document.getElementById("friends-list");
  list.innerHTML = "";

  if (friends.length === 0) {
    list.innerHTML = "<li>No friends yet.</li>";
    return;
  }

  friends.forEach(friend => {
    const li = document.createElement("li");
    li.textContent = friend;
    list.appendChild(li);
  });
}

async function addFriend() {
  const friendUsername = document.getElementById("friend-username").value.trim();
  if (!friendUsername) {
    alert("Please enter a username.");
    return;
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: username,
      friendUsername: friendUsername
    })
  });

  if (response.ok) {
    alert("Friend added!");
    document.getElementById("friend-username").value = "";
    await loadFriends();
  } else {
    alert("Failed to add friend.");
  }
}
