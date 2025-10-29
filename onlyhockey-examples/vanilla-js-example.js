/**
 * Vanilla JavaScript Examples for Tango Wisdom API
 * No framework required - works in any HTML page
 */

const API_BASE = "https://[YOUR-TANGO-DOMAIN]/api/public/wisdom";

// ============================================
// Example 1: Display Random Wisdom on Page Load
// ============================================

async function displayRandomWisdom() {
  try {
    const response = await fetch(`${API_BASE}/random`);
    const result = await response.json();

    if (result.success) {
      const wisdom = result.data;

      // Update DOM elements
      document.getElementById("wisdom-title").textContent = wisdom.title;
      document.getElementById("wisdom-musing").textContent = wisdom.musing;
      document.getElementById("wisdom-quote").textContent = wisdom.from_the_box;

      if (wisdom.theme) {
        document.getElementById("wisdom-theme").textContent = wisdom.theme;
      }

      if (wisdom.attribution) {
        document.getElementById("wisdom-attribution").textContent =
          wisdom.attribution;
      }
    } else {
      console.error("Failed to load wisdom:", result.error);
    }
  } catch (error) {
    console.error("Error fetching wisdom:", error);
  }
}

// Call on page load
displayRandomWisdom();

// ============================================
// Example 2: Load Latest 10 Wisdom Entries
// ============================================

async function displayLatestWisdom(limit = 10) {
  try {
    const response = await fetch(`${API_BASE}/latest?limit=${limit}`);
    const result = await response.json();

    if (result.success) {
      const container = document.getElementById("wisdom-list");
      container.innerHTML = ""; // Clear existing content

      result.data.forEach((wisdom) => {
        const card = createWisdomCard(wisdom);
        container.appendChild(card);
      });
    } else {
      console.error("Failed to load wisdom:", result.error);
    }
  } catch (error) {
    console.error("Error fetching wisdom:", error);
  }
}

// Helper function to create wisdom card HTML
function createWisdomCard(wisdom) {
  const article = document.createElement("article");
  article.className = "wisdom-card";

  article.innerHTML = `
    <h3>${wisdom.title}</h3>
    <p class="musing"><em>"${wisdom.musing}"</em></p>
    <blockquote class="quote">
      <strong>From the box:</strong> ${wisdom.from_the_box}
    </blockquote>
    <div class="meta">
      ${wisdom.theme ? `<span class="theme">${wisdom.theme}</span>` : ""}
      ${wisdom.attribution ? `<span class="attribution">${wisdom.attribution}</span>` : ""}
    </div>
  `;

  return article;
}

// ============================================
// Example 3: Filter by Theme
// ============================================

async function displayWisdomByTheme(theme) {
  try {
    const response = await fetch(
      `${API_BASE}?theme=${encodeURIComponent(theme)}&limit=50`,
    );
    const result = await response.json();

    if (result.success) {
      console.log(`Found ${result.count} wisdom entries for theme: ${theme}`);

      const container = document.getElementById("wisdom-list");
      container.innerHTML = "";

      result.data.forEach((wisdom) => {
        const card = createWisdomCard(wisdom);
        container.appendChild(card);
      });
    }
  } catch (error) {
    console.error("Error fetching wisdom:", error);
  }
}

// Usage: displayWisdomByTheme('Players');

// ============================================
// Example 4: Wisdom with Pagination
// ============================================

class WisdomPaginator {
  constructor(containerId, limit = 10) {
    this.container = document.getElementById(containerId);
    this.limit = limit;
    this.currentPage = 1;
  }

  async loadPage(page) {
    const offset = (page - 1) * this.limit;

    try {
      const response = await fetch(
        `${API_BASE}?limit=${this.limit}&offset=${offset}`,
      );
      const result = await response.json();

      if (result.success) {
        this.render(result.data);
        this.currentPage = page;
      }
    } catch (error) {
      console.error("Error loading page:", error);
    }
  }

  render(wisdomList) {
    this.container.innerHTML = "";

    wisdomList.forEach((wisdom) => {
      const card = createWisdomCard(wisdom);
      this.container.appendChild(card);
    });
  }

  nextPage() {
    this.loadPage(this.currentPage + 1);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1);
    }
  }
}

// Usage:
// const paginator = new WisdomPaginator('wisdom-list', 10);
// paginator.loadPage(1);

// ============================================
// Example 5: Refresh Random Wisdom on Click
// ============================================

document.getElementById("refresh-wisdom-btn")?.addEventListener("click", () => {
  displayRandomWisdom();
});

// ============================================
// Example 6: Error Handling
// ============================================

async function fetchWisdomSafely(endpoint) {
  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Unknown API error");
    }

    return result.data;
  } catch (error) {
    console.error("Failed to fetch wisdom:", error);
    // Show user-friendly error message
    document.getElementById("error-message").textContent =
      "Unable to load wisdom. Please try again later.";
    return null;
  }
}

// Usage:
// const wisdom = await fetchWisdomSafely(`${API_BASE}/random`);
