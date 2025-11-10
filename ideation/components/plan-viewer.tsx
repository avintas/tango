"use client";

import type { IdeationPlan } from "../lib/types";

interface PlanViewerProps {
  plan: IdeationPlan;
  onEdit?: () => void;
  onExecute?: () => void;
}

/**
 * Plan Viewer Component
 * Displays an ideation plan with details
 */
export function PlanViewer({ plan, onEdit, onExecute }: PlanViewerProps) {
  return (
    <div className="space-y-4 p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            {plan.metadata.description || `Plan: ${plan.type}`}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Created: {new Date(plan.metadata.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Edit
            </button>
          )}
          {onExecute && (
            <button
              onClick={onExecute}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500"
            >
              Execute
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">Type:</span>{" "}
          <span className="text-gray-900">{plan.type}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Selections:</span>{" "}
          <span className="text-gray-900">{plan.selections.length}</span>
        </div>
      </div>

      {plan.parameters.theme && (
        <div>
          <span className="text-sm font-medium text-gray-700">Theme:</span>{" "}
          <span className="text-sm text-gray-900">{plan.parameters.theme}</span>
        </div>
      )}

      {plan.parameters.category && (
        <div>
          <span className="text-sm font-medium text-gray-700">Category:</span>{" "}
          <span className="text-sm text-gray-900">
            {plan.parameters.category}
          </span>
        </div>
      )}

      {plan.parameters.contentTypes &&
        plan.parameters.contentTypes.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-700">
              Content Types:
            </span>{" "}
            <span className="text-sm text-gray-900">
              {plan.parameters.contentTypes.join(", ")}
            </span>
          </div>
        )}

      {plan.selections.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Selected Items
          </h4>
          <div className="space-y-1">
            {plan.selections.map((selection, idx) => (
              <div
                key={selection.id}
                className="text-xs text-gray-600 flex items-center gap-2"
              >
                <span className="font-medium">#{idx + 1}</span>
                <span>
                  {selection.type} (ID: {selection.contentId})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
