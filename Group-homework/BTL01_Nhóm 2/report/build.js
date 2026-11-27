const fs = require('fs');
const D = require('docx');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun, AlignmentType, HeadingLevel,
  WidthType, ShadingType, BorderStyle, Footer, PageNumber, LevelFormat, PageBreak } = D;
const S = JSON.parse(fs.readFileSync('../logs/summary.json'));
const FONT = 'Times New Roman';
const e2 = x => x.toExponential(2).replace('e-0', 'e-').replace('e+0', 'e+');
const e1 = x => x.toExponential(1).replace('e-0', 'e-').replace('e+0', 'e+');
const pm = (m, s) => `${e2(m)} ± ${e1(s)}`;

const r = (t, o = {}) => new TextRun({ text: t, font: FONT, size: 24, ...o });
const P = (t, o = {}) => new Paragraph({ spacing: { after: 120, line: 300 }, alignment: AlignmentType.JUSTIFIED,
  children: Array.isArray(t) ? t : [r(t)], ...o });
const B = (t, level = 0) => new Paragraph({ numbering: { reference: 'bul', level }, spacing: { after: 60, line: 288 },
  children: Array.isArray(t) ? t : [r(t)] });
const H1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 160 }, children: [new TextRun({ text: t, font: FONT, size: 30, bold: true, color: '1F3864' })] });
const H2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 }, children: [new TextRun({ text: t, font: FONT, size: 26, bold: true, color: '2F5496' })] });
const cap = t => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 200 }, children: [r(t, { italics: true, size: 22 })] });
const capT = t => new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 160, after: 80 }, children: [r(t, { italics: true, size: 22 })] });
const code = lines => lines.map(l => new Paragraph({ spacing: { after: 0, line: 240 }, shading: { type: ShadingType.CLEAR, fill: 'F2F2F2' },
  children: [new TextRun({ text: l === '' ? ' ' : l, font: 'Consolas', size: 18 })] }));
const math = t => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 120 }, children: [r(t, { italics: true })] });

function png(p) { const b = fs.readFileSync(p); return [b.readUInt32BE(16), b.readUInt32BE(20)]; }
function fig(name, w = 600) {
  const p = `../figures/${name}`; const [pw, ph] = png(p);
  return new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 120, after: 40 },
    children: [new ImageRun({ type: 'png', data: fs.readFileSync(p), transformation: { width: w, height: Math.round(w * ph / pw) },
      altText: { title: name, description: name, name } })] });
}

const bd = { style: BorderStyle.SINGLE, size: 4, color: '999999' };
const borders = { top: bd, bottom: bd, left: bd, right: bd };
function table(head, rows, widths, opt = {}) {
  const total = widths.reduce((a, b) => a + b, 0);
  const cell = (t, w, h, i) => new TableCell({ borders, width: { size: w, type: WidthType.DXA },
    shading: h ? { type: ShadingType.CLEAR, fill: 'D9E2F3' } : (opt.hl && opt.hl(i) ? { type: ShadingType.CLEAR, fill: 'FFF2CC' } : undefined),
    margins: { top: 50, bottom: 50, left: 80, right: 80 },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(t), font: FONT, size: opt.size || 19, bold: h })] })] });
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: widths,
    rows: [new TableRow({ tableHeader: true, children: head.map((t, i) => cell(t, widths[i], true)) }),
      ...rows.map((rw, ri) => new TableRow({ cantSplit: true, children: rw.map((t, i) => cell(t, widths[i], false, ri)) }))] });
}

const A = S.A, Bq = S.B, Bs = S.Bs, C = S.C, F = S.final, d = S.data;
const metricRows = (arr, key, fmtKey) => arr.map(x => [fmtKey(x[key]), e2(x.train_mse_mean), e2(x.val_mse_mean), pm(x.test_mse_mean, x.test_mse_std),
  e2(x.test_mae_mean), e2(x.test_rmse_mean), x.test_r2_mean.toFixed(3)]);
const HEAD = (k) => [k, 'Train MSE', 'Val MSE', 'Test MSE (TB ± std)', 'Test MAE', 'Test RMSE', 'Test R²'];
const W7 = [900, 1250, 1250, 1900, 1250, 1250, 1226];
const nm = (x) => String(x);

const kids = [];
// ---------- Trang bia ----------
kids.push(new Paragraph({ spacing: { before: 1200 }, alignment: AlignmentType.CENTER, children: [r('HỌC SÂU (DEEP LEARNING)', { bold: true, size: 28 })] }));
kids.push(new Paragraph({ spacing: { before: 400, after: 200 }, alignment: AlignmentType.CENTER, children: [r('BÀI TẬP LỚN 01', { bold: true, size: 36, color: '1F3864' })] }));
kids.push(new Paragraph({ spacing: { after: 600 }, alignment: AlignmentType.CENTER, children: [r('XẤP XỈ HÀM SỐ BẰNG MẠNG PERCEPTRON ĐA TẦNG (MLP)', { bold: true, size: 32, color: '1F3864' })] }));
kids.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [r('Hàm mật độ Gaussian hai chiều – Cài đặt bằng PyTorch', { italics: true, size: 26 })] }));
kids.push(table(['Thông tin', 'Nội dung'], [
  ['Nhóm', '… (điền số nhóm)'], ['Nhóm trưởng', '… (Họ tên – MSSV)'], ['Giảng viên', '…'], ['Ngày nộp', '…']], [2800, 6226], { size: 22 }));
kids.push(capT('Bảng thành viên, nhiệm vụ và tỷ lệ đóng góp (tổng 100%)'));
kids.push(table(['Thành viên', 'MSSV', 'Nhiệm vụ', 'Đóng góp'], [
  ['… (nhóm trưởng)', '…', 'Mã nguồn, thí nghiệm', '…%'], ['…', '…', 'Báo cáo', '…%'], ['…', '…', 'Slide, thuyết trình', '…%'], ['Tổng', '', '', '100%']],
  [2600, 1600, 3226, 1600], { size: 21 }));
kids.push(new Paragraph({ children: [new PageBreak()] }));

// ---------- 1 Gioi thieu ----------
kids.push(H1('1. Giới thiệu'));
kids.push(H2('1.1. Mục tiêu'));
kids.push(P('Bài tập xây dựng và huấn luyện mạng perceptron đa tầng (MLP) bằng PyTorch để xấp xỉ hàm mật độ Gaussian hai chiều (bài toán hồi quy). Ngoài việc thực hành đầy đủ quy trình triển khai mạng nơ-ron (dữ liệu, mô hình, lan truyền ngược, tối ưu, đánh giá), nhóm khảo sát có kiểm soát ba yếu tố ảnh hưởng đến chất lượng xấp xỉ:'));
kids.push(B([r('A', { bold: true }), r(' – số mẫu huấn luyện: 200, 400, …, 2000;')]));
kids.push(B([r('B', { bold: true }), r(' – số nơ-ron của MLP một tầng ẩn: 1, 2, …, 10 (mở rộng thêm 16 và 32);')]));
kids.push(B([r('C', { bold: true }), r(' – số tầng ẩn: 1, 2, …, 6 (yêu cầu tối thiểu 1–4), mỗi tầng 10 nơ-ron.')]));
kids.push(H2('1.2. Phát biểu bài toán'));
kids.push(P('Cho hàm Gaussian hai chiều:'));
kids.push(math('f(x) = 1 / ( 2π · det(C)^(1/2) ) · exp( −½ (x − μ)ᵀ C⁻¹ (x − μ) )'));
kids.push(P('với μ = [0, 0]ᵀ và C = [[0.3, −0.5], [−0.5, 2]]. Các mẫu x = (x₁, x₂) được lấy ngẫu nhiên đều trong miền −2 ≤ x₁ ≤ 2, −4 ≤ x₂ ≤ 4, nhãn y = f(x₁, x₂). Mạng MLP có hai đầu vào và một đầu ra ŷ để xấp xỉ y. Tập test gồm 100 mẫu độc lập; có thêm tập validation riêng để chọn mô hình.'));
kids.push(H2('1.3. Đóng góp của nhóm'));
kids.push(B('Cài đặt trọn vẹn quy trình bằng PyTorch (nn.Module, DataLoader, MSELoss, Adam, vòng lặp train/validation tự viết, checkpoint theo validation).'));
kids.push(B(`Thực hiện ba nhóm thực nghiệm A, B, C với ${S.n_runs} lần chạy (mỗi cấu hình 3 seed), báo cáo trung bình ± độ lệch chuẩn; toàn bộ log CSV và trọng số .pt được lưu để kiểm chứng.`));
kids.push(B('Phân tích xu hướng, kể cả những kết quả không giống đồ thị minh họa trong đề (ví dụ: không quan sát được hiện tượng quá khớp rõ ràng), và nêu hạn chế của thiết kế thí nghiệm.'));
kids.push(B('Khắc phục một số điểm yếu của code mẫu: không dùng Keras/TensorFlow; không dùng test để chọn mô hình; dùng đúng ma trận C của đề; không dùng sigmoid ở đầu ra; chạy nhiều seed.'));

// ---------- 2 Du lieu ----------
kids.push(H1('2. Dữ liệu'));
kids.push(H2('2.1. Hàm Gaussian và tham số'));
kids.push(P(`Hàm được cài đặt đúng công thức trong hàm gaussian_2d (src/data.py): tính khoảng cách Mahalanobis (x−μ)ᵀC⁻¹(x−μ) bằng einsum, hệ số chuẩn hóa 1/((2π)^(n/2)·√det C) với n = 2. Ma trận C có det(C) = 0.3·2 − (−0.5)² = ${d.det.toFixed(2)} > 0 nên là ma trận hợp lệ (xác định dương). Giá trị cực đại của hàm tại tâm là 1/(2π√0.35) ≈ ${d.peak.toFixed(4)}. Do đó nhãn y nằm trong khoảng [0, ≈0.27] chứ không phủ toàn bộ [0, 1] như ghi trong slide đề; đây là hệ quả toán học của C, không phải lỗi sinh dữ liệu. Vì C có hiệp phương sai âm (−0.5) nên "ngọn đồi" bị nghiêng theo hướng chéo trong mặt phẳng (x₁, x₂).`));
kids.push(fig('fig_true_surface.png', 330));
kids.push(cap('Hình 1. Bề mặt hàm Gaussian thật trên miền [−2, 2] × [−4, 4].'));
kids.push(H2('2.2. Lấy mẫu và chia tập dữ liệu'));
kids.push(P('Dữ liệu được sinh một lần, lưu thành CSV và dùng cố định cho mọi thí nghiệm. Ba tập được sinh độc lập với ba seed khác nhau để tránh rò rỉ dữ liệu:'));
kids.push(capT('Bảng 1. Cách chia dữ liệu và seed.'));
kids.push(table(['Tập', 'Số mẫu', 'Seed', 'Mục đích'], [
  ['Train (pool)', '2000', '42', 'Huấn luyện; lấy A mẫu đầu tiên (tập con lồng nhau)'],
  ['Validation', '200', '1042', 'Chọn checkpoint tốt nhất và chọn cấu hình'],
  ['Test', '100', '2042', 'Chỉ đánh giá cuối, không dùng để chọn siêu tham số']], [1700, 1100, 1000, 5226]));
kids.push(P(' '));
kids.push(P('Với thực nghiệm A, tập train kích thước A là A mẫu đầu tiên của pool 2000 mẫu, nên các tập lồng nhau (200 ⊂ 400 ⊂ … ⊂ 2000); sự khác biệt kết quả đến từ số lượng mẫu chứ không phải từ việc rút mẫu khác nhau. Đầu vào được chuẩn hóa (trừ trung bình, chia độ lệch chuẩn) với thống kê chỉ tính trên tập train của từng lần chạy; nhãn y giữ nguyên thang gốc.'));
kids.push(H2('2.3. Khảo sát dữ liệu'));
kids.push(fig('fig_data_scatter3d.png', 610));
kids.push(cap('Hình 2. Scatter 3D của tập train (pool), validation và test.'));
kids.push(fig('fig_hist.png', 560));
kids.push(cap('Hình 3. Phân bố x₁, x₂ và y của tập train (pool 2000 mẫu).'));
kids.push(capT('Bảng 2. Thống kê tập train (pool).'));
kids.push(table(['Đại lượng', 'Giá trị'], [
  ['x₁: trung bình / độ lệch chuẩn', `${d.x1_mean.toFixed(3)} / ${d.x1_std.toFixed(3)} (kỳ vọng đều trên [−2,2]: 0 / 1.155)`],
  ['x₂: trung bình / độ lệch chuẩn', `${d.x2_mean.toFixed(3)} / ${d.x2_std.toFixed(3)} (kỳ vọng đều trên [−4,4]: 0 / 2.309)`],
  ['y: nhỏ nhất – lớn nhất', `${d.y_min.toExponential(1)} – ${d.y_max.toFixed(4)}`],
  ['y: trung bình / độ lệch chuẩn', `${d.y_mean.toFixed(4)} / ${d.y_std.toFixed(4)}`],
  ['Tỷ lệ mẫu có y < 0.001', `${(d['frac_below_1e-3'] * 100).toFixed(1)}%`],
  ['y lớn nhất: validation / test', `${d.val_y_max.toFixed(4)} / ${d.test_y_max.toFixed(4)}`]], [3600, 5426]));
kids.push(P(' '));
kids.push(P(`Nhận xét: x₁, x₂ phân bố đều trên miền như thiết kế. Phân bố y lệch rất mạnh: ${(d['frac_below_1e-3'] * 100).toFixed(0)}% số mẫu có y gần 0 (vùng "chân đồi"), chỉ một số ít mẫu nằm gần đỉnh. Vì vậy phần "đỉnh" của hàm được học từ rất ít điểm, và sai số lớn nhất của mô hình sau này tập trung ở đó. Ngoài ra, tập validation/test nhỏ (200/100 mẫu) có giá trị y lớn nhất thấp hơn đỉnh thật, nên sai số trên các tập này có thể nhỏ hơn hoặc lớn hơn sai số train do chênh lệch ngẫu nhiên của mẫu chứ không hẳn do quá khớp.`));

// ---------- 3 Mo hinh ----------
kids.push(H1('3. Mô hình và cài đặt'));
kids.push(H2('3.1. Kiến trúc'));
kids.push(P('Mạng MLP gồm 2 đầu vào, C tầng ẩn (mỗi tầng một phép biến đổi tuyến tính nn.Linear rồi hàm kích hoạt Tanh) và 1 đầu ra tuyến tính. Với tầng ẩn thứ l có h_l nơ-ron:'));
kids.push(math('a⁽⁰⁾ = x,   a⁽ˡ⁾ = tanh( W⁽ˡ⁾ a⁽ˡ⁻¹⁾ + b⁽ˡ⁾ ),   ŷ = W⁽ᴼ⁾ a⁽ᶜ⁾ + b⁽ᴼ⁾'));
kids.push(math('L(θ) = (1/N) Σᵢ ( ŷᵢ − yᵢ )²   (MSELoss)'));
kids.push(P('Đầu ra tuyến tính được chọn thay cho sigmoid của code mẫu: bài toán là hồi quy, y rất nhỏ (≤ 0.27) và sigmoid ở đầu ra cùng SGD tốc độ học thấp làm hội tụ chậm và làm bão hòa gradient. Hàm Tanh (trơn, đối xứng quanh 0) phù hợp với đầu vào đã chuẩn hóa. Số tham số của MLP một tầng ẩn B nơ-ron là 3B + (B + 1) = 4B + 1 (B = 10: 41 tham số); với C tầng, mỗi tầng 10 nơ-ron: 41 + 110(C − 1).'));
kids.push(H2('3.2. Các thành phần chính của chương trình PyTorch'));
kids.push(P('Mô hình tùy biến (src/model.py): nhận danh sách số nơ-ron từng tầng nên dùng chung cho thí nghiệm B (một tầng, B thay đổi) và C (nhiều tầng).'));
kids.push(...code(['class MLP(nn.Module):', '    def __init__(self, hidden_sizes=(10,), activation=nn.Tanh):', '        super().__init__()', '        layers, in_dim = [], 2', '        for h in hidden_sizes:', '            layers += [nn.Linear(in_dim, h), activation()]', '            in_dim = h', '        layers.append(nn.Linear(in_dim, 1))', '        self.net = nn.Sequential(*layers)', '    def forward(self, x):', '        return self.net(x).squeeze(-1)']));
kids.push(P(' '));
kids.push(P('Vòng lặp huấn luyện (src/train.py) tự viết theo đúng trình tự forward → loss → zero_grad → backward → step; chuyển sang model.eval() và torch.no_grad() khi tính validation; lưu bản sao state_dict mỗi khi validation loss cải thiện và nạp lại bản tốt nhất sau khi huấn luyện:'));
kids.push(...code(['for ep in range(epochs):', '    model.train()', '    for xb, yb in loader:            # DataLoader(TensorDataset), shuffle=True', '        pred = model(xb)             # forward', '        loss = crit(pred, yb)        # MSELoss', '        opt.zero_grad()              # xoa gradient cu', '        loss.backward()              # lan truyen nguoc', '        opt.step()                   # cap nhat Adam', '    model.eval()', '    with torch.no_grad():', '        val_loss = crit(model(Xva), Yva).item()', '    if val_loss < best_val:          # checkpoint theo validation', '        best_val, best_state = val_loss, copy.deepcopy(model.state_dict())', 'model.load_state_dict(best_state)']));
kids.push(P(' '));
kids.push(P('Đánh giá (evaluate_all) tính MSE, MAE, RMSE và R² trên cả ba tập bằng mô hình ở checkpoint tốt nhất. Test chỉ được tính sau khi huấn luyện xong và không tham gia chọn checkpoint hay cấu hình.'));
kids.push(H2('3.3. Thiết lập huấn luyện chuẩn (baseline)'));
kids.push(capT('Bảng 3. Siêu tham số chuẩn, giữ nguyên trong mọi nhóm thí nghiệm.'));
kids.push(table(['Siêu tham số', 'Giá trị'], [
  ['Seed khởi tạo / xáo trộn', '0, 1, 2 (báo cáo trung bình ± độ lệch chuẩn)'], ['Bộ tối ưu', 'Adam'], ['Learning rate', S.lr.toString()],
  ['Batch size', S.bs.toString()], ['Số epoch', `${S.epochs} (cố định, không early stopping; chọn checkpoint có val loss nhỏ nhất)`],
  ['Hàm kích hoạt', 'Tanh (tầng ẩn), tuyến tính (đầu ra)'], ['Hàm mất mát', 'MSELoss'],
  ['Cấu hình baseline', 'A = 2000, B = 10, C = 1 (riêng nhóm A thay đổi A)'], ['Chuẩn hóa', 'Đầu vào, theo thống kê tập train'],
  ['Thiết bị', 'CPU (1 nhân)']], [3000, 6026]));
kids.push(P(' '));
kids.push(P('Môi trường: Python 3.11, PyTorch 2.14.1 (CPU), NumPy, Pandas, SciPy, Matplotlib (xem requirements.txt). Quy ước điều kiện dừng: huấn luyện đủ số epoch, mô hình dùng để đánh giá là checkpoint có validation loss nhỏ nhất.'));

// ---------- 4 Thuc nghiem ----------
kids.push(H1('4. Thực nghiệm'));
kids.push(H2('4.1. Quy trình đánh giá công bằng'));
kids.push(B('Mỗi nhóm chỉ thay đổi một yếu tố; các yếu tố còn lại giữ theo Bảng 3.'));
kids.push(B('Mỗi cấu hình chạy với 3 seed; các bảng báo cáo trung bình, kèm độ lệch chuẩn của test MSE.'));
kids.push(B('Mọi lần chạy ghi vào logs/results.csv (tham số, train/val/test MSE, MAE, RMSE, R², epoch tốt nhất, thời gian) và logs/history.csv (loss theo epoch); trọng số lưu ở checkpoints/*.pt.'));
kids.push(B('Cấu hình/mô hình được chọn bằng validation; test chỉ để báo cáo kết quả.'));
kids.push(P('Lưu ý khi đọc kết quả: "train MSE" là sai số tính trên chính A mẫu train bằng mô hình ở checkpoint tốt nhất (chế độ eval). Do cố định số epoch nên với A lớn hơn mô hình được cập nhật nhiều bước hơn (A = 200 → 4 batch/epoch, A = 2000 → 32 batch/epoch); đây là yếu tố gây nhiễu cần nhớ khi diễn giải nhóm A.'));

kids.push(H2('4.2. Nhóm A – ảnh hưởng của số mẫu train'));
kids.push(P('Cấu hình: B = 10, C = 1, A ∈ {200, 400, …, 2000}.'));
kids.push(capT('Bảng 4. Kết quả nhóm A (trung bình 3 seed).'));
kids.push(table(HEAD('A'), metricRows(A, 'A', nm), W7, { size: 18 }));
kids.push(fig('fig_expA.png', 600));
kids.push(cap('Hình 4. Sai số (MSE và MAE, thang log) theo số mẫu train A; thanh sai số là độ lệch chuẩn của 3 seed.'));
const a0 = A[0], a9 = A[A.length - 1];
kids.push(P(`Nhận xét: sai số giảm đơn điệu và rõ rệt khi A tăng. Test MSE giảm từ ${e2(a0.test_mse_mean)} (A = 200) xuống ${e2(a9.test_mse_mean)} (A = 2000), tức khoảng ${(a0.test_mse_mean / a9.test_mse_mean).toFixed(0)} lần; R² trên test tăng từ ${a0.test_r2_mean.toFixed(3)} lên ${a9.test_r2_mean.toFixed(3)}. Đường cong chưa bão hòa ở A = 2000 nên thêm dữ liệu vẫn có thể cải thiện. Khoảng cách giữa test và train MSE gần như không mở rộng khi A thay đổi (test/train ≈ ${(a0.test_mse_mean / a0.train_mse_mean).toFixed(2)} ở A = 200 và ≈ ${(a9.test_mse_mean / a9.train_mse_mean).toFixed(2)} ở A = 2000), nên đây không phải hiện tượng quá khớp. Với A nhỏ, ít điểm rơi vào vùng đỉnh nên mô hình khó xác định hình dạng ngọn đồi; A lớn phủ vùng đỉnh dày hơn. Epoch tốt nhất trung bình là ${A[0].ep_mean.toFixed(0)}–${A[9].ep_mean.toFixed(0)}/${S.epochs}, tức mô hình vẫn còn cải thiện đến cuối huấn luyện. Điều này cho thấy một phần cải thiện khi A tăng cũng đến từ việc có nhiều bước cập nhật hơn (xem lưu ý ở mục 4.1), không chỉ từ lượng thông tin của dữ liệu. Khác với đồ thị minh họa trong đề (test tăng lại ở A lớn), thực nghiệm này không cho thấy đoạn tăng đó: nhãn không có nhiễu nên thêm dữ liệu không gây hại.`));

kids.push(H2('4.3. Nhóm B – ảnh hưởng của số nơ-ron tầng ẩn'));
kids.push(P('Cấu hình: A = 2000, C = 1, B ∈ {1, …, 10} và mở rộng thêm B = 16, 32.'));
kids.push(capT('Bảng 5. Kết quả nhóm B (A = 2000).'));
kids.push(table(HEAD('B'), metricRows(Bq, 'n_units', nm), W7, { size: 18 }));
kids.push(fig('fig_expB.png', 600));
kids.push(cap('Hình 5. Sai số theo số nơ-ron tầng ẩn B (A = 2000).'));
const b = k => Bq.find(x => x.n_units === k), bs = k => Bs.find(x => x.n_units === k);
kids.push(P(`Nhận xét – thiếu khớp (underfitting): B = 1 cho R² ≈ ${b(1).test_r2_mean.toFixed(2)}, tương đương dự đoán gần như hằng số. Một nơ-ron Tanh chỉ tạo hàm phụ thuộc vào một hướng (dạng "bậc thang trơn"), không thể tạo ngọn đồi. Khi B tăng, test MSE giảm từ ${e2(b(1).test_mse_mean)} (B = 1) xuống ${e2(b(8).test_mse_mean)} (B = 8), ${e2(b(10).test_mse_mean)} (B = 10), ${e2(b(16).test_mse_mean)} (B = 16) và ${e2(b(32).test_mse_mean)} (B = 32). Train MSE cũng giảm cùng chiều và luôn ở cùng bậc độ lớn với test MSE, chứng tỏ sai số chủ yếu do mô hình thiếu dung lượng/chưa hội tụ chứ không phải do quá khớp. Đường cong không hoàn toàn đơn điệu: B = 9 (test MSE ${pm(b(9).test_mse_mean, b(9).test_mse_std)}) tệ hơn B = 8 (${pm(b(8).test_mse_mean, b(8).test_mse_std)}). Với chỉ 3 seed, nguyên nhân khả dĩ là khởi tạo xấu/cực tiểu địa phương ở một vài seed; nhóm không kết luận chắc chắn mà coi đây là nhiễu do khởi tạo, cần thêm seed để khẳng định.`));
kids.push(H2('4.4. Bổ sung: nhóm B với ít dữ liệu (A = 200)'));
kids.push(P('Để kiểm tra khả năng quá khớp khi dung lượng mô hình lớn so với dữ liệu, nhóm lặp lại nhóm B với A = 200 (mô hình B = 32 có 129 tham số, so với 200 mẫu). Đây là thực nghiệm bổ sung ngoài yêu cầu.'));
kids.push(capT('Bảng 6. Kết quả nhóm B với A = 200.'));
kids.push(table(HEAD('B'), metricRows(Bs, 'n_units', nm), W7, { size: 18 }));
kids.push(fig('fig_expB_small.png', 600));
kids.push(cap('Hình 6. Sai số theo B khi A = 200.'));
kids.push(P(`Nhận xét: với A = 200, sai số bão hòa quanh ${e2(bs(6).test_mse_mean)}–${e2(bs(10).test_mse_mean)} khi B = 4–10, kém xa kết quả A = 2000 cùng B (B = 10: ${e2(b(10).test_mse_mean)}). B = 16 cho test MSE ${e2(bs(16).test_mse_mean)}, B = 32 cho ${e2(bs(32).test_mse_mean)}. Chênh lệch giữa train và test vẫn nhỏ (B = 32: ${e2(bs(32).train_mse_mean)} so với ${e2(bs(32).test_mse_mean)}), và không thấy điểm mà test tăng trong khi train tiếp tục giảm. Như vậy, trong phạm vi khảo sát, nhóm không quan sát được quá khớp rõ ràng như đồ thị minh họa của đề. Có thể giải thích: (i) nhãn không có nhiễu và hàm rất trơn nên khó "học thuộc nhiễu"; (ii) dung lượng tối đa khảo sát còn nhỏ; (iii) việc chọn checkpoint theo validation hoạt động như early stopping. Ở A nhỏ, hạn chế chính là thiếu thông tin về vùng đỉnh, thể hiện qua sai số bão hòa khi B tăng.`));

kids.push(H2('4.5. Nhóm C – ảnh hưởng của số tầng ẩn'));
kids.push(P('Cấu hình: A = 2000, mỗi tầng ẩn 10 nơ-ron, C ∈ {1, …, 6} (yêu cầu tối thiểu C = 1–4).'));
kids.push(capT('Bảng 7. Kết quả nhóm C (A = 2000, 10 nơ-ron/tầng).'));
kids.push(table(['C', 'Số tham số', 'Train MSE', 'Val MSE', 'Test MSE (TB ± std)', 'Test MAE', 'Test R²', 'Thời gian (s)'],
  C.map(x => [x.n_layers, 41 + 110 * (x.n_layers - 1), e2(x.train_mse_mean), e2(x.val_mse_mean), pm(x.test_mse_mean, x.test_mse_std), e2(x.test_mae_mean), x.test_r2_mean.toFixed(4), `${x.time_mean.toFixed(1)} ± ${x.time_std.toFixed(1)}`]),
  [500, 900, 1150, 1150, 1850, 1150, 1000, 1326], { size: 17 }));
kids.push(fig('fig_expC.png', 610));
kids.push(cap('Hình 7. Nhóm C: (trái) sai số theo số tầng ẩn; (giữa) validation loss theo epoch, trung bình 3 seed; (phải) thời gian huấn luyện (CPU 1 nhân, chỉ có ý nghĩa so sánh tương đối).'));
const c = k => C.find(x => x.n_layers === k);
kids.push(P(`Nhận xét: thêm tầng thứ hai cải thiện rất mạnh: test MSE giảm từ ${e2(c(1).test_mse_mean)} (C = 1) xuống ${e2(c(2).test_mse_mean)} (C = 2), khoảng ${(c(1).test_mse_mean / c(2).test_mse_mean).toFixed(0)} lần, R² ≈ ${c(2).test_r2_mean.toFixed(4)}. Từ C = 2 đến C = 4 sai số nằm trong cùng bậc độ lớn (${e2(c(2).test_mse_mean)}, ${e2(c(3).test_mse_mean)}, ${e2(c(4).test_mse_mean)}); độ chênh nhỏ so với độ lệch chuẩn giữa các seed nên chưa đủ căn cứ để nói thêm tầng nào tốt hơn. C = 5 và C = 6 cho ${e2(c(5).test_mse_mean)} và ${e2(c(6).test_mse_mean)}. Khác với nhận xét "tăng tầng thì lỗi tăng do vanishing gradient" trong báo cáo mẫu, ở đây không thấy suy giảm khi tăng đến 6 tầng. Điều này phù hợp với việc dùng Tanh và bộ tối ưu Adam thay cho sigmoid + SGD của code mẫu, và độ sâu còn nhỏ; nhóm chưa chạy thí nghiệm đối chứng sigmoid + SGD nên không khẳng định đây là nguyên nhân duy nhất. Về chi phí, thời gian huấn luyện tăng từ ${c(1).time_mean.toFixed(1)}s (C = 1) lên ${c(6).time_mean.toFixed(1)}s (C = 6), cùng số tham số tăng từ 41 lên 591. Do mạng sâu hơn biểu diễn hàm tốt hơn với cùng số nơ-ron/tầng, mức lợi chủ yếu đến ở bước từ 1 lên 2 tầng, sau đó lợi ích biên giảm trong khi chi phí vẫn tăng.`));

// ---------- 5 Danh gia chung ----------
kids.push(H1('5. Đánh giá mô hình cuối và thảo luận'));
kids.push(H2('5.1. Chọn mô hình'));
kids.push(P(`Mô hình cuối được chọn chỉ dựa trên validation: trong các cấu hình ở nhóm B và C (A = 2000), cấu hình có validation MSE trung bình thấp nhất là ${S.final_hidden.length} tầng ẩn × ${S.final_hidden[0]} nơ-ron; trong các lần chạy của cấu hình này chọn seed có validation MSE nhỏ nhất (seed ${S.final_seed}). Nếu giới hạn trong phạm vi yêu cầu tối thiểu (C ≤ 4) thì C = 4 có validation MSE thấp nhất. Trọng số được lưu tại checkpoints/best_model.pt. Do việc chọn "tốt nhất trong nhiều lần thử" có thể thiên lệch lạc quan, nên các số liệu so sánh chính của báo cáo là trung bình 3 seed ở các bảng trên; kết quả mô hình đơn lẻ dưới đây chỉ để minh họa.`));
kids.push(capT('Bảng 8. Đánh giá mô hình cuối.'));
kids.push(table(['Tập', 'MSE', 'MAE', 'RMSE', 'R²'], ['train', 'val', 'test'].map(k => [k, e2(F[k].mse), e2(F[k].mae), e2(F[k].rmse), F[k].r2.toFixed(5)]), [1500, 1900, 1900, 1900, 1826]));
kids.push(P(' '));
kids.push(fig('fig_y_vs_yhat.png', 610));
kids.push(cap('Hình 8. y thật so với ŷ dự đoán trên train, validation và test (đường nét đứt: ŷ = y).'));
kids.push(fig('fig_surface_compare.png', 610));
kids.push(cap(`Hình 9. Bề mặt thật, bề mặt xấp xỉ (chấm đen: các mẫu test) và bản đồ sai số tuyệt đối trên lưới 60×60. Sai số tuyệt đối lớn nhất ≈ ${S.surface_max_abs_err.toFixed(4)} (≈ ${(S.surface_max_abs_err / d.peak * 100).toFixed(1)}% giá trị đỉnh), trung bình ≈ ${S.surface_mean_abs_err.toExponential(1)}.`));
kids.push(P('Các điểm y–ŷ nằm sát đường ŷ = y, bề mặt xấp xỉ bám sát bề mặt thật. Sai số tập trung quanh đỉnh và sườn dốc, đúng với dự đoán ở mục 2.3 (ít mẫu ở vùng đỉnh, độ cong lớn); vùng chân đồi gần như không có sai số đáng kể.'));
kids.push(H2('5.2. Tổng hợp xu hướng'));
kids.push(capT('Bảng 9. Tóm tắt ba nhóm thực nghiệm (test MSE trung bình 3 seed).'));
kids.push(table(['Nhóm', 'Thay đổi', 'Test MSE đầu → cuối', 'Kết luận chính'], [
  ['A', '200 → 2000 mẫu', `${e2(a0.test_mse_mean)} → ${e2(a9.test_mse_mean)}`, 'Giảm đơn điệu, chưa bão hòa, không thấy quá khớp'],
  ['B', '1 → 32 nơ-ron (A = 2000)', `${e2(b(1).test_mse_mean)} → ${e2(b(32).test_mse_mean)}`, 'B nhỏ thiếu khớp; càng rộng càng tốt trong phạm vi khảo sát; B = 9 bất thường'],
  ['C', '1 → 6 tầng', `${e2(c(1).test_mse_mean)} → ${e2(c(6).test_mse_mean)}`, 'Lên 2 tầng cải thiện lớn; sau đó gần bão hòa; thời gian tăng']], [800, 2300, 2700, 3226], { size: 18 }));
kids.push(P(' '));
kids.push(H2('5.3. Trường hợp không như kỳ vọng'));
kids.push(B('Không thấy quá khớp (A, B, C): đồ thị minh họa của đề có đoạn test tăng lại, còn kết quả thực nghiệm thì không. Lý do khả dĩ: nhãn không nhiễu, hàm trơn, mô hình nhỏ và có chọn checkpoint theo validation.'));
kids.push(B('B = 9 xấu hơn B = 8: có thể do khởi tạo/cực tiểu địa phương ở một số seed; cần thêm seed để xác nhận.'));
kids.push(B('Độ sâu không gây suy giảm: khác báo cáo mẫu, do đổi kích hoạt và bộ tối ưu.'));
kids.push(B('Sai số validation đôi khi thấp hơn train: do tập validation/test nhỏ và có đỉnh thấp hơn đỉnh thật (Bảng 2) nên chênh lệch chủ yếu là ngẫu nhiên lấy mẫu.'));
kids.push(H2('5.4. Hạn chế và đề xuất cải tiến'));
kids.push(B('Chỉ 3 seed, nên độ lệch chuẩn ước lượng thô; nên tăng lên ≥ 5–10 seed và kiểm định thống kê khi so sánh các cấu hình gần nhau.'));
kids.push(B('Số epoch cố định (300) và epoch tốt nhất thường gần cuối: nhiều cấu hình có thể chưa hội tụ hoàn toàn; nên huấn luyện lâu hơn, dùng lịch giảm learning rate. Chưa tinh chỉnh learning rate, batch size, kích hoạt.'));
kids.push(B('Ở nhóm A, số bước cập nhật phụ thuộc vào A; nên đối chứng với số bước cập nhật cố định.'));
kids.push(B('Tập test chỉ 100 mẫu nên ước lượng sai số test còn nhiễu; có thể bổ sung đánh giá trên lưới dày để đo sai số toàn miền (như Hình 9).'));
kids.push(B('Thời gian huấn luyện đo trên CPU 1 nhân dùng chung, chỉ nên so sánh tương đối.'));
kids.push(B('Hướng mở rộng: thêm nhiễu vào nhãn để khảo sát quá khớp, so sánh ReLU/Tanh/Sigmoid và SGD/Adam, lấy mẫu dày hơn quanh đỉnh.'));

// ---------- 6 Ket luan ----------
kids.push(H1('6. Kết luận'));
kids.push(P(`Nhóm đã xây dựng MLP bằng PyTorch để xấp xỉ Gaussian hai chiều và hoàn thành ba nhóm thực nghiệm (${S.n_runs} lần chạy, 3 seed mỗi cấu hình). Kết quả cho thấy (i) tăng số mẫu từ 200 lên 2000 giảm test MSE khoảng ${(a0.test_mse_mean / a9.test_mse_mean).toFixed(0)} lần; (ii) mạng một tầng ẩn bị thiếu khớp nặng khi B nhỏ và cải thiện đều khi B tăng; (iii) thêm tầng ẩn thứ hai cải thiện lớn nhất, các tầng sau cải thiện biên nhưng tăng thời gian. Mô hình cuối đạt test MSE ${e2(F.test.mse)}, MAE ${e2(F.test.mae)}, R² = ${F.test.r2.toFixed(5)}. Các kết luận cần được hiểu cùng những hạn chế đã nêu (số seed ít, epoch cố định, tập test nhỏ).`));
kids.push(H1('Tài liệu tham khảo'));
['[1] Bài giảng Học sâu (Deep Learning), 2018, và slide "Exercise #2 – Function Approximation MLP".',
 '[2] I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016.',
 '[3] A. Paszke et al., "PyTorch: An Imperative Style, High-Performance Deep Learning Library", NeurIPS, 2019.',
 '[4] D. P. Kingma, J. Ba, "Adam: A Method for Stochastic Optimization", ICLR, 2015.',
 '[5] Tài liệu PyTorch: https://pytorch.org/docs/stable/index.html'].forEach(t => kids.push(P(t, { alignment: AlignmentType.LEFT })));
kids.push(H1('Phụ lục – Lệnh tái lập'));
kids.push(...code(['pip install -r requirements.txt', 'python src/data.py                      # sinh data/train.csv, val.csv, test.csv', 'python src/run_experiments.py --exp A', 'python src/run_experiments.py --exp B Bsmall', 'python src/run_experiments.py --exp C', 'python src/make_figures.py              # hinh, bang tong hop, best_model.pt']));
kids.push(P(' '));
kids.push(P('Thư mục: src/ (mã nguồn), data/ (CSV), logs/ (results.csv, history.csv, summary_*.csv), figures/ (hình), checkpoints/ (*.pt, best_model.pt), report/ (báo cáo).'));

const doc = new Document({
  creator: 'Nhom', title: 'BTL01 - Xap xi ham so bang MLP',
  styles: { default: { document: { run: { font: FONT, size: 24 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 30, bold: true, font: FONT }, paragraph: { spacing: { before: 300, after: 160 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 26, bold: true, font: FONT }, paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 } }] },
  numbering: { config: [{ reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
  sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'BTL01 – Xấp xỉ hàm số bằng MLP – Trang ', font: FONT, size: 20 }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 20 })] })] }) },
    children: kids }]
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync('BaoCao_BTL01_MLP.docx', b); console.log('ok'); });
