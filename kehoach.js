// Hàm tải dữ liệu từ file JSON
async function loadExcelData() {
    const url = 'https://tulieu-hbt.github.io/du-an1-trong-va-cham-soc-cay-trong-gia-dinh/assets/baocao.json';  // Đảm bảo URL đúng

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Kiểm tra dữ liệu
        console.log("Dữ liệu từ file JSON:", data);

        return data;
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu từ file JSON:", error);
        return []; // Trả về một mảng rỗng nếu có lỗi
    }
}
// Hàm hiển thị thông tin giới thiệu- Thêm thông tin
function displayIntroduction(gioiThieu, container) {
    if (!gioiThieu || typeof gioiThieu !== "object") {
        console.error("Không có thông tin giới thiệu");
        return;
    }

    let introHTML = `
        <h3>Giới thiệu về cây trồng</h3>
        <p><strong>Giống cây:</strong> ${gioiThieu.giongCay || ""}</p>
        <p><strong>Phương thức trồng:</strong> ${gioiThieu.phuongThucTrong || ""}</p>
        <p><strong>Diện tích & Số lượng:</strong> ${gioiThieu.dienTichSoLuong || ""}</p>
        <p><strong>Điều kiện sinh trưởng:</strong> ${gioiThieu.dieuKienSinhTruong || ""}</p>
    `;
    container.innerHTML = introHTML + container.innerHTML; // Thêm thông tin giới thiệu trước nội dung hiện có
}
// Hàm hiển thị dữ liệu kế hoạch trồng cây và chi phí- Thêm thông tin
async function fetchAndDisplayPlanData(nongsan, introContainer, plantingContainer, costContainer) {
    const data = await loadExcelData();
    const selectedData = data.find(item => item.nongsan === nongsan);

    if (selectedData) {
        displayIntroduction(selectedData.gioiThieu, introContainer); // Hiển thị thông tin giới thiệu
        displayPlantingPlan(selectedData.plantingPlan, plantingContainer);
        displayCostEstimate(selectedData.costEstimate, costContainer);
    } else {
        introContainer.innerHTML = "<p>Không có dữ liệu giới thiệu.</p>";
        plantingContainer.innerHTML = "<p>Không có dữ liệu cho kế hoạch trồng cây.</p>";
        costContainer.innerHTML = "<p>Không có dữ liệu cho chi phí trồng cây.</p>";
    }
}


function displayPlantingPlan(plantingPlan, container) {
    if (!container) {
        console.error("Container is undefined");
        return;
    }
    let tasksHTML = "<h3>Kế hoạch trồng và chăm sóc cây trồng</h3>";
    tasksHTML += `<table>
        <tr>
            <th class="stt">STT</th>
            <th>Công việc cần làm</th>
            <th>Thời gian thực hiện</th>
            <th>Vật liệu, dụng cụ cần thiết</th>
            <th>Ghi chú</th>
        </tr>`;

    plantingPlan.forEach(task => {
        tasksHTML += `<tr>
            <td class="stt">${task.STT || ""}</td>
            <td>${task['Cong Viec Can Lam'] || ""}</td>
            <td>${task['Thoi Gian Thuc Hien'] || ""}</td>
            <td>${task['Vat Lieu, Dung Cu Can Thiet'] || ""}</td>
            <td>${task['Ghi Chu'] || ""}</td>
        </tr>`;
    });

    tasksHTML += "</table>";
    container.innerHTML = tasksHTML; // Ghi đè nội dung của container
}


// Hàm hiển thị chi phí trồng cây
function displayCostEstimate(costEstimate, container) {
    if (!Array.isArray(costEstimate)) {
        console.error("Dữ liệu costEstimate không phải là một mảng:", costEstimate);
        container.innerHTML = "<p>Không có dữ liệu chi phí trồng cây hợp lệ.</p>";
        return;
    }

    let costHTML = "<h3>Bảng tính chi phí trồng và chăm sóc cây trồng</h3>";
    costHTML += "<table><tr><th>STT</th><th>Các loại chi phí</th><th>Đơn vị tính</th><th>Đơn giá (đồng)</th><th>Số lượng</th><th>Thành tiền (đồng)</th><th>Ghi chú</th></tr>";

    let totalCost = 0;
    costEstimate.forEach(item => {
        const itemTotal = (item['Don Gia (dong)'] || 0) * (item['So Luong'] || 0);
        totalCost += itemTotal;
        costHTML += `<tr>
            <td>${item.STT || ""}</td>
            <td>${item['Cac Loai Chi Phi'] || ""}</td>
            <td>${item['Don Vi Tinh'] || ""}</td>
            <td>${item['Don Gia (dong)'] || ""}</td>
            <td>${item['So Luong'] || ""}</td>
            <td>${itemTotal}</td>
            <td>${item['Ghi Chu'] || ""}</td>
        </tr>`;
    });

    costHTML += `<tr class="total-row">
        <td colspan="5">Tổng cộng</td>
        <td>${totalCost}</td>
        <td></td>
    </tr>`;
    costHTML += "</table>";
    container.innerHTML = costHTML; // Ghi đè nội dung của container
}

// Hàm tạo dữ liệu giả lập cho giá thị trường (bổ sung dữ liệu)
function generateMockMarketData(nongsan) {
    const mockPrices = {
        "cà chua": { price: (5000 + Math.random() * 2000).toFixed(0), date: new Date().toLocaleDateString() },
        "trái bầu": { price: (15000 + Math.random() * 3000).toFixed(0), date: new Date().toLocaleDateString() },
        "trái mướp": { price: (20000 + Math.random() * 5000).toFixed(0), date: new Date().toLocaleDateString() },
        "đậu bắp": { price: (10000 + Math.random() * 4000).toFixed(0), date: new Date().toLocaleDateString() },
        "dưa leo": { price: (8000 + Math.random() * 2000).toFixed(0), date: new Date().toLocaleDateString() },
        "hành lá": { price: (8000 + Math.random() * 2000).toFixed(0), date: new Date().toLocaleDateString() }
    };
    return mockPrices[nongsan] || { price: "Không có sẵn", date: new Date().toLocaleDateString() };
}

// Hàm hiển thị thông tin giá thị trường lên giao diện
async function displayMarketData(nongsan, container) {
    const marketData = generateMockMarketData(nongsan);
    container.innerHTML = `<p>Giá thị trường hiện tại của ${nongsan}: ${marketData.price} VND/kg</p>
    <p>Cập nhật lần cuối: ${marketData.date}</p>`;
}

//export { loadExcelData, displayPlantingPlan, displayCostEstimate, displayMarketData };
