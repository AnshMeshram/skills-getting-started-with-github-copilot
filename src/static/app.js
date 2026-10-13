document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  function showMessage(message, messageClass) {
    messageDiv.textContent = message;
    messageDiv.className = messageClass;
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  async function unregisterParticipant(activityName, email) {
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/participants/${encodeURIComponent(email)}`,
        { method: "DELETE" }
      );
      const result = await response.json();

      if (!response.ok) {
        showMessage(result.detail || "Failed to unregister student", "error");
        return;
      }

      await fetchActivities();
      showMessage(result.message, "success");
    } catch (error) {
      showMessage("Failed to unregister student. Please try again.", "error");
      console.error("Error unregistering participant:", error);
    }
  }

  function createActivityCard(name, details) {
    const activityCard = document.createElement("div");
    activityCard.className = "activity-card";

    const spotsLeft = details.max_participants - details.participants.length;
    activityCard.innerHTML = `
      <h4>${name}</h4>
      <p>${details.description}</p>
      <p><strong>Schedule:</strong> ${details.schedule}</p>
      <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
      <div class="participants-section">
        <h5>Registered participants</h5>
      </div>
    `;

    const participantList = document.createElement("ul");
    participantList.className = "participants-list";

    details.participants.forEach((email) => {
      const participantItem = document.createElement("li");
      participantItem.className = "participant-item";

      const participantEmail = document.createElement("span");
      participantEmail.textContent = email;

      const unregisterButton = document.createElement("button");
      unregisterButton.type = "button";
      unregisterButton.className = "unregister-button";
      unregisterButton.setAttribute("aria-label", `Unregister ${email}`);
      unregisterButton.title = `Unregister ${email}`;
      unregisterButton.innerHTML = "&#215;";
      unregisterButton.addEventListener("click", () => {
        unregisterParticipant(name, email);
      });

      participantItem.append(participantEmail, unregisterButton);
      participantList.appendChild(participantItem);
    });

    activityCard.querySelector(".participants-section").appendChild(participantList);
    return activityCard;
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        activitiesList.appendChild(createActivityCard(name, details));

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        signupForm.reset();
        await fetchActivities();
        showMessage(result.message, "success");
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
