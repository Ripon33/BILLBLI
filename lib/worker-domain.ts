export type WorkerType =
  | "hr_assistant"
  | "accountant"
  | "digital_marketer"
  | "sales_assistant"
  | "operations_manager"
  | "customer_support"
  | "research_analyst"
  | "custom";

export type WorkerProfile = {
  type: WorkerType;
  displayName: string;
  description: string;
  defaultInstructions: string;
  capabilities: string[];
};

export const WORKER_PROFILES: Record<WorkerType, WorkerProfile> = {
  hr_assistant: {
    type: "hr_assistant",
    displayName: "HR Assistant",
    description: "Helps organize and support structured HR work.",
    defaultInstructions:
      "Assist with HR research, organization, documentation, and recommendations while keeping human decisions authoritative.",
    capabilities: [
      "hr_research",
      "hr_documentation",
      "policy_organization",
    ],
  },

  accountant: {
    type: "accountant",
    displayName: "Accountant",
    description: "Helps organize financial information and accounting work.",
    defaultInstructions:
      "Assist with accounting research, financial organization, reconciliation support, and analysis without making final financial decisions.",
    capabilities: [
      "financial_research",
      "financial_organization",
      "reconciliation_support",
    ],
  },

  digital_marketer: {
    type: "digital_marketer",
    displayName: "Digital Marketer",
    description: "Helps research, plan, and organize digital marketing work.",
    defaultInstructions:
      "Assist with marketing research, campaign planning, audience analysis, content planning, and performance recommendations.",
    capabilities: [
      "marketing_research",
      "campaign_planning",
      "audience_analysis",
      "content_planning",
    ],
  },

  sales_assistant: {
    type: "sales_assistant",
    displayName: "Sales Assistant",
    description: "Helps organize sales research, opportunities, and follow-up work.",
    defaultInstructions:
      "Assist with sales research, lead organization, opportunity analysis, and follow-up recommendations.",
    capabilities: [
      "sales_research",
      "lead_organization",
      "opportunity_analysis",
      "follow_up_planning",
    ],
  },

  operations_manager: {
    type: "operations_manager",
    displayName: "Operations Manager",
    description: "Helps organize operational planning and process work.",
    defaultInstructions:
      "Assist with operational research, process organization, planning, issue analysis, and improvement recommendations.",
    capabilities: [
      "operations_research",
      "process_analysis",
      "planning",
      "issue_analysis",
    ],
  },

  customer_support: {
    type: "customer_support",
    displayName: "Customer Support",
    description: "Helps organize customer support research and response workflows.",
    defaultInstructions:
      "Assist with support research, issue classification, response drafting, and service-quality recommendations.",
    capabilities: [
      "support_research",
      "issue_classification",
      "response_drafting",
      "service_analysis",
    ],
  },

  research_analyst: {
    type: "research_analyst",
    displayName: "Research Analyst",
    description: "Helps conduct structured research and analysis.",
    defaultInstructions:
      "Assist with research, source analysis, synthesis, comparison, and evidence-based recommendations.",
    capabilities: [
      "research",
      "source_analysis",
      "synthesis",
      "comparison",
    ],
  },

  custom: {
    type: "custom",
    displayName: "Custom Worker",
    description: "A worker defined by the user's natural-language professional goal.",
    defaultInstructions:
      "Follow the user's defined worker context while remaining subject to BILLBLI permission, authorization, ownership, and lifecycle controls.",
    capabilities: [
      "custom_research",
      "custom_analysis",
      "custom_planning",
    ],
  },
};
