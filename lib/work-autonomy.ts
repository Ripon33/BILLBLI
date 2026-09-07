export type WorkAutonomy =
  | "auto"
  | "review"
  | "approval"
  | "restricted";

export type WorkAutonomyInput = {
  autonomy: WorkAutonomy;
  authorized: boolean;
};

export type WorkAutonomyDecision = {
  allowed: boolean;
  requiresReview: boolean;
  requiresAuthorization: boolean;
};

export function evaluateWorkAutonomy(
  input: WorkAutonomyInput,
): WorkAutonomyDecision {
  switch (input.autonomy) {
    case "auto":
      return {
        allowed: true,
        requiresReview: false,
        requiresAuthorization: false,
      };

    case "review":
      return {
        allowed: false,
        requiresReview: true,
        requiresAuthorization: false,
      };

    case "approval":
      return input.authorized
        ? {
            allowed: true,
            requiresReview: false,
            requiresAuthorization: false,
          }
        : {
            allowed: false,
            requiresReview: false,
            requiresAuthorization: true,
          };

    case "restricted":
      return {
        allowed: false,
        requiresReview: false,
        requiresAuthorization: true,
      };
  }
}
