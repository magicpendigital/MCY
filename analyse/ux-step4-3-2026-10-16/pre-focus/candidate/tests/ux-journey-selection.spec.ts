import { expect, test, type Page } from '@playwright/test';
import type { Snapshot } from '../src/Prototype';

// Mount the real Journey and runtime with synthetic state; no Auth/session/provider path is used.
async function mount(page: Page, patch: Record<string, unknown> = {}, device = 'iphone') {
  await page.route('https://**/*', route => route.abort('blockedbyclient'));
  await page.goto(`/?mode=review&device=${device}`);
  await page.evaluate(async patch => {
    // Use Vite's resolved URLs (including optimizer revision) to share the app's React instance.
    const moduleSource = await (await fetch('/src/main.tsx')).text();
    const reactPath = moduleSource.match(/"([^"]+\/react\.js\?[^"]+)"/)![1];
    const domPath = moduleSource.match(/"([^"]+\/react-dom_client\.js\?[^"]+)"/)![1];
    const journeyPath = '/src/JourneyScreen.tsx';
    const runtimePath = '/src/mobile/MobileRuntime.tsx';
    const reactModule = await import(reactPath), domModule = await import(domPath);
    const React = reactModule.default ?? reactModule, { createRoot } = domModule.default ?? domModule;
    const { default: Journey } = await import(journeyPath), { MobileRuntime } = await import(runtimePath);
    document.getElementById('root')!.style.display = 'none';
    const host = document.createElement('div'); document.body.append(host);
    const root = createRoot(host);
    const Blank = () => null;
    const Action = ({children, onClick}: any) => React.createElement('button', {onClick}, children);
    const Note = ({children}: any) => React.createElement('p', null, children);
    let setFixture: any;
    function Fixture() {
      const [state, setState] = React.useState({locale:'vi-VN', signedIn:true, userId:'fictional-a', checkinReadStatus:'loading', backendError:'', remoteCheckins:[], history:[], bodyStyle:'neutral', ...patch});
      setFixture = (value: any) => setState((old: any) => ({...old, ...value}));
      return React.createElement(MobileRuntime, null, React.createElement(Journey, {state, setState, update:setFixture, onStartNext:() => { (window as any).journeyNext = true; }, BodyMapComponent:Blank, BodyStylePickerComponent:Blank, RegionEditorComponent:Blank, ActionComponent:Action, DemoNoteComponent:Note}));
    }
    root.render(React.createElement(Fixture));
    (window as any).patchJourney = (value: any) => setFixture(value);
  }, patch);
  await expect(page.locator('.mcy-journey-page')).toBeVisible();
}
async function patch(page: Page, value: Record<string, unknown>) { await page.evaluate(value => (window as any).patchJourney(value), value); }
function entry(id: string, date: string, time = '08:00'): Snapshot {
  return {id, date, time, day:0, kind:'Ghi riêng', status:'uncertain', observations:[], note:`fixture-${id}`};
}
const old = entry('old','2026-10-12');
const latest = entry('latest','2026-10-13','12:00');
const card = (page: Page) => page.locator('.mcy-snapshot-card');

for (const records of [[old], [old,latest], [entry('morning','2026-10-13'),latest]]) {
  test(`hydration opens latest of ${records.map(item => item.id).join(',')}`, async ({page}) => {
    await mount(page);
    await expect(page.getByRole('status')).toContainText('Đang tải bản ghi');
    await expect(page.locator('.mcy-compare-toggle,.mcy-region-trend,.mcy-journey-empty')).toHaveCount(0);
    await patch(page, {remoteCheckins:records, checkinReadStatus:'ready'});
    await expect(card(page)).toContainText(`fixture-${records.at(-1)!.id}`);
    await expect(card(page)).toContainText('Bạn đã chọn chưa rõ.');
    await expect(page.getByRole('status')).toHaveCount(0);
  });
}

test('an intentional record survives same-day and later-day hydration', async ({page}) => {
  const morning = entry('morning','2026-10-13');
  await mount(page,{remoteCheckins:[morning,latest], checkinReadStatus:'ready'});
  await page.locator('.mcy-record-track button').first().click();
  await expect(card(page)).toContainText('fixture-morning');
  await patch(page,{remoteCheckins:[morning,latest,entry('evening','2026-10-13','18:00'),entry('next','2026-10-14')]});
  await expect(card(page)).toContainText('fixture-morning');
  await expect(page.locator('.mcy-record-track button').first()).toHaveAttribute('aria-pressed','true');
});

test('intentional blank date stays blank; Latest restores the latest snapshot', async ({page}) => {
  await mount(page,{remoteCheckins:[old,latest],checkinReadStatus:'ready'},'pixel-10');
  const blank = page.locator('.mcy-timeline-track button').filter({hasText:'Chưa ghi'}).last();
  await blank.click();
  const chosenDate = await page.locator('.mcy-timeline-track button[aria-pressed=true]').textContent();
  await expect(card(page).locator('.mcy-snapshot-empty')).toBeVisible();
  await patch(page,{remoteCheckins:[old,latest,entry('new','2026-10-13','18:00')]});
  await expect(page.locator('.mcy-timeline-track button[aria-pressed=true]')).toHaveText(chosenDate!);
  await expect(card(page).locator('.mcy-snapshot-empty')).toBeVisible();
  await page.locator('.mcy-timeline-head button').click();
  await expect(card(page)).toContainText('fixture-new');
});

test('account replacement resets selection and comparison before its records arrive', async ({page}) => {
  await mount(page,{remoteCheckins:[old,latest],checkinReadStatus:'ready'});
  await page.locator('.mcy-timeline-track button').filter({hasText:'Chưa ghi'}).last().click();
  await page.locator('.mcy-compare-toggle').click();
  await patch(page,{userId:'fictional-b',remoteCheckins:[],history:[],checkinReadStatus:'loading'});
  await expect(page.getByRole('status')).toContainText('Đang tải bản ghi');
  await expect(page.locator('.mcy-compare-card,.mcy-snapshot-card')).toHaveCount(0);
  await patch(page,{remoteCheckins:[entry('b','2026-10-13')],checkinReadStatus:'ready'});
  await expect(card(page)).toContainText('fixture-b');
  await expect(page.locator('.mcy-compare-card')).toHaveCount(0);
  await expect(page.getByText('fixture-latest')).toHaveCount(0);
});

for (const locale of ['vi-VN','en-US']) test(`empty ${locale} history shows only a useful next action; errors stay distinct`, async ({page}) => {
  await mount(page,{locale,checkinReadStatus:'ready'},locale === 'en-US' ? 'pixel-10' : 'iphone');
  await expect(page.locator('.mcy-journey-empty')).toBeVisible();
  await expect(page.locator('.mcy-snapshot-card,.mcy-region-trend,.mcy-compare-toggle,.mcy-timeline-carousel')).toHaveCount(0);
  await page.getByRole('button',{name:locale === 'en-US' ? 'Start another check-in' : 'Thử lần quay lại tiếp theo'}).click();
  expect(await page.evaluate(() => (window as any).journeyNext)).toBe(true);
  await patch(page,{checkinReadStatus:'error'});
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.locator('.mcy-journey-empty')).toHaveCount(0);
});



test('choosing a date preserves its selected record when another record arrives', async ({page}) => {
  await mount(page,{remoteCheckins:[old,latest],checkinReadStatus:'ready'});
  const dateButton = page.locator('.mcy-timeline-track button').filter({has:page.locator('strong', {hasText:'12'})});
  await dateButton.click();
  await expect(card(page)).toContainText('fixture-old');
  await patch(page,{remoteCheckins:[old,entry('new-old-day','2026-10-12','20:00'),latest]});
  await expect(card(page)).toContainText('fixture-old');
});

test('session history retains its label and honest worse outcome', async ({page}) => {
  await mount(page,{history:[{...old,outcome:'Khó chịu hơn'}],checkinReadStatus:'ready'});
  await expect(card(page)).toContainText('BẢN GHI TRONG PHIÊN');
  await expect(card(page)).toContainText('Khó chịu hơn');
  await expect(page.locator('.mcy-compare-toggle')).toBeVisible();
});
