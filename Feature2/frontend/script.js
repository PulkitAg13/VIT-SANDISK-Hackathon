async function submitForm() {

    const fileInput = document.getElementById("fileInput");
    const questionInput = document.getElementById("questionInput");
    const resultDiv = document.getElementById("result");
    const answerText = document.getElementById("answerText");
    const loader = document.getElementById("loader");
    const apiKey = localStorage.getItem("sandisk_api_key");

    if (!fileInput.files[0]) {
        alert("Please upload a file");
        return;
    }

    if (!questionInput.value) {
        alert("Please enter a question");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    const analysisPrompt = buildAnalysisPrompt(
        fileInput.files[0].name,
        questionInput.value
    );
    formData.append("question", analysisPrompt);
    if (apiKey) {
        formData.append("api_key", apiKey);
    }

    loader.classList.remove("hidden");
    resultDiv.classList.add("hidden");

    try {
        const response = await fetch(
            "http://127.0.0.1:8000/upload-and-ask",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        loader.classList.add("hidden");
        resultDiv.classList.remove("hidden");

        // Render markdown to HTML
        answerText.innerHTML = renderMarkdown(data.answer);

        // wire copy/download buttons
        const copyBtn = document.getElementById("copyResponse");
        const dlBtn = document.getElementById("downloadResponse");
        if (copyBtn) copyBtn.onclick = () => copyResponse(data.answer);
        if (dlBtn) dlBtn.onclick = () => downloadResponse(data.answer);

        saveRecentFile(fileInput.files[0].name);
        saveHistoryItem({
            fileName: fileInput.files[0].name,
            question: questionInput.value,
            answer: data.answer
        });

    } catch (error) {
        loader.classList.add("hidden");
        alert("Something went wrong");
        console.error(error);
    }
}

function buildAnalysisPrompt(fileName, userQuestion) {
    return `You are a SanDisk Personal Memory Assistant. Analyze the uploaded file and respond with a concise, specific summary that helps a user who does not remember what the file is. Avoid generic statements. Use this exact format with headings and bullet points:

## File Snapshot
- File name: ${fileName}
- Primary purpose: (one sentence)
- Key entities or topics: (3-6 items)

## Why it exists
- Origin or context: (who/what created it and why)
- Intended audience: (who uses it)

## What to do with it
- Keep/Delete/Archive recommendation: (one word)
- Reason: (1-2 sentences tied to file content)
- Next action: (a concrete action, not generic)

## Quick takeaway
(2-3 sentences; mention specific details from the file)

User question: ${userQuestion}`;
}

// Minimal markdown renderer (supports headings, bold, italic, lists, code)
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function renderMarkdown(md) {
    if (!md) return "";
    const lines = md.split(/\r?\n/);
    let inCode = false;
    let codeBuffer = [];
    let listMode = null; // 'ul'
    let out = [];

    function flushCode() {
        if (codeBuffer.length === 0) return;
        out.push('<pre><code>' + escapeHtml(codeBuffer.join('\n')) + '</code></pre>');
        codeBuffer = [];
    }

    function closeList() {
        if (listMode) {
            out.push('</ul>');
            listMode = null;
        }
    }

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.startsWith('```')) {
            if (inCode) {
                // closing
                inCode = false;
                flushCode();
            } else {
                inCode = true;
            }
            continue;
        }
        if (inCode) {
            codeBuffer.push(line);
            continue;
        }

        // headings
        let hMatch = line.match(/^#{1,3}\s+(.*)/);
        if (hMatch) {
            closeList();
            flushCode();
            const level = line.match(/^#{1,3}/)[0].length;
            const content = inlineFormats(hMatch[1]);
            out.push(`<h${level}>${content}</h${level}>`);
            continue;
        }

        // unordered list
        let ulMatch = line.match(/^[-*]\s+(.*)/);
        if (ulMatch) {
            flushCode();
            if (!listMode) {
                listMode = 'ul';
                out.push('<ul>');
            }
            out.push('<li>' + inlineFormats(ulMatch[1]) + '</li>');
            continue;
        }

        // blank line
        if (line.trim() === '') {
            closeList();
            flushCode();
            out.push('<p></p>');
            continue;
        }

        // paragraph
        closeList();
        flushCode();
        out.push('<p>' + inlineFormats(line) + '</p>');
    }

    // finalize
    if (inCode) flushCode();
    closeList();

    return '<div class="md-content">' + out.join('\n') + '</div>';
}

function inlineFormats(text) {
    if (!text) return '';
    // escape first
    let s = escapeHtml(text);
    // links: [text](url)
    s = s.replace(/\[(.+?)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
    // bold **text**
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // italic *text*
    s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // inline code `code`
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    return s;
}

function copyResponse(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        alert('Response copied to clipboard');
    }).catch(() => {
        alert('Unable to copy');
    });
}

function downloadResponse(text) {
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'response.md';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function clearForm() {
    const fileInput = document.getElementById("fileInput");
    const questionInput = document.getElementById("questionInput");
    const resultDiv = document.getElementById("result");
    const answerText = document.getElementById("answerText");

    fileInput.value = "";
    questionInput.value = "";
    answerText.innerText = "";
    resultDiv.classList.add("hidden");
}

function saveApiKey() {
    const apiKeyInput = document.getElementById("apiKeyInput");
    if (!apiKeyInput.value.trim()) {
        alert("Please enter a valid API key");
        return;
    }
    localStorage.setItem("sandisk_api_key", apiKeyInput.value.trim());
    alert("API key saved locally");
    apiKeyInput.value = "";
}

function clearApiKey() {
    localStorage.removeItem("sandisk_api_key");
    alert("API key removed");
}

function initViews() {
    const navItems = document.querySelectorAll(".nav-item");
    const views = document.querySelectorAll(".view");

    navItems.forEach((item) => {
        item.addEventListener("click", () => {
            const target = item.getAttribute("data-view");
            navItems.forEach((nav) => nav.classList.remove("active"));
            item.classList.add("active");
            views.forEach((view) => {
                view.classList.toggle("active", view.id === `view-${target}`);
            });
        });
    });
}

function loadRecentFiles() {
    const raw = localStorage.getItem("sandisk_recent_files");
    return raw ? JSON.parse(raw) : [];
}

function loadHistory() {
    const raw = localStorage.getItem("sandisk_history");
    return raw ? JSON.parse(raw) : [];
}

function saveRecentFile(fileName) {
    const existing = loadRecentFiles().filter((name) => name !== fileName);
    const updated = [fileName, ...existing].slice(0, 10);
    localStorage.setItem("sandisk_recent_files", JSON.stringify(updated));
    renderRecentFiles();
}

function saveHistoryItem(entry) {
    const history = loadHistory();
    const updated = [
        {
            ...entry,
            timestamp: new Date().toISOString()
        },
        ...history
    ].slice(0, 20);
    localStorage.setItem("sandisk_history", JSON.stringify(updated));
    renderHistory();
}

function renderRecentFiles() {
    const list = document.getElementById("recentList");
    const empty = document.getElementById("recentEmpty");
    if (!list || !empty) return;
    const recent = loadRecentFiles();
    list.innerHTML = "";
    if (recent.length === 0) {
        empty.classList.remove("hidden");
        return;
    }
    empty.classList.add("hidden");
    recent.forEach((name) => {
        const item = document.createElement("div");
        item.className = "list-item";
        item.innerHTML = `
            <div class="list-title"><i class="fa-solid fa-file"></i> ${name}</div>
            <div class="list-meta">Stored locally</div>
        `;
        list.appendChild(item);
    });
}

function renderHistory() {
    const list = document.getElementById("historyList");
    const empty = document.getElementById("historyEmpty");
    if (!list || !empty) return;
    const history = loadHistory();
    list.innerHTML = "";
    if (history.length === 0) {
        empty.classList.remove("hidden");
        return;
    }
    empty.classList.add("hidden");
    history.forEach((entry) => {
        const item = document.createElement("div");
        item.className = "list-item";
        const time = new Date(entry.timestamp).toLocaleString();
        item.innerHTML = `
            <div class="list-title"><i class="fa-solid fa-file"></i> ${entry.fileName}</div>
            <div class="list-meta">${time}</div>
            <div class="list-text"><strong>Q:</strong> ${entry.question}</div>
            <div class="list-text"><strong>A:</strong> ${entry.answer}</div>
        `;
        list.appendChild(item);
    });
}

function clearRecent() {
    localStorage.removeItem("sandisk_recent_files");
    renderRecentFiles();
}

function clearHistory() {
    localStorage.removeItem("sandisk_history");
    renderHistory();
}

document.addEventListener("DOMContentLoaded", () => {
    initViews();
    renderRecentFiles();
    renderHistory();
});