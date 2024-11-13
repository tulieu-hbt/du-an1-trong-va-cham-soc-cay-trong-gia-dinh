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
    "cà chua": "Cà chua là một loại thực phẩm không chỉ ngon miệng mà còn rất giàu dinh dưỡng, mang lại nhiều lợi ích cho sức khỏe. \
                Cà chua chứa nhiều vitamin C, vitamin K, kali, và folate, rất tốt cho sức khỏe. \
                Đặc biệt, cà chua là nguồn cung cấp dồi dào chất chống oxy hóa lycopene, giúp giảm nguy cơ mắc các bệnh tim mạch và ung thư. \
                Hàm lượng nước và chất xơ trong cà chua cũng giúp cải thiện tiêu hóa, duy trì độ ẩm cho da và hỗ trợ quá trình giảm cân. \
                Bên cạnh đó, cà chua còn có tác dụng làm đẹp da, làm chậm quá trình lão hóa và tăng cường hệ miễn dịch. \
                Bạn có thể tham khảo về cách trồng cà chua để bổ sung bữa cơm gia đình ... ",
    "trái bầu": " Trái bầu có tên khoa học là Lagenaria siceraria. Giá trị dinh dưỡng: Trái bầu chứa nhiều nước, chất xơ và các vitamin cần thiết như: \
                  Vitamin C: Giúp tăng cường hệ miễn dịch. Vitamin B: Quan trọng cho hệ thần kinh và chức năng trao đổi chất. Kali: Giúp điều hòa huyết áp. \
                  Ẩm thực: Trái bầu thường được sử dụng trong nhiều món ăn, từ canh, xào, đến món hầm. Nó có hương vị nhẹ nhàng, thanh mát, rất phù hợp cho \
                  các món ăn mùa hè. Dược liệu: Bầu có tính mát, giúp giải nhiệt, thanh lọc cơ thể. Nước ép từ bầu cũng được cho là có tác dụng làm mát gan \
                  và hỗ trợ tiêu hóa. Vỏ trái bầu sau khi khô có thể được sử dụng để làm đồ dùng gia đình như bình đựng nước, hộp đựng, hoặc trang trí... ",
    "trái mướp": "Trái mướp, còn được gọi là mướp hương hay mướp gối. Tên khoa học: Luffa cylindrica (cho mướp hương) và Luffa acutangula (cho mướp gối). \
                  Trái mướp chứa nhiều dưỡng chất cần thiết như: Vitamin C: Giúp tăng cường hệ miễn dịch. Vitamin B: Quan trọng cho hệ thần kinh và chức năng \
                  trao đổi chất. Chất xơ: Giúp cải thiện tiêu hóa và duy trì sức khỏe đường ruột. Trái mướp thường được sử dụng trong nhiều món ăn, từ canh mướp, \
                  xào mướp, đến nấu lẩu. Mướp có vị ngọt thanh, mát, rất thích hợp cho các món ăn mùa hè. Dược liệu: Mướp có tính mát, giúp giải nhiệt, thanh lọc cơ thể. \
                  Nước ép từ mướp cũng được cho là có tác dụng làm mát gan và hỗ trợ tiêu hóa. Vỏ trái mướp sau khi khô có thể được sử dụng để làm xơ mướp, một loại \
                  vật liệu thiên nhiên dùng để cọ rửa hoặc tắm."
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
