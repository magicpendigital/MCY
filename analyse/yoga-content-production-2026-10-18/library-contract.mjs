export const schemaVersion = 'mcy-yoga-draft-1';
const string = { type:'string' };
const nonempty = { type:'string', minLength:1 };
const nullableString = { type:['string','null'] };
const strings = { type:'array', items:nonempty };
const ref = name => ({ $ref:`#/$defs/${name}` });
const object = (properties, required=Object.keys(properties)) => ({type:'object',additionalProperties:false,properties,required});
const sha = {type:'string',pattern:'^[a-f0-9]{64}$'};
const nullableSha = {anyOf:[sha,{type:'null'}]};
const pendingReview = object({expert:{const:'pending'},rights:{const:'pending'},editorial:{const:'pending'},accessibility:{const:'pending'},approvalRecords:{type:'array',maxItems:0}});
export const unitSchema = {
  $schema:'https://json-schema.org/draft/2020-12/schema',
  $id:'https://motchutyoga.local/contracts/yoga-draft-1',
  title:'MCY local yoga content draft — no learner publication',
  ...object({
    schemaVersion:{const:schemaVersion}, id:{type:'string',pattern:'^mcy\\.[a-z0-9.-]+$'}, revision:{type:'string',pattern:'^r[1-9][0-9]*$'}, legacyAliases:strings,
    locale:{const:'vi-VN'},kind:{enum:['pose_education','movement_education','transition_education','sequence_education','source_record']},seriesId:nullableString,
    productionStatus:{enum:['editorial_draft','media_draft','metadata_only','brief_blocked']}, learnerVisible:{const:false}, recommendationEligible:{const:false}, publishStatus:{const:'unpublished'},
    title:nonempty,shortTitle:nonempty,intro:string,scope:string,learningObjectives:strings,audience:string,prerequisites:strings,preparation:strings,stopGuidance:string,alternatives:strings,
    readTimeSecondsEstimate:{type:['integer','null'],minimum:1}, practiceDurationSeconds:{const:null},
    sourceRefs:{type:'array',items:ref('sourceRef')},sourceObservations:{type:'array',items:ref('observation')},
    steps:{type:'array',items:ref('step')},media:{type:'array',items:ref('media')},assetBriefs:{type:'array',items:ref('assetBrief')},sources:{type:'array',items:ref('source')},
    review:pendingReview,blockers:strings,changeLog:strings,provenance:ref('provenance'),
    subtitle:string,readTimeNote:string,ending:string,reviewQuestion:string,reviewOptions:strings,preferredMediaVariant:{enum:['photo_ai','illustration']},legacyPayload:{type:'object'},
  },['schemaVersion','id','revision','legacyAliases','locale','kind','seriesId','productionStatus','learnerVisible','recommendationEligible','publishStatus','title','shortTitle','intro','scope','learningObjectives','audience','prerequisites','preparation','stopGuidance','alternatives','readTimeSecondsEstimate','practiceDurationSeconds','sourceRefs','sourceObservations','steps','media','assetBriefs','sources','review','blockers','changeLog','provenance']),
  $defs:{
    sourceRef:object({courseId:{enum:['gentle','poses','sequences']},lessonId:{type:'string',pattern:'^(?:0[1-9]|[12][0-9]|3[0-8])$'},youtubeId:{type:'string',pattern:'^[A-Za-z0-9_-]{11}$'},relation:{enum:['topic_reference','unverified']},contentObserved:{const:false}}),
    observation:object({id:nonempty,fileName:nonempty,sourceSha256:sha,timestampsSeconds:{type:'array',items:{type:'number',minimum:0}},visualOnly:{const:true},audioObserved:{const:false},notes:nonempty,evidenceRef:nonempty}),
    step:object({id:{type:'string',pattern:'^[a-z0-9-]+$'},order:{type:'integer',minimum:1},title:nonempty,body:string,detail:string,entry:string,exit:string,alternative:string,stopCue:string,sourceIds:strings,evidenceRefs:strings,mediaIds:strings}),
    media:object({id:nonempty,stepId:nonempty,variant:{enum:['photo_ai','illustration']},status:{enum:['draft_present','not_produced','identity_blocked']},path:nullableString,sha256:nullableSha,mime:{enum:['image/png','image/jpeg','image/webp',null]},width:{type:['integer','null'],minimum:1},height:{type:['integer','null'],minimum:1},alt:string,caption:string,synthetic:{const:true},disclosure:nonempty,rightsStatus:{const:'pending'},expertStatus:{const:'pending'},provenance:ref('mediaProvenance')}),
    mediaProvenance:object({tool:nullableString,createdAt:nullableString,sourcePath:nullableString,sourceSha256:nullableSha,promptRef:nullableString,notes:string}),
    assetBrief:object({id:nonempty,stepId:nonempty,mediaId:nonempty,status:{enum:['draft_present','not_produced','identity_blocked']},path:nullableString,sha256:nullableSha,brief:nonempty,sourceIds:strings,evidenceRefs:strings}),
    source:object({id:nonempty,title:nonempty,url:nonempty,use:nonempty,accessedAt:nullableString}),
    provenance:object({createdAt:nonempty,authoring:{enum:['ai_assisted_original','imported_ai_assisted_draft']},sourceFiles:{type:'array',items:object({path:nonempty,sha256:sha})},notes:nonempty}),
  },
};

export const pending = () => ({expert:'pending',rights:'pending',editorial:'pending',accessibility:'pending',approvalRecords:[]});

export const unitTemplate = {
 schemaVersion,id:'mcy.pose.example',revision:'r1',legacyAliases:[],locale:'vi-VN',kind:'pose_education',seriesId:null,
 productionStatus:'brief_blocked',learnerVisible:false,recommendationEligible:false,publishStatus:'unpublished',title:'Thay bằng tên đã xác định',shortTitle:'Tên ngắn',intro:'',scope:'',learningObjectives:[],audience:'',prerequisites:[],preparation:[],stopGuidance:'',alternatives:[],readTimeSecondsEstimate:null,practiceDurationSeconds:null,
 sourceRefs:[],sourceObservations:[],steps:[],media:[],assetBriefs:[],sources:[],review:pending(),blockers:['Chưa biên soạn; mẫu không phải nội dung hướng dẫn.'],changeLog:['Mẫu hợp đồng; không nhập unit này vào kho.'],provenance:{createdAt:'2026-10-18',authoring:'ai_assisted_original',sourceFiles:[],notes:'Template only.'},
};
