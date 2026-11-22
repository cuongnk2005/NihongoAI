import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { readCultivation } from './Cultivation';
import { CultivatorModel } from './CultivatorModel';
import './cultivation.css';

const realms = [
  { name: 'Phàm Nhân', title: 'Bước đầu nhập đạo', description: 'Một người học bình thường bắt đầu hành trình. Kiên trì từng phút để cảm nhận linh khí và bước vào tiên lộ.', color: '#a79b83', robe: '#69776c' },
  { name: 'Luyện Khí', title: 'Dẫn khí nhập thể', description: 'Thu nạp linh khí, rèn luyện căn cơ. Mỗi buổi học là một lần tích lũy để tiến xa hơn.', color: '#8bc7a9', robe: '#527f75' },
  { name: 'Trúc Cơ', title: 'Vững nền đạo pháp', description: 'Căn cơ dần vững chắc, kiếm tâm bắt đầu hình thành. Thói quen đều đặn chính là nền móng tu hành.', color: '#76c7cf', robe: '#44788a' },
  { name: 'Kim Đan', title: 'Kết đan ngưng thần', description: 'Linh lực hội tụ thành Kim Đan. Kiến thức tích lũy đã bắt đầu kết nối và chuyển hóa thành sức mạnh.', color: '#eac676', robe: '#8b7050' },
  { name: 'Nguyên Anh', title: 'Nguyên thần thức tỉnh', description: 'Nguyên Anh thành hình, thần thức mở rộng. Người tu luyện tự tin vận dụng những điều đã học.', color: '#d99ce6', robe: '#79618b' },
  { name: 'Hóa Thần', title: 'Thần ý hợp nhất', description: 'Thần thức và kiếm ý hòa làm một. Sự bền bỉ giúp mỗi lần luyện tập trở nên sâu sắc hơn.', color: '#a9aaf2', robe: '#5d669a' },
  { name: 'Luyện Hư', title: 'Ngộ đạo hư không', description: 'Vượt qua giới hạn cũ, lĩnh ngộ những điều tinh tế. Con đường phía trước ngày càng rộng mở.', color: '#8ee5df', robe: '#457b86' },
  { name: 'Hợp Thể', title: 'Thiên nhân hợp nhất', description: 'Kiến thức và thực hành hòa quyện. Kiếm khí và linh quang cùng tỏa sáng quanh thân.', color: '#e6aabf', robe: '#8b596f' },
  { name: 'Đại Thừa', title: 'Kiếm tiên đại thành', description: 'Đạo tâm viên mãn, kiếm ý xuyên mây. Một chặng đường dài được tạo nên từ vô số phút học tập.', color: '#ffe6a1', robe: '#ece2c7' },
];

function getLevel(xp: number) {
  let level = 1;
  let remaining = xp;
  while (remaining >= level * 30 && level < 10000) { remaining -= level * 30; level++; }
  return { level, remaining, needed: level * 30 };
}

export function CultivationPage() {
  const [progress, setProgress] = useState(readCultivation);
  const [selected, setSelected] = useState<number | null>(null);
  const [sound, setSound] = useState(false);
  useEffect(() => {
    const refresh = () => setProgress(readCultivation());
    window.addEventListener('storage', refresh);
    window.addEventListener('cultivation-change', refresh);
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener('cultivation-change', refresh); };
  }, []);
  const xp = Math.floor((progress.review + progress.practice + progress.kaiwa) / 60000);
  const { level, remaining, needed } = getLevel(xp);
  const current = Math.min(Math.floor((level - 1) / 3), realms.length - 1);
  const shown = selected ?? current;
  const realm = realms[shown];
  return <div className="cultivation-page">
    <header className="cult-heading"><div><span className="cult-eyebrow">HÀNH TRÌNH CỦA BẠN</span><h1>Tu luyện thành tiên</h1><p>Mỗi phút học tập là một bước tiến trên con đường tu hành.</p></div><Sparkles size={30} /></header>
    <div className="cult-layout">
      <section className="cult-stage" style={{ '--aura': realm.color, '--robe': realm.robe } as React.CSSProperties} aria-label={`Nhân vật ${realm.name}`}>
        <div className="cult-stage-top"><span>TIÊN LỘ · {String(shown + 1).padStart(2, '0')}</span><span>{shown === current ? 'CẢNH GIỚI HIỆN TẠI' : 'XEM TRƯỚC'}</span></div>
        <div className="cult-scene" aria-hidden="true"><div className="cult-halo" /><div className="cult-orbit orbit-one" /><div className="cult-orbit orbit-two" />
          <CultivatorModel rank={shown} color={realm.color} robe={realm.robe} sound={sound} /></div>
        {shown === 7 && <button className="cult-sound" type="button" onClick={() => setSound(value => !value)} aria-pressed={sound}>{sound ? '🔊 Tắt tiếng sấm' : '🔇 Bật tiếng sấm'}</button>}
        <div className="cult-stage-bottom"><button type="button" aria-label="Cảnh giới trước" disabled={shown === 0} onClick={() => setSelected(shown - 1)}><ArrowLeft size={18}/></button><div><small>{realm.title}</small><h2>{realm.name}</h2></div><button type="button" aria-label="Cảnh giới tiếp theo" disabled={shown === realms.length - 1} onClick={() => setSelected(shown + 1)}><ArrowRight size={18}/></button></div>
      </section>
      <div className="cult-details"><section className="cult-panel"><span className="cult-eyebrow">CẢNH GIỚI HIỆN TẠI</span><div className="cult-level"><div><h2>{realms[current].name}</h2><p>Cấp {level} · {realms[current].title}</p></div><div className="cult-level-badge">{level}</div></div><div className="cult-progress-label"><span>Tiến độ lên cấp</span><strong>{remaining} / {needed} EXP</strong></div><div className="cult-progress" role="progressbar" aria-label="Kinh nghiệm lên cấp" aria-valuemin={0} aria-valuemax={needed} aria-valuenow={remaining}><span style={{ width: `${remaining / needed * 100}%` }}/></div><div className="cult-meta"><span>Tổng kinh nghiệm</span><strong>{xp} EXP</strong></div><p className="cult-hint">1 phút học tích cực = 1 EXP. Thời gian được tính khi học bộ thẻ, luyện viết hoặc Kaiwa; tự dừng khi ẩn tab hoặc không thao tác trong 1 phút.</p></section>
        <section className="cult-panel"><span className="cult-eyebrow">CẢNH GIỚI ĐANG XEM</span><h2>{realm.name}</h2><p className="cult-description">{realm.description}</p><div className="cult-realm-list">{realms.map((item, index) => <button key={item.name} type="button" className={`${index === shown ? 'selected' : ''} ${index <= current ? 'unlocked' : ''}`} onClick={() => setSelected(index)} aria-pressed={index === shown}><span>{String(index + 1).padStart(2, '0')}</span>{item.name}{index === current && <b>Hiện tại</b>}</button>)}</div><p className="cult-hint">Mỗi 3 cấp mở một cảnh giới. Nhấn vào tên để xem trước; tiến trình được lưu trên trình duyệt này.</p></section></div>
    </div>
  </div>;
}
