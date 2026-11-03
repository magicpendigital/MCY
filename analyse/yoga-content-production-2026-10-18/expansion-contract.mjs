// Schema source for the metadata-only expansion catalog. Importing this module does not write files.
export const expansionSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://motchutyoga.local/contracts/yoga-expansion-1",
  "title": "MCY expansion metadata only — no instructional/public use",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "schemaVersion": {
      "const": "mcy-yoga-expansion-1"
    },
    "taxonomyVersion": {
      "const": "mcy-yoga-taxonomy-1"
    },
    "status": {
      "const": "metadata_only"
    },
    "scopeNote": {
      "type": "string",
      "minLength": 1
    },
    "nonExhaustive": {
      "const": true
    },
    "sources": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/source"
      },
      "minItems": 1
    },
    "taxonomies": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/taxonomy"
      },
      "minItems": 1
    },
    "entities": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/entity"
      },
      "minItems": 1
    },
    "productionStatus": {
      "const": "metadata_only"
    },
    "learnerVisible": {
      "const": false
    },
    "recommendationEligible": {
      "const": false
    },
    "publishStatus": {
      "const": "unpublished"
    },
    "review": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "expert": {
          "const": "pending"
        },
        "rights": {
          "const": "pending"
        },
        "editorial": {
          "const": "pending"
        },
        "accessibility": {
          "const": "pending"
        }
      },
      "required": [
        "expert",
        "rights",
        "editorial",
        "accessibility"
      ]
    },
    "approvalRecords": {
      "type": "array",
      "maxItems": 0
    }
  },
  "required": [
    "schemaVersion",
    "taxonomyVersion",
    "status",
    "scopeNote",
    "nonExhaustive",
    "sources",
    "taxonomies",
    "entities",
    "productionStatus",
    "learnerVisible",
    "recommendationEligible",
    "publishStatus",
    "review",
    "approvalRecords"
  ],
  "$defs": {
    "assertionRef": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "sourceId": {
          "type": "string",
          "minLength": 1
        },
        "scope": {
          "enum": [
            "name_vi",
            "name_en",
            "name_sa",
            "alias",
            "conceptual_topic",
            "classification",
            "relation",
            "tradition_context"
          ]
        },
        "locator": {
          "type": "string",
          "minLength": 1
        }
      },
      "required": [
        "sourceId",
        "scope",
        "locator"
      ]
    },
    "name": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "text": {
          "type": "string",
          "minLength": 1
        },
        "locale": {
          "enum": [
            "vi-VN",
            "en",
            "sa"
          ]
        },
        "provenance": {
          "enum": [
            "source_attested",
            "editorial_translation",
            "editorial_label"
          ]
        },
        "sourceAttested": {
          "type": "boolean"
        },
        "conceptualSourceRefs": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/assertionRef"
          },
          "minItems": 0
        },
        "attestationSourceRefs": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/assertionRef"
          },
          "minItems": 0
        },
        "reviewStatus": {
          "const": "pending"
        }
      },
      "required": [
        "text",
        "locale",
        "provenance",
        "sourceAttested",
        "conceptualSourceRefs",
        "attestationSourceRefs",
        "reviewStatus"
      ]
    },
    "nullableName": {
      "anyOf": [
        {
          "$ref": "#/$defs/name"
        },
        {
          "type": "null"
        }
      ]
    },
    "source": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^[a-z][a-z0-9-]*$"
        },
        "kind": {
          "enum": [
            "web_teaching",
            "local_draft_inventory"
          ]
        },
        "url": {
          "type": [
            "string",
            "null"
          ]
        },
        "repoPath": {
          "type": [
            "string",
            "null"
          ]
        },
        "sha256": {
          "anyOf": [
            {
              "type": "string",
              "pattern": "^[a-f0-9]{64}$"
            },
            {
              "type": "null"
            }
          ]
        },
        "title": {
          "type": "string",
          "minLength": 1
        },
        "publisher": {
          "type": "string",
          "minLength": 1
        },
        "accessedAt": {
          "type": "string",
          "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"
        },
        "usage": {
          "const": "nomenclature_and_classification_only"
        },
        "limits": {
          "type": "string",
          "minLength": 1
        }
      },
      "required": [
        "id",
        "kind",
        "url",
        "repoPath",
        "sha256",
        "title",
        "publisher",
        "accessedAt",
        "usage",
        "limits"
      ]
    },
    "taxonomy": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^[a-z][a-z0-9.-]*$"
        },
        "domain": {
          "enum": [
            "posture",
            "skill",
            "knowledge",
            "local_topic"
          ]
        },
        "label": {
          "$ref": "#/$defs/name"
        },
        "parentId": {
          "type": [
            "string",
            "null"
          ]
        },
        "classificationStatus": {
          "const": "editorial_proposed"
        }
      },
      "required": [
        "id",
        "domain",
        "label",
        "parentId",
        "classificationStatus"
      ]
    },
    "alias": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "name": {
          "$ref": "#/$defs/name"
        },
        "context": {
          "type": "string",
          "minLength": 1
        }
      },
      "required": [
        "name",
        "context"
      ]
    },
    "relation": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "type": {
          "enum": [
            "variant_of",
            "related_to",
            "has_named_component",
            "study_topic_for"
          ]
        },
        "targetId": {
          "type": "string",
          "minLength": 1
        },
        "basis": {
          "enum": [
            "source_attested",
            "editorial_topic"
          ]
        },
        "sourceRefs": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/assertionRef"
          },
          "minItems": 1
        },
        "reviewStatus": {
          "const": "pending"
        }
      },
      "required": [
        "type",
        "targetId",
        "basis",
        "sourceRefs",
        "reviewStatus"
      ]
    },
    "inventoryRef": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "courseId": {
          "enum": [
            "gentle",
            "poses",
            "sequences"
          ]
        },
        "lessonId": {
          "type": "string",
          "pattern": "^(?:0[1-9]|[12][0-9]|3[0-8])$"
        },
        "youtubeId": {
          "type": "string",
          "pattern": "^[A-Za-z0-9_-]{11}$"
        }
      },
      "required": [
        "courseId",
        "lessonId",
        "youtubeId"
      ]
    },
    "contentLink": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "unitId": {
          "type": "string",
          "minLength": 1
        },
        "revision": {
          "type": "string",
          "pattern": "^r[1-9][0-9]*$"
        },
        "locale": {
          "const": "vi-VN"
        },
        "unitPath": {
          "type": "string",
          "pattern": "^content/yoga-library/units/[a-z0-9-]+/r[1-9][0-9]*\\.json$"
        },
        "relation": {
          "enum": [
            "related_topic",
            "component_topic",
            "unverified_topic"
          ]
        },
        "inventoryRefs": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/inventoryRef"
          },
          "minItems": 0
        },
        "scopeNote": {
          "type": "string",
          "minLength": 1
        }
      },
      "required": [
        "unitId",
        "revision",
        "locale",
        "unitPath",
        "relation",
        "inventoryRefs",
        "scopeNote"
      ]
    },
    "entity": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^mcy\\.expansion\\.[a-z0-9.-]+$"
        },
        "kind": {
          "enum": [
            "pose_family",
            "pose_variant",
            "skill",
            "knowledge_topic",
            "local_unresolved_topic"
          ]
        },
        "names": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "vi": {
              "$ref": "#/$defs/nullableName"
            },
            "en": {
              "$ref": "#/$defs/nullableName"
            },
            "sa": {
              "$ref": "#/$defs/nullableName"
            }
          },
          "required": [
            "vi",
            "en",
            "sa"
          ]
        },
        "aliases": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/alias"
          },
          "minItems": 0
        },
        "taxonomyRefs": {
          "type": "array",
          "items": {
            "type": "string",
            "minLength": 1
          },
          "minItems": 1
        },
        "contextRefs": {
          "type": "array",
          "items": {
            "type": "string",
            "minLength": 1
          },
          "minItems": 0
        },
        "relations": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/relation"
          },
          "minItems": 0
        },
        "existingContentLinks": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/contentLink"
          },
          "minItems": 0
        },
        "sourceRefs": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/assertionRef"
          },
          "minItems": 1
        },
        "nomenclatureStatus": {
          "enum": [
            "pending",
            "unresolved"
          ]
        },
        "productionStatus": {
          "const": "metadata_only"
        },
        "learnerVisible": {
          "const": false
        },
        "recommendationEligible": {
          "const": false
        },
        "publishStatus": {
          "const": "unpublished"
        },
        "review": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "expert": {
              "const": "pending"
            },
            "rights": {
              "const": "pending"
            },
            "editorial": {
              "const": "pending"
            },
            "accessibility": {
              "const": "pending"
            }
          },
          "required": [
            "expert",
            "rights",
            "editorial",
            "accessibility"
          ]
        },
        "approvalRecords": {
          "type": "array",
          "maxItems": 0
        }
      },
      "required": [
        "id",
        "kind",
        "names",
        "aliases",
        "taxonomyRefs",
        "contextRefs",
        "relations",
        "existingContentLinks",
        "sourceRefs",
        "nomenclatureStatus",
        "productionStatus",
        "learnerVisible",
        "recommendationEligible",
        "publishStatus",
        "review",
        "approvalRecords"
      ]
    }
  }
};
