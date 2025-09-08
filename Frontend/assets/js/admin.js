
    document.getElementById("loginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      try {
        const res = await fetch("http://localhost:5000/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (res.ok) {
          alert("✅ Login successful!");
          window.location.href = "admin-dashboard.html"; // Redirect to dashboard
        } else {
          document.getElementById("errorMsg").innerText = data.message;
        }
      } catch (err) {
        document.getElementById("errorMsg").innerText = "Server error!";
      }
    })