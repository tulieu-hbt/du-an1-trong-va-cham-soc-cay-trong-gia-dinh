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

const preservationTexts = {
    "thanh long": "Bảo quản thanh long ở nơi thoáng mát...",
    "chuối": "Chuối nên được bảo quản ở nhiệt độ phòng sau khi thu hoạch. Bạn có thể tham khảo về cách trồng chuối ...",
    "cà chua": "Cà chua là một loại thực phẩm không chỉ ngon miệng mà còn rất giàu dinh dưỡng, mang lại nhiều lợi ích cho sức khỏe. \
                Cà chua chứa nhiều vitamin C, vitamin K, kali, và folate, rất tốt cho sức khỏe. \
                Đặc biệt, cà chua là nguồn cung cấp dồi dào chất chống oxy hóa lycopene, giúp giảm nguy cơ mắc các bệnh tim mạch và ung thư. \
                Hàm lượng nước và chất xơ trong cà chua cũng giúp cải thiện tiêu hóa, duy trì độ ẩm cho da và hỗ trợ quá trình giảm cân. \
                Bên cạnh đó, cà chua còn có tác dụng làm đẹp da, làm chậm quá trình lão hóa và tăng cường hệ miễn dịch. \
                Bạn có thể tham khảo về cách trồng cà chua để bổ sung bữa cơm gia đình ... ",
    "nho": "Nho nên được bảo quản trong tủ lạnh...",
    "chanh": "Chanh nên được bảo quản ở nhiệt độ phòng..."
};

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

// Dự đoán nông sản
async function predict() {
    if (!model) return;

    captureImage();
    const image = tf.browser.fromPixels(canvas);
    const resizedImage = tf.image.resizeBilinear(image, [224, 224]);
    const normalizedImage = resizedImage.div(255.0);
    const inputTensor = tf.expandDims(normalizedImage, 0);

    const predictions = await model.predict(inputTensor).data();
    const classLabels = ["thanh long", "chuối", "cà chua", "nho", "chanh"];
    const maxProbability = Math.max(...predictions);
    const predictedClass = classLabels[predictions.indexOf(maxProbability)];

    if (maxProbability < 0.7) {
        result.innerText = "Không nhận diện được nông sản.";
        speak("Không nhận diện được nông sản.");
        preservationInfo.innerText = "";
        introContainer.innerHTML = "";
        plantingPlanContainer.innerHTML = "";
        marketInfoContainer.innerHTML = "";
        return;
    }

    result.innerText = `Kết quả: ${predictedClass}`;
    preservationInfo.innerHTML = `<div class="introduction">
        <h3>${predictedClass}</h3>
        <p>${preservationTexts[predictedClass]}</p>
    </div>`;
    speak(preservationTexts[predictedClass]);

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
}

// Chạy khi trang đã tải
document.addEventListener("DOMContentLoaded", async () => {
    await init();
    captureButton.addEventListener("click", predict);
});
