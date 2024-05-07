document.addEventListener('DOMContentLoaded', function () {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    video.addEventListener('canplay', function () {
        const drawFrame = function () {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            performEdgeDetection();
            requestAnimationFrame(drawFrame);
        };
        drawFrame();
    });
    video.src = 'video.mp4'; 

    function performEdgeDetection() {
        // Lấy dữ liệu hình ảnh từ canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
    
        // Chuyển đổi dữ liệu hình ảnh thành một ma trận xám
        const grayData = new Uint8ClampedArray(width * height);
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const gray = (r + g + b) / 3; // Lấy giá trị trung bình của các kênh màu
            grayData[i / 4] = gray;
        }
    
        // Áp dụng bộ lọc Sobel để tính toán đạo hàm theo hướng x và y
        const sobelData = new Uint8ClampedArray(width * height);
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const gx = 
                    grayData[(y - 1) * width + (x - 1)] * -1 + 
                    grayData[(y - 1) * width + (x + 1)] +
                    grayData[y * width + (x - 1)] * -2 + 
                    grayData[y * width + (x + 1)] * 2 + 
                    grayData[(y + 1) * width + (x - 1)] * -1 + 
                    grayData[(y + 1) * width + (x + 1)];
                
                const gy = 
                    grayData[(y - 1) * width + (x - 1)] * 1 + 
                    grayData[(y - 1) * width + x] * 2 + 
                    grayData[(y - 1) * width + (x + 1)] * 1 +
                    grayData[(y + 1) * width + (x - 1)] * -1 + 
                    grayData[(y + 1) * width + x] * -2 + 
                    grayData[(y + 1) * width + (x + 1)] * -1;
                
                const gradient = Math.sqrt(gx * gx + gy * gy);
                sobelData[y * width + x] = gradient;
            }
        }
    
        // Tạo imageData mới từ dữ liệu sobelData
        const sobelImageData = ctx.createImageData(width, height);
        const sobelDataArray = sobelImageData.data;
        for (let i = 0; i < sobelDataArray.length; i += 4) {
            sobelDataArray[i] = sobelData[i / 4];
            sobelDataArray[i + 1] = sobelData[i / 4];
            sobelDataArray[i + 2] = sobelData[i / 4];
            sobelDataArray[i + 3] = 255;
        }
    
        // Vẽ kết quả của edge detection lên canvas
        ctx.putImageData(sobelImageData, 0, 0);
    }
});