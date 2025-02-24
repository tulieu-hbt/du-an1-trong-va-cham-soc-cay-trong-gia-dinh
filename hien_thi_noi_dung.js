// Hàm tải dữ liệu từ file JSON
async function loadExcelData() {
    const url = 'https://tulieu-hbt.github.io/du-an1-trong-va-cham-soc-cay-trong-gia-dinh/assets/bang_ke_hoach.json'; // Đảm bảo URL đúng
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Dữ liệu từ file JSON:", data);
        return data;
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu từ file JSON:", error);
        return []; // Trả về mảng rỗng khi gặp lỗi
    }
}

// Hàm hiển thị thông tin giới thiệu cây trồng
function displayIntroduction(gioiThieu, container) {
    if (!gioiThieu || typeof gioiThieu !== "object") {
        console.error("Không có thông tin giới thiệu hợp lệ.");
        container.innerHTML = "<p>Không có thông tin giới thiệu.</p>";
        return;
    }

    const introHTML = `
        <h3>Giới thiệu về cây trồng</h3>
        <p><strong>Giống cây:</strong> ${gioiThieu.giongCay || "Chưa có thông tin"}</p>
        <p><strong>Phương thức trồng:</strong> ${gioiThieu.phuongThucTrong || "Chưa có thông tin"}</p>
        <p><strong>Diện tích & Số lượng:</strong> ${gioiThieu.dienTichSoLuong || "Chưa có thông tin"}</p>
        <p><strong>Điều kiện sinh trưởng:</strong> ${gioiThieu.dieuKienSinhTruong || "Chưa có thông tin"}</p>
    `;
    container.innerHTML = introHTML;
}

// Hàm hiển thị kế hoạch trồng cây và chi phí
async function fetchAndDisplayPlanData(nongsan, introContainer, plantingContainer, costContainer) {
    const data = await loadExcelData();
    const selectedData = data.find(item => item.nongsan === nongsan);

    if (selectedData) {
        // Hiển thị từng phần dựa trên dữ liệu từ JSON
        displayIntroduction(selectedData.gioiThieu, introContainer);
        displayPlantingPlan(selectedData.plantingPlan, plantingContainer);
        displayCostEstimate(selectedData.costEstimate, costContainer);
    } else {
        // Khi không có dữ liệu phù hợp
        introContainer.innerHTML = "<p>Không có dữ liệu giới thiệu.</p>";
        plantingContainer.innerHTML = "<p>Không có dữ liệu cho kế hoạch trồng cây.</p>";
        costContainer.innerHTML = "<p>Không có dữ liệu cho chi phí trồng cây.</p>";
    }
}

// Hàm hiển thị kế hoạch trồng cây
function displayPlantingPlan(plantingPlan, container) {
    if (!Array.isArray(plantingPlan)) {
        console.error("Dữ liệu kế hoạch trồng cây không hợp lệ.");
        container.innerHTML = "<p>Không có dữ liệu kế hoạch trồng cây hợp lệ.</p>";
        return;
    }

    let tasksHTML = `
        <h3>Kế hoạch trồng và chăm sóc cây trồng</h3>
        <table>
            <tr>
                <th>STT</th>
                <th>Công việc cần làm</th>
                <th>Thời gian thực hiện</th>
                <th>Vật liệu, dụng cụ cần thiết</th>
                <th>Ghi chú</th>
            </tr>
    `;

    plantingPlan.forEach(task => {
        tasksHTML += `
            <tr>
                <td>${task.STT || ""}</td>
                <td>${task['Cong Viec Can Lam'] || ""}</td>
                <td>${task['Thoi Gian Thuc Hien'] || ""}</td>
                <td>${task['Vat Lieu, Dung Cu Can Thiet'] || ""}</td>
                <td>${task['Ghi Chu'] || ""}</td>
            </tr>
        `;
    });

    tasksHTML += "</table>";
    container.innerHTML = tasksHTML;
}

// Hàm hiển thị chi phí trồng cây
function displayCostEstimate(costEstimate, container) {
    if (!Array.isArray(costEstimate)) {
        console.error("Dữ liệu chi phí không hợp lệ.");
        container.innerHTML = "<p>Không có dữ liệu chi phí hợp lệ.</p>";
        return;
    }

    let costHTML = `
        <h3>Bảng tính chi phí trồng và chăm sóc cây trồng</h3>
        <table>
            <tr>
                <th>STT</th>
                <th>Các loại chi phí</th>
                <th>Đơn vị tính</th>
                <th>Đơn giá (đồng)</th>
                <th>Số lượng</th>
                <th>Thành tiền (đồng)</th>
                <th>Ghi chú</th>
            </tr>
    `;

    let totalCost = 0;
    costEstimate.forEach(item => {
        const itemTotal = (item['Don Gia (dong)'] || 0) * (item['So Luong'] || 0);
        totalCost += itemTotal;
        costHTML += `
            <tr>
                <td>${item.STT || ""}</td>
                <td>${item['Cac Loai Chi Phi'] || ""}</td>
                <td>${item['Don Vi Tinh'] || ""}</td>
                <td>${item['Don Gia (dong)'] || ""}</td>
                <td>${item['So Luong'] || ""}</td>
                <td>${itemTotal}</td>
                <td>${item['Ghi Chu'] || ""}</td>
            </tr>
        `;
    });

    costHTML += `
        <tr class="total-row">
            <td colspan="5">Tổng cộng</td>
            <td>${totalCost}</td>
            <td></td>
        </tr>
    </table>`;
    container.innerHTML = costHTML;
}

// Hàm tạo dữ liệu giả lập cho giá thị trường
function generateMockMarketData(nongsan) {
    const mockPrices = {
        "cà chua": { price: (5000 + Math.random() * 2000).toFixed(0), date: new Date().toLocaleDateString() },
        "trái bầu": { price: (15000 + Math.random() * 3000).toFixed(0), date: new Date().toLocaleDateString() },
        "đậu bắp": { price: (10000 + Math.random() * 4000).toFixed(0), date: new Date().toLocaleDateString() },
        "khổ qua": { price: (10000 + Math.random() * 4000).toFixed(0), date: new Date().toLocaleDateString() }
    };
    return mockPrices[nongsan] || { price: "Không có sẵn", date: new Date().toLocaleDateString() };
}

// Hàm hiển thị thông tin giá thị trường
async function displayMarketData(nongsan, container) {
    const marketData = generateMockMarketData(nongsan);
    container.innerHTML = `
        <p>Giá thị trường hiện tại của ${nongsan}: ${marketData.price} VND/kg</p>
        <p>Cập nhật lần cuối: ${marketData.date}</p>
    `;
}
