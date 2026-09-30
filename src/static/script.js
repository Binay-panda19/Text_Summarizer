/* =========================
   ELEMENTS
========================= */

const inputText = document.getElementById("inputText");

const wordCount = document.getElementById("wordCount");
const charCount = document.getElementById("charCount");

const summarizeBtn = document.getElementById("summarizeBtn");

const clearBtn = document.getElementById("clearBtn");

const copyBtn = document.getElementById("copyBtn");

const summaryBox = document.getElementById("summaryBox");

const summaryInfo = document.getElementById("summaryInfo");

/* =========================
   WORD / CHARACTER COUNT
========================= */

inputText.addEventListener("input", () => {
  const text = inputText.value.trim();

  const words = text.length > 0 ? text.split(/\s+/).length : 0;

  wordCount.textContent = words;

  charCount.textContent = inputText.value.length;
});

/* =========================
   CLEAR BUTTON
========================= */

clearBtn.addEventListener("click", () => {
  inputText.value = "";

  wordCount.textContent = "0";
  charCount.textContent = "0";

  summaryBox.innerHTML = `
        <div class="empty-state">

            <div class="empty-icon">
                ✦
            </div>

            <strong>
                No summary yet
            </strong>

            <p>
                Your generated summary will appear here.
            </p>

        </div>
    `;

  summaryInfo.textContent = "Waiting for content...";
});

/* =========================
   SUMMARIZE BUTTON
========================= */

summarizeBtn.addEventListener("click", summarizeText);

async function summarizeText() {
  const dialogue = inputText.value.trim();

  /* =========================
       VALIDATE INPUT
    ========================= */

  if (!dialogue) {
    alert("Please enter some content first.");

    return;
  }

  /* =========================
       LOADING STATE
    ========================= */

  summarizeBtn.disabled = true;

  summarizeBtn.textContent = "Summarizing...";

  summaryInfo.textContent = "Generating summary...";

  summaryBox.innerHTML = `
        <div class="loader">

            <span></span>
            <span></span>
            <span></span>

        </div>
    `;

  try {
    /* =========================
           SEND REQUEST TO FASTAPI
        ========================= */

    const response = await fetch("/summarize/", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        dialogue: dialogue,
      }),
    });

    /* =========================
           CHECK RESPONSE
        ========================= */

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    /* =========================
           GET SUMMARY
        ========================= */

    const summary = data.summary;

    if (!summary) {
      throw new Error("No summary returned from server.");
    }

    /* =========================
           DISPLAY SUMMARY
        ========================= */

    summaryBox.innerHTML = `
            <div class="summary-content">

                <div class="summary-point">

                    <p>
                        ${summary}
                    </p>

                </div>

            </div>
        `;

    /* =========================
           SUMMARY INFO
        ========================= */

    const summaryWords = summary.trim().split(/\s+/).filter(Boolean).length;

    summaryInfo.textContent = `${summaryWords} words summarized`;
  } catch (error) {
    console.error("Summarization error:", error);

    /* =========================
           ERROR UI
        ========================= */

    summaryBox.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    !
                </div>

                <strong>
                    Something went wrong
                </strong>

                <p>
                    Unable to generate the summary.
                    Please make sure the FastAPI
                    server is running.
                </p>

            </div>
        `;

    summaryInfo.textContent = "Summarization failed.";
  }

  /* =========================
       RESET BUTTON
    ========================= */

  summarizeBtn.disabled = false;

  summarizeBtn.textContent = "Summarize";
}

/* =========================
   COPY SUMMARY
========================= */

copyBtn.addEventListener("click", async () => {
  const summary = summaryBox.innerText.trim();

  if (!summary || summary === "No summary yet") {
    return;
  }

  try {
    await navigator.clipboard.writeText(summary);

    copyBtn.textContent = "Copied!";

    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 1500);
  } catch (error) {
    console.error("Copy failed:", error);
  }
});
