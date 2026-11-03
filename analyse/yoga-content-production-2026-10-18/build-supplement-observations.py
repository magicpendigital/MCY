from pathlib import Path
import hashlib, json

BASE = Path(__file__).resolve().parent
INITIAL = json.loads((BASE / 'SOURCE-OBSERVATIONS.json').read_text(encoding='utf-8'))
DIR = BASE / 'private-evidence/browser-contacts/supplement'
captures = json.loads((DIR / 'CAPTURE-OBSERVATIONS.json').read_text(encoding='utf-8-sig'))
data = {
 0: ([1,2],[3,4], 'Supine deep backbend with elbows/forearms on mat, head very close to mat; exact head load unknown.', ['Column1 shows seated arms-up/elbows-bent preparation.', 'Column2 shows feet planted, body arched upward, elbows/forearms at mat and head near mat; caption addresses elbows. This is not standard Bridge and not a straight-arm Wheel demonstration.']),
 1: ([1,2,3],[4], 'All-fours Cat–Cow pair.', ['Rounded spine/head lowered in column1; extended curve/chest lifted in columns2–3. Initial capture additionally shows column4 rounded.']),
 2: ([],[1,2,3,4], None, ['All four video panels are black. Correct timestamps and readyState do not supply visible pose evidence.']),
 3: ([1,2,3,4],[], 'Three-legged Downward Dog family with one leg raised.', ['All four panels contain body pixels despite loading spinners.', 'Two hands and one foot are on mat, other leg raised; hip/foot orientation varies. Still side/three-quarter view cannot quantify hip rotation or loading.']),
 4: ([1,2,3,4],[], 'Cow-Face arm sequence on a cross-legged seated base.', ['Back view: cross-legged seat, arms open; then one elbow above shoulder and other arm behind back; both hands approach behind torso.', 'No stacked-knee full Cow-Face leg arrangement is visible in these samples.']),
 5: ([1,4],[2,3], 'Standing/reaching frame and a forward-fold comparison montage; full transition is missing.', ['Column1 shows person upright on two feet with arms reaching.', 'Column4 shows two comparison panels of a folded/hip-hinged torso, including another scene/person and embedded comparison labels.', 'No continuous fold-to-stand sequence can be reconstructed from these two visible samples.']),
 6: ([3],[1,2,4], 'Wild-Thing / flipped-dog family: one-hand-supported backbend with both feet on floor.', ['Only column3 contains the pose, partly overlaid by a loading spinner.', 'One palm and both feet form visible supports, torso/chest arched upward, free arm reaches behind/overhead. Both knees appear bent; exact hand-side and foot-loading not established.']),
 7: ([2,3],[1,4], 'Crow arm balance and a distinct forearm/elbow-lowered low variant.', ['Column2 shows knees near upper arms, elbows bent and feet lifted in a Crow-like shape.', 'Column3 shows torso/head much lower, elbows/forearms at the mat and feet raised; exact head contact and load cannot be confirmed.', 'The two shapes must not be treated as interchangeable support arrangements or a self-practice progression.']),
 8: ([],[1,2,3,4], None, ['All supplement panels black. Initial capture columns1–2 remain the only visible evidence for this local file.']),
 9: ([1,2],[3,4], 'Cobra-like chest lift alternating with a knees-down, hips-raised low-chest shape.', ['Column1 shows prone chest lift with bent elbows and pelvis/legs low.', 'Column2 shows knees at mat, hips raised/flexed and chest/head near mat with elbows bent; not enough to assert a precise knees–chest–chin technique.']),
 10: ([1,2],[3,4], 'Cobra-like higher chest lift and a low-chest knees-down transition.', ['Visible columns1–2 repeat the two movement shapes in initial capture. Initial capture has all four samples visible.', 'Label phiên bản dễ does not establish Baby Cobra or beginner suitability.']),
 11: ([1,2,3,4],[], 'High Lunge with rear heel lifted; arms-up and hands-at-hips variations.', ['Front foot flat, front knee bent, rear heel lifted on rear forefoot; torso upright.', 'Columns1/4 show arms overhead; columns2/3 hands near hips. No transition to the opposite side is observed.']),
 12: ([1,2,3,4],[], 'All-fours/hips-back low starting shape plus Downward-Dog inverted-V variants.', ['Column1 shows hips near heels and arms reaching forward.', 'Column2 shows inverted V with visibly bent knees; columns3/4 straighter-leg versions. Heels close to floor but exact pressure is not visible.', 'Embedded experience-level captions are source captions, not MCY eligibility findings.']),
}
records=[]
for index,capture in enumerate(captures):
    old=INITIAL['records'][index]
    cols,black,identity,notes=data[index]
    image=DIR/f'pose-{index}.png'
    records.append({
      'localIndex':index,'sourceFileName':old['sourceFileName'],'sourcePath':old['sourcePath'],
      'sourceSha256':old['sourceSha256'],'sourceBytes':old['sourceBytes'],
      'capturePath':str(image.relative_to(BASE)),'captureSha256':hashlib.sha256(image.read_bytes()).hexdigest(),
      'browserMeasurements':capture['frames'],'visibleColumns':cols,'blackColumns':black,
      'visibleTimestampsSeconds':[capture['frames'][c-1]['actualTime'] for c in cols],
      'visualIdentity':identity,'pixelObservations':notes,
      'fullClipWatched':False,'audioReviewed':False,'leftRightConfirmed':False,
      'youtubeBindingVerified':False,'expertApproved':False,'rightsApproved':False,
      'evidenceUse':'private_editorial_identity_research_only_not_learner_asset',
    })
payload={
 'schemaVersion':'mcy-private-source-observations/1','date':'2026-10-18','timezone':'Asia/Bangkok',
 'initialEvidence':{'path':'SOURCE-OBSERVATIONS.json','sha256':hashlib.sha256((BASE/'SOURCE-OBSERVATIONS.json').read_bytes()).hexdigest()},
 'status':'supplemental_partial_still_samples','recordCount':13,'supplementRecordsWithVisiblePixels':11,
 'cumulativeRecordsWithVisiblePixels':12,'cumulativeStillUnobservedIndices':[2],
 'scope':'Visible-pixel reading only. Initial failed/partial captures retained. Neither timestamps nor loading/readiness are treated as proof of video pixels. No safety classification, full-video, audio or remote YouTube observation.',
 'records':records,
}
(BASE/'SOURCE-OBSERVATIONS-supplement.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'records':len(records),'supplementVisible':11,'cumulativeVisible':12,'unobserved':[2]}))
