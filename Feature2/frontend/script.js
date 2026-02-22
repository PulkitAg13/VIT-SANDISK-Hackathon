async function submitForm() {

    const fileInput = document.getElementById("fileInput");
    const questionInput = document.getElementById("questionInput");
    const resultDiv = document.getElementById("result");
    const answerText = document.getElementById("answerText");
    const loader = document.getElementById("loader");

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
    formData.append("question", questionInput.value);

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

        answerText.innerText = data.answer;

    } catch (error) {
        loader.classList.add("hidden");
        alert("Something went wrong");
        console.error(error);
    }
}