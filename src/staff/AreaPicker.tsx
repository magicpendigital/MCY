import { LESSON_AREAS } from "../courses/lessonFinder";

// The browse areas an author files a lesson under. The learner finder and the lesson tags use exactly this choice, so a lesson is
// never filed by guessing from its title. Nothing selected means the lesson is not offered under any area.
export function AreaPicker({ value, onChange, disabled }: { value: string[]; onChange: (next: string[]) => void; disabled?: boolean }) {
  const toggle = (id: string, on: boolean) => onChange(LESSON_AREAS.map(a => a.id).filter(x => (x === id ? on : value.includes(x))));
  return <fieldset className="owner-field owner-area-picker" disabled={disabled}>
    <legend>Mục tìm bài (học viên tìm theo vùng)</legend>
    {LESSON_AREAS.map(area => <label key={area.id}><input type="checkbox" checked={value.includes(area.id)} onChange={e => toggle(area.id, e.target.checked)} /> {area.label}</label>)}
    <small>Chỉ chọn những vùng bài thật sự tập trung vào. Không chọn mục nào thì bài không hiện trong mục tìm theo vùng.</small>
  </fieldset>;
}
