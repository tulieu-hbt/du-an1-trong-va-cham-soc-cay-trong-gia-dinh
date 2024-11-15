let model;
const URL = "model/";

const result = document.getElementById("result");
const captureButton = document.getElementById("captureButton");
const video = document.getElementById("camera");
const canvas = document.createElement("canvas");
const capturedImage = document.getElementById("capturedImage");
const preservationInfo = document.getElementById("preservationInfo");
const plantingPlanContainer = document.getElementById("plantingPlanContainer");
const marketInfoContainer = document.getElementById("marketInfoContainer");
const introContainer = document.getElementById("introductionContainer");

// Khởi tạo camera
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false
        });
        video.srcObject = stream;
        return new Promise(resolve => {
            video.onloadedmetadata = () => resolve(video);
        });
    } catch (error) {
        console.error("Lỗi khi khởi tạo camera:", error);
        result.innerText = "Không thể sử dụng camera!";
    }
}

// Tải mô hình TensorFlow
async function loadModel() {
    const modelURL = `${URL}model.json`;
    try {
        model = await tf.loadLayersModel(modelURL);
        result.innerText = "Mô hình đã sẵn sàng. Hãy đưa nông sản vào camera.";
    } catch (error) {
        console.error("Lỗi khi tải mô hình:", error);
        result.innerText = "Không thể tải mô hình!";
    }
}

// Chụp ảnh từ video camera
function captureImage() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    capturedImage.src = canvas.toDataURL("image/png");
}

// Tải nội dung file JSON
async function loadPreservationTexts() {
    try {
        const response = await fetch('https://tulieu-hbt.github.io/du-an1-trong-va-cham-soc-cay-trong-gia-dinh/preservationTexts.json'); // Đường dẫn tới file JSON
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Lỗi khi tải nội dung JSON:", error);
        return {};
    }
}


// Dự đoán nông sản
async function predict() {
    if (!model) return;

    captureImage();
    const image = tf.browser.fromPixels(canvas);
    const resizedImage = tf.image.resizeBilinear(image, [224, 224]);
    const normalizedImage = resizedImage.div(255.0);
    const inputTensor = tf.expandDims(normalizedImage, 0);

    const predictions = await model.predict(inputTensor).data();
    const classLabels = ["cà chua", "trái bầu", "trái mướp", "hành lá", "dưa leo", "đậu bắp"];
    const maxProbability = Math.max(...predictions);
    const predictedClass = classLabels[predictions.indexOf(maxProbability)];
    // Xác suất nhận diện
    if (maxProbability < 0.7) {
        result.innerText = "Không nhận diện được nông sản.";
        speak("Không nhận diện được nông sản.");
        preservationInfo.innerText = "";
        introContainer.innerHTML = "";
        plantingPlanContainer.innerHTML = "";
        marketInfoContainer.innerHTML = "";
        return;
    }

    const preservationTexts = await loadPreservationTexts();
    result.innerText = `Kết quả: ${predictedClass} (Xác suất: ${maxProbability.toFixed(2)})`;
    const info = preservationTexts[predictedClass];
    preservationInfo.innerHTML = `<div class="introduction">
        <h3>${predictedClass}</h3>
        <p>${info.replace(/\n/g, '<br>')}</p>
    </div>`;
    speak(info);
    // Hiển thị dữ liệu kế hoạch trồng cây và chi phí
    await fetchAndDisplayPlanData(predictedClass, introContainer, plantingPlanContainer, marketInfoContainer);
}

// Hàm Text-to-Speech
function speak(text) {
    if ('speechSynthesis' in window) {
        const synthesis = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);

        utterance.lang = 'vi-VN';
        synthesis.speak(utterance);
    }
}

// Khởi tạo
async function init() {
    await loadModel();
    await setupCamera();
    preservationTexts = await loadPreservationTexts();
}

// Chạy khi trang đã tải
document.addEventListener("DOMContentLoaded", async () => {
    await init();
    captureButton.addEventListener("click", predict);
});
