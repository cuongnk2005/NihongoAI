# Rồng đỏ cho cảnh giới Luyện Hư

## Thiết kế

Dùng ảnh rồng xanh người dùng đã cung cấp làm tham chiếu bố cục và giải phẫu; tạo một mô hình rồng phương Đông màu đỏ, không phải đổi màu cả nền của ảnh. Prompt gợi ý (tiếng Anh):

> A majestic eastern celestial dragon for a xianxia fantasy game, based on the supplied blue dragon reference. Long serpentine body, four powerful clawed legs, no wings, a fierce elongated dragon head with openable jaws and sharp teeth, branching antler-like horns, flowing mane, long whiskers, layered dorsal spines and a tapered tail. Deep crimson and vermilion scales with subtle gold accents, warm ivory belly, glowing amber eyes. Detailed but coherent anatomy, elegant silhouette, realistic PBR scale texture, high quality game asset. Full body visible, isolated on a plain neutral background, soft even lighting, three-quarter view, no scenery, no clouds, no lightning, no fire, no text, no pedestal, no character, no cropped limbs or tail. Body in a relaxed elongated S-curve with separation between loops so it can be rigged and animated.

Không yêu cầu tạo nền hoặc ngọn lửa thành một phần lưới: chúng cần được tạo riêng để điều khiển trong ứng dụng. Kiểm tra đặc biệt phần mặt sau, hai bên, râu, chân và đuôi vì ảnh tham chiếu chỉ có một góc.

## Tạo và xuất

1. Trong Meshy, chọn Image to 3D và tải ảnh tham chiếu. Nếu công cụ không hỗ trợ vừa bám ảnh vừa đổi màu, tạo hình trước rồi dùng texturing/retexture với mô tả màu đỏ ở trên. Ảnh tham chiếu có nền và phần thân che khuất nên có thể cần nhiều lần thử hoặc ảnh sạch từ các góc khác.
2. Kiểm tra mô hình ở mọi góc, tạo texture PBR, remesh nếu cần. Hạn chế polygon và kích thước texture phù hợp trình duyệt; kiểm tra thực tế trên thiết bị yếu trước khi chốt.
3. Nếu dịch vụ hỗ trợ rig phù hợp rồng dài, tạo skeleton và animation bay vòng/đuôi uốn. Khả năng auto-rig và thư viện animation phụ thuộc loại nhân vật; không giả định rồng phương Đông được hỗ trợ. Nếu không, xuất FBX/GLB và rig, animate trong Blender.
4. Xuất **GLB** chứa mesh và texture; nếu có, gộp animation bay lặp vào cùng file. GLB tĩnh vẫn hiển thị và bay theo quỹ đạo, nhưng thân, hàm và đuôi sẽ không tự uốn. Chuyển động và chiều hướng thực tế cần kiểm tra sau khi có tài sản.
5. Đặt file tại `app/public/models/red-dragon.glb`. Tải lại trang và mở **Tu tiên → Luyện Hư**. Ứng dụng ưu tiên GLB khi tải thành công, nếu không sẽ giữ rồng cũ. Asset được chuẩn hóa kích thước và đi theo quỹ đạo; animation clip đầu tiên được phát lặp.

## Việc cần hoàn thiện sau khi có GLB

- Kiểm tra hướng trước của asset, kích thước, tâm xoay, vị trí camera và hiệu năng trên điện thoại; điều chỉnh theo file thực tế.
- Gắn lửa, khói và ánh sáng vào xương hoặc điểm ở miệng của mô hình. Hiệu ứng lửa hiện tại gắn với rồng cũ, không tự gắn chính xác vào GLB tùy ý.
- Nếu có nhiều animation, chọn clip bay thích hợp và kiểm tra chuyển cảnh; hiện bộ tải dùng clip đầu tiên.
- Kiểm tra giấy phép sử dụng và quyền thương mại của asset trước khi phát hành.
