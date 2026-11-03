from pathlib import Path
import hashlib
import json

BASE = Path(__file__).resolve().parent
CAPTURES = BASE / "private-evidence" / "browser-contacts"
capture_records = json.loads((CAPTURES / "CAPTURE-OBSERVATIONS.json").read_text(encoding="utf-8-sig"))

visible = {
    0: {
        "visibleColumns": [1, 3], "blackColumns": [2, 4],
        "visualIdentity": "Deep supine backbend / low-wheel family; exact arm and head-support variant needs a clearer frame and expert confirmation.",
        "pixelObservations": [
            "Column 1: seated with knees bent, feet on mat, elbows bent and hands behind head.",
            "Column 3: feet support a strongly arched body; forearms and head are close to the mat. Contact and load on the head cannot be established from this small side-view frame.",
        ],
        "writerImplications": ["Do not replace this with a standard Bridge illustration.", "Do not teach head/neck load or a forearm-wheel entry from these samples.", "Need clear support points and a reviewed entry/exit before instructional production."],
        "identityConfidence": "family_only",
    },
    1: {
        "visibleColumns": [1, 2, 3, 4], "blackColumns": [],
        "visualIdentity": "All-fours Cat–Cow spinal flexion/extension pair.",
        "pixelObservations": [
            "All four panels show both hands and knees on the mat, lower legs and tops of feet behind.",
            "Columns 1 and 4 show rounded back with head lowered; columns 2 and 3 show chest moving forward/up with extended spinal curve and head raised.",
        ],
        "writerImplications": ["A movement pair, not two automatically separate lessons.", "Samples do not establish breathing instructions, repetitions, pace, full entry/exit or audience suitability.", "Do not copy the embedded source caption claiming beginners as a reviewed MCY eligibility statement."],
        "identityConfidence": "visually_supported_family",
    },
    8: {
        "visibleColumns": [1, 2], "blackColumns": [3, 4],
        "visualIdentity": "Kneeling, one-hand-supported backbend with the other arm reaching overhead; seated arm movement also appears.",
        "pixelObservations": [
            "Column 1: both knees and lower legs remain on mat; one palm is planted behind/beside the body while the torso arches back and the other arm reaches overhead.",
            "Column 2: hips are seated close to heels, torso upright, both arms open upward/outward.",
        ],
        "writerImplications": ["Do not label the exact local movement as standard two-hands-to-heels Camel solely from title.", "Asymmetric support and backbend/arm transition require review; opposite side cannot be inferred from these two samples.", "Source caption mentioning beginners is an observed caption, not a suitability finding."],
        "identityConfidence": "visually_supported_variant_family",
    },
    10: {
        "visibleColumns": [1, 2, 3, 4], "blackColumns": [],
        "visualIdentity": "Cobra-like prone press-up alternating with a knees-down, hips-raised low-chest transition.",
        "pixelObservations": [
            "Columns 1 and 3: palms on mat, arms relatively straight, chest lifted, pelvis/legs low, legs extending behind with tops of feet on mat.",
            "Columns 2 and 4: knees remain on mat, hips are flexed/raised and chest/head lie close to mat while elbows bend behind the torso.",
        ],
        "writerImplications": ["The title phiên bản dễ does not establish Baby Cobra / low Cobra or beginner suitability.", "Do not silently add or teach a knees–chest–chin transition based only on these stills; exact movement and load distribution need full review.", "Keep Cobra family and low/chest transition distinct in observation fields."],
        "identityConfidence": "visually_supported_movement_family",
    },
}
records = []
for index, capture in enumerate(capture_records):
    source = Path(r"D:\nilaza\documents\Tư thế lẻ") / capture["heading"]
    screenshot = CAPTURES / f"pose-{index}.png"
    info = visible.get(index, {
        "visibleColumns": [], "blackColumns": [],
        "visualIdentity": None,
        "pixelObservations": ["Screenshot shows a narrow, wrapped page at the left with the video grid below the captured viewport; the remainder is blank. No pose pixels are visible."],
        "writerImplications": ["Re-capture with stable viewport/layout before using this screenshot as pose evidence."],
        "identityConfidence": "not_observed",
    })
    records.append({
        "localIndex": index, "sourceFileName": source.name, "sourcePath": str(source),
        "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(), "sourceBytes": source.stat().st_size,
        "sourceDurationSecondsBrowser": capture["frames"][0]["duration"],
        "capturePath": str(screenshot.relative_to(BASE)), "captureSha256": hashlib.sha256(screenshot.read_bytes()).hexdigest(),
        "captureProtocol": "Root CUA browser screenshot; all requested timestamps were read before capture, but timestamp/readyState alone is not treated as visible pixel evidence.",
        "browserMeasurements": capture["frames"],
        "pixelReview": info,
        "fullClipWatched": False, "audioReviewed": False, "leftRightConfirmed": False,
        "youtubeBindingVerified": False, "expertApproved": False, "rightsApproved": False,
        "evidenceUse": "private_editorial_identity_research_only_not_learner_asset",
    })
payload = {
    "schemaVersion": "mcy-private-source-observations/1", "date": "2026-10-18", "timezone": "Asia/Bangkok",
    "scope": "13 exact local MOV originals; still sampling only; no remote YouTube binding or clinical/suitability review",
    "status": "partial_pixels_recheck_required", "observedRecordCount": len(visible),
    "recheckFullCaptures": [2,3,4,5,6,7,9,11,12], "recheckBlackColumns": {"0": [2,4], "8": [3,4]},
    "records": records,
}
(BASE / "SOURCE-OBSERVATIONS.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({"records":len(records), "recordsWithVisiblePosePixels":len(visible), "fullRecheck":payload["recheckFullCaptures"]}))
