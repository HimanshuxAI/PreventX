import { runPrediction, FormDataInput } from '../src/lib/mlEngine.ts';

/**
 * Validation Suite for PreventX ML Engine
 * This script verifies that the ensemble models correctly identify 
 * risk factors and protective factors across diverse personas.
 */

// Mock performance.now for Node environment if needed
if (typeof performance === 'undefined') {
  global.performance = { now: () => Date.now() } as any;
}

interface Persona {
  name: string;
  description: string;
  input: FormDataInput;
  expectedRiskLevels: {
    diabetes: 'low' | 'moderate' | 'high' | 'critical';
    hypertension: 'low' | 'moderate' | 'high' | 'critical';
    anemia: 'low' | 'moderate' | 'high' | 'critical';
  };
}

const personas: Persona[] = [
  {
    name: "Persona 1: The Healthy Athlete",
    description: "Young, fit, non-smoker, active, optimal diet, no family history.",
    input: {
      age: "24",
      gender: "Male",
      height: "180",
      weight: "72",
      familyDiabetes: "No",
      familyHypertension: "No",
      familyAnemia: "No",
      exerciseFrequency: "Daily",
      diet: "Mixed",
      sleep: "7–8 hours (recommended)",
      alcohol: "Never",
      smoking: "Never",
      stressLevel: "Low",
      saltIntake: "Low",
      sugarIntake: "Rarely (natural only)",
      waterIntake: "High",
      fattyFood: "Low",
      junkFood: "Never",
      existingConditions: [],
      symptoms: ["No symptoms"],
      diagSugar: "No",
      gestationalDiabetes: "No",
      heavyBleeding: "",
      periodDuration: "",
      homeBP: "115/75",
      fingernailPhoto: null,
      eyelidPhoto: null,
      otherCondition: "",
    },
    expectedRiskLevels: {
      diabetes: 'low',
      hypertension: 'low',
      anemia: 'low'
    }
  },
  {
    name: "Persona 2: The Undiagnosed Diabetic (High Risk)",
    description: "Obese, family history, sedentary, high sugar intake, polyuria/thirst symptoms.",
    input: {
      age: "52",
      gender: "Male",
      height: "170",
      weight: "98", // BMI ~34
      familyDiabetes: "Yes",
      familyHypertension: "Yes",
      familyAnemia: "No",
      exerciseFrequency: "Never",
      diet: "High-Carb",
      sleep: "5–6 hours",
      alcohol: "Occasionally",
      smoking: "Never",
      stressLevel: "High",
      saltIntake: "Moderate",
      sugarIntake: "Daily",
      waterIntake: "Moderate",
      fattyFood: "High",
      junkFood: "Weekly",
      existingConditions: [],
      symptoms: ["Frequent urination", "Excessive thirst", "Blurred vision"],
      diagSugar: "No",
      gestationalDiabetes: "No",
      heavyBleeding: "",
      periodDuration: "",
      homeBP: "135/85",
      fingernailPhoto: null,
      eyelidPhoto: null,
      otherCondition: "",
    },
    expectedRiskLevels: {
      diabetes: 'critical',
      hypertension: 'high',
      anemia: 'low'
    }
  },
  {
    name: "Persona 3: Pathological Hypertension (Critical)",
    description: "Older smoker with high salt intake, chronic stress, and high home BP readings.",
    input: {
      age: "65",
      gender: "Male",
      height: "165",
      weight: "85", // BMI ~31
      familyDiabetes: "No",
      familyHypertension: "Yes",
      familyAnemia: "No",
      exerciseFrequency: "Rarely",
      diet: "Mixed",
      sleep: "Less than 5 hours",
      alcohol: "Frequently",
      smoking: "Yes, regularly",
      stressLevel: "High",
      saltIntake: "High",
      sugarIntake: "Weekly",
      waterIntake: "Low",
      fattyFood: "High",
      junkFood: "Weekly",
      existingConditions: ["Kidney issues"],
      symptoms: ["Frequent headaches or dizziness", "Shortness of breath"],
      diagSugar: "No",
      gestationalDiabetes: "No",
      heavyBleeding: "",
      periodDuration: "",
      homeBP: "165/95", // Stage 2 HTN
      fingernailPhoto: null,
      eyelidPhoto: null,
      otherCondition: "",
    },
    expectedRiskLevels: {
      diabetes: 'moderate',
      hypertension: 'critical',
      anemia: 'low'
    }
  },
  {
    name: "Persona 4: Anemic Female (Nutritional/Clinical)",
    description: "Young female, vegan, heavy menstrual bleeding, fatigue, Pica cravings.",
    input: {
      age: "28",
      gender: "Female",
      height: "162",
      weight: "50", // Low BMI
      familyDiabetes: "No",
      familyHypertension: "No",
      familyAnemia: "Yes",
      exerciseFrequency: "Moderate",
      diet: "Vegan",
      sleep: "7–8 hours (recommended)",
      alcohol: "Never",
      smoking: "Never",
      stressLevel: "Moderate",
      saltIntake: "Low",
      sugarIntake: "Rarely (natural only)",
      waterIntake: "High",
      fattyFood: "Low",
      junkFood: "Never",
      existingConditions: ["Thyroid disorder"],
      symptoms: ["Fatigue or weakness", "Pale skin", "Craving non-food items (e.g., ice, clay)"],
      diagSugar: "No",
      gestationalDiabetes: "No",
      heavyBleeding: "Very heavy",
      periodDuration: "More than 7 days",
      homeBP: "110/70",
      fingernailPhoto: null,
      eyelidPhoto: null,
      otherCondition: "",
    },
    expectedRiskLevels: {
      diabetes: 'low',
      hypertension: 'low',
      anemia: 'critical'
    }
  }
];

function runValidation() {
  console.log("====================================================");
  console.log("🛡️ PREVENT-X ML VALIDATION SUITE");
  console.log("====================================================\n");

  let totalTests = personas.length * 3;
  let passedTests = 0;

  personas.forEach(persona => {
    console.log(`🧪 Testing ${persona.name}...`);
    console.log(`📝 Description: ${persona.description}`);
    
    const results = runPrediction(persona.input);
    
    // Check Diabetes
    const dmPass = results.diabetes.severity === persona.expectedRiskLevels.diabetes;
    if (dmPass) passedTests++;
    console.log(`   [Diabetes] Expected: ${persona.expectedRiskLevels.diabetes}, Predicted: ${results.diabetes.risk}% (${results.diabetes.severity}) - ${dmPass ? '✅' : '❌'}`);
    
    // Check Hypertension
    const htPass = results.hypertension.severity === persona.expectedRiskLevels.hypertension;
    if (htPass) passedTests++;
    console.log(`   [Hypertension] Expected: ${persona.expectedRiskLevels.hypertension}, Predicted: ${results.hypertension.risk}% (${results.hypertension.severity}) - ${htPass ? '✅' : '❌'}`);
    
    // Check Anemia
    const anPass = results.anemia.severity === persona.expectedRiskLevels.anemia;
    if (anPass) passedTests++;
    console.log(`   [Anemia] Expected: ${persona.expectedRiskLevels.anemia}, Predicted: ${results.anemia.risk}% (${results.anemia.severity}) - ${anPass ? '✅' : '❌'}`);
    
    console.log(`   📊 SHAP Explainability (Top 3):`);
    results.diabetes.shapFeatures.slice(0, 3).forEach(f => console.log(`      • ${f.name}: ${f.value > 0 ? '+' : ''}${f.value} SHAP`));
    
    console.log("");
  });

  const accuracy = (passedTests / totalTests) * 100;
  console.log("====================================================");
  console.log(`📈 FINAL VALIDATION SCORE: ${accuracy.toFixed(1)}%`);
  console.log(`✅ Passed: ${passedTests} / ${totalTests}`);
  console.log("====================================================");

  if (accuracy >= 90) {
    console.log("\n🚀 STATUS: MISSION READY (HACKATHON GRADE)");
  } else {
    console.log("\n⚠️ STATUS: TUNING REQUIRED");
  }
}

runValidation();
