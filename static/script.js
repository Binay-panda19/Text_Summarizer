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

const summaryLength = document.getElementById("summaryLength");

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
   CLEAR
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
   SUMMARIZE
========================= */

summarizeBtn.addEventListener("click", summarizeText);

async function summarizeText() {
  const text = inputText.value.trim();

  /* Empty input */

  if (!text) {
    alert("Please enter some content first.");

    return;
  }

  /* Loading state */

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

  /*
        ==========================================
        BACKEND API
        ==========================================

        Replace the demo section below with:

        const response = await fetch(
            "http://localhost:5000/api/summarize",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    text: text,
                    length:
                        summaryLength.value
                })
            }
        );

        const data = await response.json();

        const summary = data.summary;
    */

  /* Demo delay */

  await new Promise((resolve) => {
    setTimeout(resolve, 1200);
  });

  /* =========================
       DEMO SUMMARY
    ========================= */

  const sentences = text
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

  let numberOfSentences;

  switch (summaryLength.value) {
    case "short":
      numberOfSentences = 2;

      break;

    case "long":
      numberOfSentences = 5;

      break;

    default:
      numberOfSentences = 3;
  }

  const selectedSentences = sentences.slice(0, numberOfSentences);

  /* =========================
       CREATE SUMMARY POINTS
    ========================= */

  if (selectedSentences.length === 0) {
    summaryBox.innerHTML = `

            <div class="empty-state">

                <strong>
                    Unable to create summary
                </strong>

                <p>
                    Please provide more content.
                </p>

            </div>

        `;
  } else {
    summaryBox.innerHTML = `

            <div class="summary-content">

                ${selectedSentences
                  .map(
                    (sentence) => `

                        <div class="summary-point">

                            <p>
                                ${sentence}.
                            </p>

                        </div>

                    `,
                  )
                  .join("")}

            </div>

        `;
  }

  /* =========================
       SUMMARY INFO
    ========================= */

  const summaryText = selectedSentences.join(". ");

  const summaryWordCount = summaryText.split(/\s+/).filter(Boolean).length;

  summaryInfo.textContent = `${summaryWordCount} words summarized`;

  /* Reset button */

  summarizeBtn.disabled = false;

  summarizeBtn.textContent = "Summarize";
}

/* =========================
   COPY SUMMARY
========================= */

copyBtn.addEventListener("click", async () => {
  const text = summaryBox.innerText.trim();

  if (!text || text === "No summary yet") {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);

    copyBtn.textContent = "Copied!";

    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 1500);
  } catch (error) {
    console.error("Copy failed:", error);
  }
});
