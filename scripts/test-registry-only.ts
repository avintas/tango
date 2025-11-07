// Simple registry test - no database imports
// Run with: tsx scripts/test-registry-only.ts

import {
  getAllProcessBuilders,
  getProcessBuilder,
} from "../process-builders/core/registry";
import { ProcessBuilderExecutor } from "../process-builders/core/executor";
import {
  validateGoal,
  validateRules,
} from "../process-builders/core/validation";
import type {
  ProcessBuilderGoal,
  ProcessBuilderRules,
  ProcessBuilderTask,
} from "../process-builders/core/types";

async function testRegistry() {
  console.log("\n📋 Testing Registry...");

  try {
    const allBuilders = await getAllProcessBuilders();
    console.log(`✓ Found ${allBuilders.length} process builder(s)`);

    for (const builder of allBuilders) {
      console.log(`  - ${builder.name} (${builder.id}) v${builder.version}`);
      console.log(`    Tasks: ${builder.tasks.length}`);
      console.log(`    Required rules: ${builder.requiredRules.join(", ")}`);
    }

    // Test getting specific builder
    const triviaBuilder = await getProcessBuilder("build-trivia-set");
    if (triviaBuilder) {
      console.log(`\n✓ Successfully retrieved: ${triviaBuilder.name}`);
      return true;
    } else {
      console.log("\n✗ Failed to retrieve build-trivia-set");
      return false;
    }
  } catch (error) {
    console.error("✗ Registry test failed:", error);
    return false;
  }
}

function testValidation() {
  console.log("\n✅ Testing Validation...");

  try {
    // Test goal validation
    const validGoal: ProcessBuilderGoal = { text: "December Hockey" };
    const validatedGoal = validateGoal(validGoal);
    console.log(`✓ Goal validation passed: "${validatedGoal.text}"`);

    // Test invalid goal
    try {
      validateGoal({ text: "" });
      console.log("✗ Should have failed validation");
      return false;
    } catch (error) {
      console.log("✓ Invalid goal correctly rejected");
    }

    // Test rules validation
    const metadata = {
      id: "test",
      name: "Test",
      description: "Test",
      version: "1.0.0",
      tasks: [],
      requiredRules: ["questionTypes", "questionCount"],
      optionalRules: [],
    };

    const validRules: ProcessBuilderRules = {
      questionTypes: {
        key: "questionTypes",
        value: ["TMC", "TFT"],
        type: "array",
      },
      questionCount: { key: "questionCount", value: 10, type: "number" },
    };

    const validatedRules = validateRules(validRules, metadata);
    console.log(
      `✓ Rules validation passed: ${Object.keys(validatedRules).length} rules`,
    );

    // Test missing required rule
    try {
      validateRules({ questionTypes: validRules.questionTypes }, metadata);
      console.log("✗ Should have failed validation");
      return false;
    } catch (error) {
      console.log("✓ Missing required rule correctly rejected");
    }

    return true;
  } catch (error) {
    console.error("✗ Validation test failed:", error);
    return false;
  }
}

async function testExecutor() {
  console.log("\n⚙️  Testing Executor...");

  try {
    const mockTask: ProcessBuilderTask = {
      id: "test-task",
      name: "Test Task",
      description: "A test task",
      async execute(context) {
        return {
          success: true,
          data: { message: "Test task executed" },
        };
      },
    };

    const executor = new ProcessBuilderExecutor([mockTask]);
    const goal: ProcessBuilderGoal = { text: "Test Goal" };
    const rules: ProcessBuilderRules = {};

    const result = await executor.execute(goal, rules);

    if (result.status === "success") {
      console.log(
        `✓ Executor test passed: ${result.results.length} task(s) executed`,
      );
      console.log(`  Execution time: ${result.executionTime}ms`);
      return true;
    } else {
      console.log(`✗ Executor test failed: ${result.status}`);
      return false;
    }
  } catch (error) {
    console.error("✗ Executor test failed:", error);
    return false;
  }
}

async function runTests() {
  console.log("🧪 Testing Process Builders Setup (Registry & Core Only)\n");
  console.log("=".repeat(50));

  const results = {
    registry: false,
    validation: false,
    executor: false,
  };

  results.registry = await testRegistry();
  results.validation = testValidation();
  results.executor = await testExecutor();

  console.log("\n" + "=".repeat(50));
  console.log("\n📊 Test Results:");
  console.log(`  Registry:   ${results.registry ? "✅" : "❌"}`);
  console.log(`  Validation: ${results.validation ? "✅" : "❌"}`);
  console.log(`  Executor:   ${results.executor ? "✅" : "❌"}`);

  const allPassed = Object.values(results).every((r) => r);

  if (allPassed) {
    console.log("\n🎉 Core architecture tests passed!");
    console.log(
      "\n📝 Note: Full process builder test requires database connection.",
    );
    console.log("   Architecture is verified and ready to use.");
  } else {
    console.log("\n⚠️  Some tests failed. Check the output above for details.");
  }

  return allPassed;
}

runTests().catch(console.error);
